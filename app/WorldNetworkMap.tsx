"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ScopeId, StatusTone } from "./platform-model";
import {
  DEMO_AS_OF,
  getAssetFrame,
  getContact,
  getNetworkView,
  networkFrames,
  networkLocations,
  networkScenarios,
  summarizeNetwork,
  transportAssets,
  type CargoLot,
  type GeoPoint,
  type MapLayer,
  type NetworkFrameId,
  type NetworkLocation,
  type NetworkScenarioId,
  type TransferEvent,
  type TransportAsset,
  type TransportCorridor,
  type TransportMode,
} from "./network-operations-model";

type WorldNetworkMapProps = {
  scope: ScopeId;
  category: string;
  currency: string;
  horizon: string;
  movement: "All movements" | "At risk" | "Arriving";
  onMovementChange: (value: "All movements" | "At risk" | "Arriving") => void;
  onOpenRisk: (selection: MapSelectionContext) => void;
  onOpenOptimizer: (selection: MapSelectionContext) => void;
  onOpenFlow: (selection: MapSelectionContext) => void;
  onTrace: (title: string, detail: string, artifact?: string) => void;
};

type Selection = { kind: "corridor" | "asset" | "cargo" | "location" | "transfer"; id: string };
export type MapSelectionContext = {
  kind: Selection["kind"];
  id: string;
  label: string;
  frame: NetworkFrameId;
  scenario: NetworkScenarioId;
};
type Camera = { center: GeoPoint; zoom: number; label: string };
type RegionPreset = { label: string; center: GeoPoint; zoom: number };
type MoneyFormatter = (value: number) => string;

const WORLD_WIDTH = 1000;
const WORLD_HEIGHT = 500;
const allLayers: readonly MapLayer[] = ["Ocean", "Air", "Road", "Rail", "Transfer", "Assets", "Cargo", "Locations"];
const regionPresets: readonly RegionPreset[] = [
  { label: "World", center: [0, 12], zoom: 1 },
  { label: "Americas", center: [-86, 22], zoom: 1.85 },
  { label: "Europe", center: [12, 48], zoom: 3.2 },
  { label: "MEA", center: [37, 17], zoom: 2.45 },
  { label: "APAC", center: [105, 18], zoom: 2.05 },
  { label: "Company footprint", center: [22, 20], zoom: 1.28 },
];

const scopeMapLabels: Record<ScopeId, string> = {
  global: "GLOBAL NETWORK RADAR",
  region: "REGIONAL NETWORK RADAR",
  company: "COMPANY NETWORK RADAR",
};

function initialCamera(scope: ScopeId): Camera {
  const label = scope === "region" ? "APAC" : scope === "company" ? "Company footprint" : "World";
  const preset = regionPresets.find((item) => item.label === label) ?? regionPresets[0];
  return { center: preset.center, zoom: preset.zoom, label: preset.label };
}

function horizonFrame(horizon: string): NetworkFrameId {
  if (horizon === "7 days") return "t+7d";
  if (horizon === "30 days") return "t+30d";
  if (horizon === "90 days") return "t+90d";
  return "live";
}

type GeoJsonGeometry = { type: "Polygon" | "MultiPolygon"; coordinates: number[][][] | number[][][][] };
type GeoJsonFeatureCollection = { features: readonly { geometry: GeoJsonGeometry | null }[] };

const modeGlyph: Record<TransportMode, string> = { Ocean: "V", Air: "A", Road: "T", Rail: "R", Transfer: "X" };

function project(point: GeoPoint): readonly [number, number] {
  return [((point[0] + 180) / 360) * WORLD_WIDTH, ((90 - point[1]) / 180) * WORLD_HEIGHT];
}

function cameraViewBox(camera: Camera) {
  const [cx, cy] = project(camera.center);
  const width = WORLD_WIDTH / camera.zoom;
  const height = WORLD_HEIGHT / camera.zoom;
  return {
    x: Math.max(0, Math.min(WORLD_WIDTH - width, cx - width / 2)),
    y: Math.max(0, Math.min(WORLD_HEIGHT - height, cy - height / 2)),
    width,
    height,
  };
}

function ringPath(ring: readonly number[][]) {
  return ring.map((coordinate, index) => {
    const [x, y] = project([coordinate[0], coordinate[1]]);
    return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
  }).join(" ") + " Z";
}

function geographyPaths(collection: GeoJsonFeatureCollection) {
  return collection.features.flatMap((feature) => {
    if (!feature.geometry) return [];
    if (feature.geometry.type === "Polygon") {
      return [(feature.geometry.coordinates as number[][][]).map(ringPath).join(" ")];
    }
    return (feature.geometry.coordinates as number[][][][]).map((polygon) => polygon.map(ringPath).join(" "));
  });
}

function routePath(points: readonly GeoPoint[]) {
  let output = "";
  points.forEach((point, index) => {
    const [x, y] = project(point);
    const previous = points[index - 1];
    const crossesDateLine = previous && Math.abs(point[0] - previous[0]) > 180;
    output += `${index === 0 || crossesDateLine ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)} `;
  });
  return output.trim();
}

function pointAlongRoute(points: readonly GeoPoint[], progressPercent: number): readonly [number, number] {
  if (points.length < 2) return project(points[0] ?? [0, 0]);
  const segments = points.slice(1).map((point, index) => {
    const previous = points[index];
    let dx = point[0] - previous[0];
    if (Math.abs(dx) > 180) dx += dx > 0 ? -360 : 360;
    const dy = point[1] - previous[1];
    return { previous, point, dx, dy, length: Math.hypot(dx, dy) };
  });
  const total = segments.reduce((sum, segment) => sum + segment.length, 0);
  let remaining = total * Math.max(0, Math.min(100, progressPercent)) / 100;
  for (const segment of segments) {
    if (remaining <= segment.length) {
      const ratio = segment.length ? remaining / segment.length : 0;
      let longitude = segment.previous[0] + segment.dx * ratio;
      if (longitude > 180) longitude -= 360;
      if (longitude < -180) longitude += 360;
      return project([longitude, segment.previous[1] + segment.dy * ratio]);
    }
    remaining -= segment.length;
  }
  return project(points[points.length - 1]);
}

function pointInsideViewBox(point: readonly [number, number], viewBox: ReturnType<typeof cameraViewBox>, padding = 0) {
  return point[0] >= viewBox.x - padding && point[0] <= viewBox.x + viewBox.width + padding && point[1] >= viewBox.y - padding && point[1] <= viewBox.y + viewBox.height + padding;
}

function routeIntersectsViewBox(points: readonly GeoPoint[], viewBox: ReturnType<typeof cameraViewBox>) {
  const projected = points.map(project);
  if (projected.some((point) => pointInsideViewBox(point, viewBox, 12))) return true;
  const xs = projected.map((point) => point[0]);
  const ys = projected.map((point) => point[1]);
  return Math.max(...xs) >= viewBox.x && Math.min(...xs) <= viewBox.x + viewBox.width && Math.max(...ys) >= viewBox.y && Math.min(...ys) <= viewBox.y + viewBox.height;
}

function ToneDot({ tone }: { tone: StatusTone }) {
  return <i className={`tone-dot tone-${tone}`} aria-hidden="true" />;
}

function displayDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC", timeZoneName: "short" }).format(new Date(iso));
}

function formatCargoQuantities(cargo: readonly Pick<CargoLot, "quantity" | "uom">[]) {
  const totals = cargo.reduce<Record<CargoLot["uom"], number>>((result, lot) => {
    result[lot.uom] += lot.quantity;
    return result;
  }, { units: 0, kg: 0, tonnes: 0, pallets: 0 });
  return (Object.entries(totals) as [CargoLot["uom"], number][])
    .filter(([, quantity]) => quantity > 0)
    .map(([uom, quantity]) => `${quantity.toLocaleString()} ${uom}`)
    .join(" · ") || "No cargo lots";
}

function LocationInspector({ location, formatMoney }: { location: NetworkLocation; formatMoney: MoneyFormatter }) {
  return (
    <>
      <div className="radar-inspector-title"><span className={`radar-entity-icon location-${location.kind.replace(" ", "-")}`}>{location.code.slice(-2)}</span><div><p className="kicker">LOCATION · {location.kind.toUpperCase()}</p><h3>{location.name}</h3><span>{location.country} · {location.region}</span></div><ToneDot tone={location.tone} /></div>
      <dl className="radar-facts">
        <div><dt>Throughput capacity</dt><dd>{location.capacityPerDay.toLocaleString()} units/day</dd></div>
        <div><dt>Utilization</dt><dd>{location.utilizationPercent}%</dd></div>
        <div><dt>Median dwell</dt><dd>{location.dwellHours} hours</dd></div>
        <div><dt>Open orders</dt><dd>{location.openOrders.toLocaleString()}</dd></div>
        <div><dt>Value connected</dt><dd>{formatMoney(location.connectedValueUsd)}</dd></div>
        <div><dt>Freshness</dt><dd>{location.freshnessMinutes} min · {location.provenance}</dd></div>
      </dl>
      <div className="radar-owner"><span>ACCOUNTABLE OWNER</span><b>{location.owner}</b><small>All identity and contact data are synthetic.</small></div>
    </>
  );
}

function CorridorInspector({ corridor, assets, cargo, changes, formatMoney }: { corridor: TransportCorridor; assets: readonly TransportAsset[]; cargo: readonly CargoLot[]; changes: readonly { id: string; metric: string; previous: number; current: number; unit: string; reason: string; evidence: string; confidencePercent: number; decisionImpact: string; timestampIso: string }[]; formatMoney: MoneyFormatter }) {
  const from = networkLocations.find((item) => item.id === corridor.from);
  const to = networkLocations.find((item) => item.id === corridor.to);
  return (
    <>
      <div className="radar-inspector-title"><span className={`radar-entity-icon mode-${corridor.mode.toLowerCase()}`}>{modeGlyph[corridor.mode]}</span><div><p className="kicker">CORRIDOR · {corridor.mode.toUpperCase()}</p><h3>{from?.code} → {to?.code}</h3><span>{corridor.service} · {corridor.carrier}</span></div><ToneDot tone={corridor.status} /></div>
      <div className="radar-state-callout"><span>{corridor.observed ? "OBSERVED STATE" : "PROJECTED STATE"}</span><b>{corridor.etaVarianceHours > 0 ? `+${corridor.etaVarianceHours}h ETA variance` : `${Math.abs(corridor.etaVarianceHours)}h ahead`}</b><small>{corridor.observed ? "Observed milestone blend" : "Estimated from synthetic route state"} · {corridor.reliabilityPercent}% reliability</small></div>
      <dl className="radar-facts">
        <div><dt>Committed / capacity</dt><dd>{corridor.committedUnits.toLocaleString()} / {corridor.capacityUnits.toLocaleString()} {corridor.capacityUom}</dd></div>
        <div><dt>Corridor weight / container</dt><dd>{corridor.tonnes.toLocaleString()} t · {corridor.teu.toLocaleString()} TEU</dd></div>
        <div><dt>Corridor cubic volume</dt><dd>{corridor.cubeM3.toLocaleString()} m³</dd></div>
        <div><dt>Goods value</dt><dd>{formatMoney(corridor.goodsValueUsd)}</dd></div>
        <div><dt>Freight / unit</dt><dd>{formatMoney(corridor.freightUsd)} · {formatMoney(corridor.costPerUnitUsd)}</dd></div>
        <div><dt>Carbon / reliability</dt><dd>{corridor.carbonTons} tCO₂e · {corridor.reliabilityPercent}%</dd></div>
        <div><dt>Active assets</dt><dd>{assets.length} tracked sample · {corridor.activeAssets} aggregate</dd></div>
        <div><dt>Frozen decision</dt><dd>{corridor.frozen ? "Yes · approval needed" : "No · replannable"}</dd></div>
      </dl>
      <section className="radar-subsection"><header><span>TRACKED CARGO SAMPLE</span><b>{cargo.length} synthetic lots</b></header>{cargo.slice(0, 3).map((lot) => <article key={lot.id}><div><b>{lot.shipmentRef}</b><small>{lot.description} · {lot.priority}</small></div><strong>{lot.quantity.toLocaleString()} {lot.uom} · {formatMoney(lot.goodsValueUsd)}</strong></article>)}</section>
      <section className="radar-subsection change-ledger"><header><span>LATEST CHANGE LEDGER</span><b>{changes.length} events</b></header>{changes.slice(0, 3).map((change) => <article key={change.id}><ToneDot tone={change.current > change.previous ? "watch" : "opportunity"} /><div><b>{change.metric}: {change.previous} → {change.current} {change.unit}</b><small>{change.reason} · {displayDate(change.timestampIso)}</small><em>{change.evidence} · {change.confidencePercent}% confidence</em></div></article>)}</section>
    </>
  );
}

function AssetInspector({ asset, corridor, cargo, formatMoney }: { asset: TransportAsset; corridor: TransportCorridor; cargo: readonly CargoLot[]; formatMoney: MoneyFormatter }) {
  const contact = getContact(asset.contactId);
  return (
    <>
      <div className="radar-inspector-title"><span className={`radar-entity-icon mode-${corridor.mode.toLowerCase()}`}>{modeGlyph[corridor.mode]}</span><div><p className="kicker">TRACKED {asset.type.toUpperCase()}</p><h3>{asset.demoIdentifier}</h3><span>{asset.operator} · {asset.telemetryState}</span></div><ToneDot tone={corridor.status} /></div>
      <div className="radar-state-callout"><span>{asset.telemetryState === "Projected" ? "PROJECTED POSITION" : "POSITION"}</span><b>{asset.progressPercent}% of corridor · {asset.speed} {asset.speedUnit}</b><small>Heading {asset.headingDegrees}° · {asset.telemetryState === "Projected" ? "derived from the fixed concept clock" : `update ${asset.freshnessMinutes} minutes ago`}</small></div>
      <dl className="radar-facts">
        <div><dt>Next waypoint</dt><dd>{asset.nextWaypoint}</dd></div><div><dt>Predicted ETA</dt><dd>{displayDate(asset.etaIso)}</dd></div>
        <div><dt>Cargo sample</dt><dd>{cargo.length} lots · {formatCargoQuantities(cargo)}</dd></div>
        <div><dt>Weight / cube</dt><dd>{(cargo.reduce((sum, lot) => sum + lot.weightKg, 0) / 1_000).toFixed(1)} t · {cargo.reduce((sum, lot) => sum + lot.cubeM3, 0).toFixed(0)} m³</dd></div>
        <div><dt>Goods value</dt><dd>{formatMoney(cargo.reduce((sum, lot) => sum + lot.goodsValueUsd, 0))}</dd></div>
        {asset.altitudeFt && <div><dt>Altitude</dt><dd>{asset.altitudeFt.toLocaleString()} ft</dd></div>}
        {asset.draughtM && <div><dt>Draught</dt><dd>{asset.draughtM} m</dd></div>}
        {asset.wagonCount && <div><dt>Train consist</dt><dd>{asset.wagonCount} wagons</dd></div>}
        {asset.temperatureC && <div><dt>Trailer temperature</dt><dd>{asset.temperatureC}°C</dd></div>}
      </dl>
      {contact && <div className="radar-owner"><span>SYNTHETIC OPERATIONS CONTACT</span><b>{contact.name}</b><small>{contact.role} · {contact.availability} · {contact.channel}</small></div>}
    </>
  );
}

function CargoInspector({ cargo, asset, corridor, formatMoney }: { cargo: CargoLot; asset: TransportAsset | undefined; corridor: TransportCorridor | undefined; formatMoney: MoneyFormatter }) {
  const contact = asset ? getContact(asset.contactId) : undefined;
  const from = corridor ? networkLocations.find((item) => item.id === corridor.from) : undefined;
  const to = corridor ? networkLocations.find((item) => item.id === corridor.to) : undefined;
  return (
    <>
      <div className="radar-inspector-title"><span className="radar-entity-icon mode-cargo">C</span><div><p className="kicker">CARGO LOT · {cargo.priority.toUpperCase()}</p><h3>{cargo.shipmentRef}</h3><span>{cargo.description} · {cargo.sku}</span></div><ToneDot tone={cargo.priority === "Production critical" ? "critical" : cargo.priority === "Customer promise" ? "watch" : "healthy"} /></div>
      <div className="radar-state-callout"><span>LINKED MOVEMENT</span><b>{asset?.demoIdentifier ?? cargo.assetId}</b><small>{from?.code ?? corridor?.from} → {to?.code ?? corridor?.to} · {corridor?.service ?? cargo.corridorId}</small></div>
      <dl className="radar-facts">
        <div><dt>Quantity</dt><dd>{cargo.quantity.toLocaleString()} {cargo.uom}</dd></div>
        <div><dt>Weight / cube</dt><dd>{(cargo.weightKg / 1_000).toFixed(1)} t · {cargo.cubeM3.toFixed(1)} m³</dd></div>
        <div><dt>Unit / goods value</dt><dd>{formatMoney(cargo.unitPriceUsd)} · {formatMoney(cargo.goodsValueUsd)}</dd></div>
        <div><dt>Freight / duty</dt><dd>{formatMoney(cargo.freightUsd)} · {formatMoney(cargo.dutyUsd)}</dd></div>
        <div><dt>Margin exposed</dt><dd>{formatMoney(cargo.marginExposureUsd)}</dd></div>
        <div><dt>Orders / program</dt><dd>{cargo.orderCount} · {cargo.customerProgram}</dd></div>
        <div><dt>Trade terms</dt><dd>{cargo.incoterm}</dd></div>
        <div><dt>Control</dt><dd>{cargo.control}</dd></div>
      </dl>
      {contact && <div className="radar-owner"><span>SYNTHETIC MOVEMENT CONTACT</span><b>{contact.name}</b><small>{contact.role} · {contact.availability} · {contact.channel}</small></div>}
    </>
  );
}

function TransferInspector({ transfer, formatMoney }: { transfer: TransferEvent; formatMoney: MoneyFormatter }) {
  const location = networkLocations.find((item) => item.id === transfer.locationId);
  const contact = getContact(transfer.contactId);
  return (
    <>
      <div className="radar-inspector-title"><span className="radar-entity-icon mode-transfer">X</span><div><p className="kicker">TRANSFER EVENT</p><h3>{transfer.id.toUpperCase()}</h3><span>{location?.name} · {transfer.status}</span></div><ToneDot tone={transfer.status === "Customs hold" ? "critical" : transfer.status === "In progress" ? "watch" : "healthy"} /></div>
      <dl className="radar-facts"><div><dt>Inbound asset</dt><dd>{transfer.inboundAssetId}</dd></div><div><dt>Outbound asset</dt><dd>{transfer.outboundAssetId}</dd></div><div><dt>Quantity / value</dt><dd>{transfer.quantityUnits.toLocaleString()} {transfer.quantityUom} · {formatMoney(transfer.goodsValueUsd)}</dd></div><div><dt>Linked cargo</dt><dd>{transfer.cargoLotId}</dd></div><div><dt>Projected handoff</dt><dd>{displayDate(transfer.projectedIso)}</dd></div><div><dt>Dwell / cutoff</dt><dd>{transfer.dwellHours}h · {displayDate(transfer.cutoffIso)}</dd></div></dl>
      {contact && <div className="radar-owner"><span>SYNTHETIC CUSTODIAN</span><b>{contact.name}</b><small>{contact.role} · {contact.channel}</small></div>}
    </>
  );
}

export default function WorldNetworkMap({ scope, category, currency, horizon, movement, onMovementChange, onOpenRisk, onOpenOptimizer, onOpenFlow, onTrace }: WorldNetworkMapProps) {
  const [frameSelection, setFrameSelection] = useState<{ horizon: string; frame: NetworkFrameId } | null>(null);
  const frame = frameSelection?.horizon === horizon ? frameSelection.frame : horizonFrame(horizon);
  const [scenario, setScenario] = useState<NetworkScenarioId>("trajectory");
  const [layers, setLayers] = useState<Set<MapLayer>>(() => new Set(allLayers));
  const [cameraState, setCameraState] = useState<{ scope: ScopeId; camera: Camera }>(() => ({ scope, camera: initialCamera(scope) }));
  const camera = cameraState.scope === scope ? cameraState.camera : initialCamera(scope);
  const selectionViewKey = `${scope}|${frame}|${scenario}|${category}|${movement}|${[...layers].sort().join(",")}`;
  const [selectionState, setSelectionState] = useState<{ viewKey: string; value: Selection } | null>(null);
  const [hoverState, setHoverState] = useState<{ viewKey: string; value: Selection } | null>(null);
  const selection = selectionState?.viewKey === selectionViewKey ? selectionState.value : null;
  const hover = hoverState?.viewKey === selectionViewKey ? hoverState.value : null;
  const [engaged, setEngaged] = useState(false);
  const [viewMode, setViewMode] = useState<"Map" | "List">("Map");
  const [listEntity, setListEntity] = useState<"Corridors" | "Locations" | "Assets" | "Cargo" | "Transfers">("Corridors");
  const [landPaths, setLandPaths] = useState<readonly string[]>([]);
  const [mapError, setMapError] = useState(false);
  const [playing, setPlaying] = useState(false);
  const pointerStart = useRef<{ x: number; y: number; center: GeoPoint } | null>(null);
  const setCamera = (next: Camera | ((current: Camera) => Camera)) => setCameraState((currentState) => {
    const current = currentState.scope === scope ? currentState.camera : initialCamera(scope);
    return { scope, camera: typeof next === "function" ? next(current) : next };
  });
  const setSelection = (next: Selection | null) => setSelectionState(next ? { viewKey: selectionViewKey, value: next } : null);
  const setHover = (next: Selection | null) => setHoverState(next ? { viewKey: selectionViewKey, value: next } : null);

  useEffect(() => {
    let active = true;
    fetch("/maps/ne_110m_land.geojson")
      .then((response) => {
        if (!response.ok) throw new Error("Map geography unavailable");
        return response.json() as Promise<GeoJsonFeatureCollection>;
      })
      .then((collection) => { if (active) setLandPaths(geographyPaths(collection)); })
      .catch(() => { if (active) setMapError(true); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setFrameSelection((current) => {
        const currentFrame = current?.horizon === horizon ? current.frame : horizonFrame(horizon);
        return { horizon, frame: networkFrames[(networkFrames.findIndex((item) => item.id === currentFrame) + 1) % networkFrames.length].id };
      });
    }, 1600);
    return () => window.clearInterval(timer);
  }, [horizon, playing]);

  const view = useMemo(() => getNetworkView({ scope, frame, scenario, category, movement, layers }), [scope, frame, scenario, category, movement, layers]);
  const summary = useMemo(() => summarizeNetwork(view), [view]);
  const viewBox = useMemo(() => cameraViewBox(camera), [camera]);
  const corridorById = useMemo(() => new Map(view.corridors.map((corridor) => [corridor.id, corridor])), [view.corridors]);
  const baseAssetById = useMemo(() => new Map(transportAssets.map((asset) => [asset.id, asset])), []);
  const mapCorridors = useMemo(() => view.corridors.filter((corridor) => (camera.zoom >= 1.55 || corridor.mode === "Ocean" || corridor.mode === "Air") && routeIntersectsViewBox(corridor.waypoints, viewBox)), [camera.zoom, view.corridors, viewBox]);
  const mapCorridorIds = useMemo(() => new Set(mapCorridors.map((corridor) => corridor.id)), [mapCorridors]);
  const mapLocations = useMemo(() => camera.zoom >= 1.45 ? view.locations.filter((location) => pointInsideViewBox(project(location.coordinates), viewBox, 8)) : [], [camera.zoom, view.locations, viewBox]);
  const mapAssets = useMemo(() => camera.zoom >= 2.1 ? view.assets.filter((asset) => {
    const corridor = corridorById.get(asset.corridorId);
    return Boolean(corridor && mapCorridorIds.has(corridor.id) && pointInsideViewBox(pointAlongRoute(corridor.waypoints, asset.progressPercent), viewBox, 8));
  }).slice(0, camera.zoom >= 3.8 ? view.assets.length : 58) : [], [camera.zoom, corridorById, mapCorridorIds, view.assets, viewBox]);
  const selectedCorridor = selection?.kind === "corridor" ? corridorById.get(selection.id) : undefined;
  const selectedAsset = selection?.kind === "asset" ? view.assets.find((asset) => asset.id === selection.id) : undefined;
  const assetCorridor = selectedAsset ? corridorById.get(selectedAsset.corridorId) : undefined;
  const selectedCargo = selection?.kind === "cargo" ? view.cargo.find((cargo) => cargo.id === selection.id) : undefined;
  const cargoCorridor = selectedCargo ? corridorById.get(selectedCargo.corridorId) : undefined;
  const cargoBaseAsset = selectedCargo ? baseAssetById.get(selectedCargo.assetId) : undefined;
  const cargoAsset = cargoBaseAsset && cargoCorridor ? getAssetFrame(cargoBaseAsset, cargoCorridor) : undefined;
  const selectedLocation = selection?.kind === "location" ? view.locations.find((location) => location.id === selection.id) : undefined;
  const selectedTransfer = selection?.kind === "transfer" ? view.transfers.find((transfer) => transfer.id === selection.id) : undefined;
  const hoverCorridor = hover?.kind === "corridor" ? corridorById.get(hover.id) : hover?.kind === "asset" ? corridorById.get(view.assets.find((asset) => asset.id === hover.id)?.corridorId ?? "") : undefined;
  const hoverAsset = hover?.kind === "asset" ? view.assets.find((asset) => asset.id === hover.id) : undefined;
  const hoverCargo = hover?.kind === "cargo" ? view.cargo.find((cargo) => cargo.id === hover.id) : undefined;
  const hoverLocation = hover?.kind === "location" ? view.locations.find((location) => location.id === hover.id) : undefined;
  const hoverTransfer = hover?.kind === "transfer" ? view.transfers.find((transfer) => transfer.id === hover.id) : undefined;
  const mapCargo = useMemo(() => camera.zoom >= 3.35 ? view.cargo.filter((cargo) => {
    const corridor = corridorById.get(cargo.corridorId);
    const baseAsset = baseAssetById.get(cargo.assetId);
    if (!corridor || !baseAsset || !mapCorridorIds.has(corridor.id)) return false;
    const asset = getAssetFrame(baseAsset, corridor);
    return pointInsideViewBox(pointAlongRoute(corridor.waypoints, asset.progressPercent), viewBox, 8);
  }).slice(0, camera.zoom >= 4.8 ? 120 : 48) : [], [baseAssetById, camera.zoom, corridorById, mapCorridorIds, view.cargo, viewBox]);
  const mapTransfers = useMemo(() => camera.zoom >= 2.4 ? view.transfers.filter((transfer) => {
    const location = networkLocations.find((item) => item.id === transfer.locationId);
    return Boolean(location && pointInsideViewBox(project(location.coordinates), viewBox, 10));
  }).slice(0, camera.zoom >= 4 ? view.transfers.length : 24) : [], [camera.zoom, view.transfers, viewBox]);
  const selectionContext = useMemo<MapSelectionContext | null>(() => {
    if (!selection) return null;
    if (selectedCorridor) return { ...selection, label: `${selectedCorridor.from.toUpperCase()} → ${selectedCorridor.to.toUpperCase()}`, frame, scenario };
    if (selectedAsset) return { ...selection, label: selectedAsset.demoIdentifier, frame, scenario };
    if (selectedCargo) return { ...selection, label: selectedCargo.shipmentRef, frame, scenario };
    if (selectedLocation) return { ...selection, label: selectedLocation.name, frame, scenario };
    if (selectedTransfer) return { ...selection, label: selectedTransfer.id.toUpperCase(), frame, scenario };
    return null;
  }, [frame, scenario, selection, selectedAsset, selectedCargo, selectedCorridor, selectedLocation, selectedTransfer]);

  const changeZoom = (delta: number) => setCamera((current) => ({ ...current, zoom: Math.max(1, Math.min(6, Number((current.zoom + delta).toFixed(2)))), label: "Custom view" }));
  const focusRegion = (preset: RegionPreset) => setCamera({ center: preset.center, zoom: preset.zoom, label: preset.label });
  const resetCamera = () => setCamera(initialCamera(scope));
  const toggleLayer = (layer: MapLayer) => setLayers((current) => {
    const next = new Set(current);
    if (next.has(layer)) next.delete(layer); else next.add(layer);
    return next;
  });

  const onPointerDown = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!engaged) return;
    pointerStart.current = { x: event.clientX, y: event.clientY, center: camera.center };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: React.PointerEvent<SVGSVGElement>) => {
    if (!engaged || !pointerStart.current) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const longitudeDelta = -(event.clientX - pointerStart.current.x) / rect.width * 360 / camera.zoom;
    const latitudeDelta = (event.clientY - pointerStart.current.y) / rect.height * 180 / camera.zoom;
    setCamera((current) => ({ ...current, center: [Math.max(-180, Math.min(180, pointerStart.current!.center[0] + longitudeDelta)), Math.max(-70, Math.min(75, pointerStart.current!.center[1] + latitudeDelta))], label: "Custom view" }));
  };
  const onPointerUp = (event: React.PointerEvent<SVGSVGElement>) => {
    pointerStart.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const onKeyDown = (event: React.KeyboardEvent<SVGSVGElement>) => {
    if (event.key === "Escape") { setEngaged(false); return; }
    if (!engaged) return;
    if (event.key === "+" || event.key === "=") { event.preventDefault(); changeZoom(.35); }
    if (event.key === "-") { event.preventDefault(); changeZoom(-.35); }
    if (event.key === "0") { event.preventDefault(); resetCamera(); }
    const amount = 8 / camera.zoom;
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) {
      event.preventDefault();
      setCamera((current) => ({
        ...current,
        center: [
          Math.max(-180, Math.min(180, current.center[0] + (event.key === "ArrowLeft" ? -amount : event.key === "ArrowRight" ? amount : 0))),
          Math.max(-70, Math.min(75, current.center[1] + (event.key === "ArrowDown" ? -amount : event.key === "ArrowUp" ? amount : 0))),
        ],
        label: "Custom view",
      }));
    }
  };

  const select = (next: Selection) => { setSelection(next); setHover(null); };
  const inspectFromList = (next: Selection) => { select(next); setViewMode("Map"); };
  const frameDetail = networkFrames.find((item) => item.id === frame);
  const scenarioDetail = networkScenarios.find((item) => item.id === scenario);
  const currencyRate = currency === "EUR" ? .92 : currency === "INR" ? 83.8 : 1;
  const formatMoney = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency, notation: "compact", maximumFractionDigits: 1 }).format(value * currencyRate);
  const traceSelection = () => {
    if (selectedCorridor) onTrace(`${selectedCorridor.service} corridor evidence opened`, `${selectedCorridor.committedUnits.toLocaleString()} ${selectedCorridor.capacityUom} committed of ${selectedCorridor.capacityUnits.toLocaleString()} capacity · ${selectedCorridor.tonnes.toLocaleString()} t · ${formatMoney(selectedCorridor.goodsValueUsd)} goods · ${formatMoney(selectedCorridor.freightUsd)} freight · ${selectedCorridor.etaVarianceHours}h ETA variance · ${selectedCorridor.reliabilityPercent}% fixture reliability.`, selectedCorridor.id);
    else if (selectedAsset) onTrace(`${selectedAsset.demoIdentifier} asset evidence opened`, `${selectedAsset.progressPercent}% route progress · ${selectedAsset.speed} ${selectedAsset.speedUnit} · ${selectedAsset.cargoCount} synthetic cargo lots · ${selectedAsset.telemetryState} telemetry fixture · frame ${frame} · scenario ${scenario}.`, selectedAsset.id);
    else if (selectedCargo) onTrace(`${selectedCargo.shipmentRef} cargo evidence opened`, `${selectedCargo.quantity.toLocaleString()} ${selectedCargo.uom} · ${(selectedCargo.weightKg / 1_000).toFixed(1)} t · ${selectedCargo.cubeM3.toFixed(1)} m³ · ${formatMoney(selectedCargo.goodsValueUsd)} goods · ${formatMoney(selectedCargo.marginExposureUsd)} fixture margin exposure.`, selectedCargo.id);
    else if (selectedLocation) onTrace(`${selectedLocation.name} location evidence opened`, `${selectedLocation.capacityPerDay.toLocaleString()} units/day fixture capacity · ${selectedLocation.utilizationPercent}% utilization · ${selectedLocation.dwellHours}h dwell · ${selectedLocation.openOrders.toLocaleString()} illustrative orders · ${formatMoney(selectedLocation.connectedValueUsd)} connected value.`, selectedLocation.id);
    else if (selectedTransfer) onTrace(`${selectedTransfer.id.toUpperCase()} transfer evidence opened`, `${selectedTransfer.quantityUnits.toLocaleString()} ${selectedTransfer.quantityUom} · ${formatMoney(selectedTransfer.goodsValueUsd)} goods value · ${selectedTransfer.dwellHours}h dwell · ${selectedTransfer.status} · deterministic transfer fixture.`, selectedTransfer.id);
  };

  return (
    <section className="network-radar" aria-labelledby="network-radar-title">
      <header className="radar-titlebar">
        <div><p className="kicker">{scopeMapLabels[scope]} · SYNTHETIC DIGITAL TWIN</p><h2 id="network-radar-title">Multimodal value, cargo, transfers, and commitments</h2><span>Geography: Natural Earth 1:110m land · Roads and rail are operationally representative, not turn-by-turn navigation.</span></div>
        <div className="radar-asof"><ToneDot tone="healthy" /><span><b>AS OF 04 SEP 2026 · 15:00 IST</b><small>{DEMO_AS_OF} · fixed concept clock</small></span></div>
      </header>

      <div className="radar-toolbar" aria-label="Network map controls">
        <div className="radar-view-toggle" role="group" aria-label="Map or list view"><button className={viewMode === "Map" ? "active" : ""} type="button" onClick={() => setViewMode("Map")}>Map</button><button className={viewMode === "List" ? "active" : ""} type="button" onClick={() => setViewMode("List")}>List</button></div>
        <label>Scenario<select value={scenario} onChange={(event) => setScenario(event.target.value as NetworkScenarioId)}>{networkScenarios.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}</select></label>
        <div className="radar-movement-filter" role="group" aria-label="Movement state">{(["All movements", "At risk", "Arriving"] as const).map((item) => <button className={movement === item ? "active" : ""} type="button" key={item} onClick={() => onMovementChange(item)}>{item}</button>)}</div>
        <button className={`map-engage ${engaged ? "active" : ""}`} type="button" aria-pressed={engaged} onClick={() => setEngaged((current) => !current)}>{engaged ? "Map engaged · Esc releases" : "Engage map controls"}</button>
      </div>

      <div className="radar-kpis" aria-label="Filtered network map metrics">
        <button type="button" onClick={() => onTrace("Tracked asset-sample evidence opened", `${summary.movements} synthetic assets · ${summary.delayed} on watch or critical corridors · scope ${scope} · frame ${frame} · scenario ${scenario}.`, `MAP-${scope.toUpperCase()}-${frame}-ASSETS`)}><span>Tracked asset sample</span><b>{summary.movements}</b><small>{summary.delayed} on watch / critical corridors · ◇ trace</small></button>
        <button type="button" onClick={() => onTrace("Tracked cargo-sample evidence opened", `${summary.cargoLots} synthetic lots · ${summary.tonnes.toLocaleString()} t · ${summary.cubeM3.toLocaleString()} m³ · filtered deterministic fixture.`, `MAP-${scope.toUpperCase()}-${frame}-CARGO`)}><span>Tracked cargo sample</span><b>{summary.cargoLots} lots</b><small>{summary.tonnes.toLocaleString()} t · {summary.cubeM3.toLocaleString()} m³ · ◇ trace</small></button>
        <button type="button" onClick={() => onTrace("Corridor goods-value evidence opened", `${formatMoney(summary.goodsValueUsd)} illustrative goods value · ${formatMoney(summary.marginExposureUsd)} tracked-sample margin exposure · currency display ${currency} · deterministic fixture.`, `MAP-${scope.toUpperCase()}-${frame}-VALUE`)}><span>Corridor goods value · {currency}</span><b>{formatMoney(summary.goodsValueUsd)}</b><small>{formatMoney(summary.marginExposureUsd)} tracked-sample margin exposed · ◇ trace</small></button>
        <button type="button" onClick={() => onTrace("Freight-exposure evidence opened", `${formatMoney(summary.freightUsd)} illustrative freight · ${summary.averageEtaVarianceHours.toFixed(1)}h mean ETA variance · frame ${frame} · scenario ${scenario}.`, `MAP-${scope.toUpperCase()}-${frame}-FREIGHT`)}><span>Freight exposure · {currency}</span><b>{formatMoney(summary.freightUsd)}</b><small>{summary.averageEtaVarianceHours >= 0 ? "+" : ""}{summary.averageEtaVarianceHours.toFixed(1)}h mean ETA variance · ◇ trace</small></button>
      </div>

      <div className="radar-regionbar"><span>FOCUS REGION</span>{regionPresets.map((preset) => <button className={camera.label === preset.label ? "active" : ""} type="button" key={preset.label} onClick={() => focusRegion(preset)}>{preset.label}</button>)}<div className="radar-zoom"><button type="button" aria-label="Zoom out" onClick={() => changeZoom(-.35)}>−</button><span>{camera.zoom.toFixed(1)}×</span><button type="button" aria-label="Zoom in" onClick={() => changeZoom(.35)}>+</button><button type="button" onClick={resetCamera}>Reset</button></div></div>
      <div className="radar-layerbar"><span>VISIBLE LAYERS</span>{allLayers.map((layer) => <button className={`layer-${layer.toLowerCase()} ${layers.has(layer) ? "active" : ""}`} aria-pressed={layers.has(layer)} type="button" key={layer} onClick={() => toggleLayer(layer)}><i />{layer}</button>)}<small>{camera.zoom < 1.5 ? "Low zoom: corridor overview" : camera.zoom < 2.5 ? "Medium zoom: hubs + major assets" : camera.zoom < 4 ? "High zoom: all tracked assets" : "Detail zoom: cargo and transfer context"}</small></div>

      {viewMode === "Map" ? (
        <div className="radar-map-layout">
          <div className={`network-map radar-map ${engaged ? "is-engaged" : ""}`}>
            <svg
              aria-label={`Interactive logistics map focused on ${camera.label}. Rendered in this viewport: ${mapCorridors.length} corridors, ${mapLocations.length} locations, ${mapAssets.length} tracked assets, ${mapCargo.length} cargo lots, and ${mapTransfers.length} transfers.`}
              className="radar-svg"
              onKeyDown={onKeyDown}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onWheel={(event) => { if (!engaged) return; event.preventDefault(); changeZoom(event.deltaY < 0 ? .25 : -.25); }}
              tabIndex={0}
              viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
            >
              <defs>
                <pattern id="radar-grid" width="50" height="50" patternUnits="userSpaceOnUse"><path d="M 50 0 L 0 0 0 50" fill="none" stroke="currentColor" strokeWidth=".55" /></pattern>
                <filter id="radar-glow"><feGaussianBlur stdDeviation="2" result="coloredBlur" /><feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>
              <rect className="radar-ocean" width={WORLD_WIDTH} height={WORLD_HEIGHT} />
              <rect className="radar-grid" width={WORLD_WIDTH} height={WORLD_HEIGHT} fill="url(#radar-grid)" />
              <g className="radar-land" aria-hidden="true">{landPaths.map((path, index) => <path d={path} key={index} />)}</g>
              {mapError && <text className="radar-map-error" x="500" y="245" textAnchor="middle">Geography asset unavailable · logistics layers remain inspectable</text>}
              <g className="radar-corridors">
                {mapCorridors.map((corridor) => {
                  const selectionValue: Selection = { kind: "corridor", id: corridor.id };
                  const active = selection?.kind === "corridor" && selection.id === corridor.id;
                  return <g className={`corridor corridor-${corridor.mode.toLowerCase()} corridor-${corridor.status} ${active ? "selected" : ""}`} key={corridor.id} onMouseEnter={() => setHover(selectionValue)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(selectionValue)} onBlur={() => setHover(null)} onClick={(event) => { event.stopPropagation(); select(selectionValue); }} role="button" tabIndex={0} aria-label={`${corridor.mode} corridor ${corridor.from} to ${corridor.to}, ${corridor.committedUnits.toLocaleString()} ${corridor.capacityUom} committed, ${formatMoney(corridor.goodsValueUsd)}, ${corridor.status}`} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(selectionValue); } }}><path className="corridor-hit" d={routePath(corridor.waypoints)} /><path className="corridor-line" d={routePath(corridor.waypoints)} /><path className="corridor-pulse" d={routePath(corridor.waypoints)} /></g>;
                })}
              </g>
              {mapLocations.length > 0 && <g className="radar-locations">{mapLocations.map((location) => {
                const [x, y] = project(location.coordinates); const item: Selection = { kind: "location", id: location.id };
                return <g className={`radar-location radar-location-${location.tone} ${selection?.kind === "location" && selection.id === location.id ? "selected" : ""}`} key={location.id} transform={`translate(${x} ${y})`} role="button" tabIndex={0} aria-label={`${location.name}, ${location.kind}, ${location.utilizationPercent}% utilized`} onMouseEnter={() => setHover(item)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(item)} onBlur={() => setHover(null)} onClick={(event) => { event.stopPropagation(); select(item); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(item); } }}><circle className="location-ring" r={camera.zoom >= 3 ? 6 : 4.8} /><circle className="location-core" r={camera.zoom >= 3 ? 2.4 : 1.8} />{camera.zoom >= 2.45 && <text x="7" y="3">{location.code}</text>}</g>;
              })}</g>}
              {mapAssets.length > 0 && <g className="radar-assets">{mapAssets.map((asset) => {
                const corridor = corridorById.get(asset.corridorId); if (!corridor) return null;
                const [x, y] = pointAlongRoute(corridor.waypoints, asset.progressPercent); const item: Selection = { kind: "asset", id: asset.id };
                return <g className={`radar-asset radar-asset-${corridor.mode.toLowerCase()} radar-asset-${corridor.status} ${selection?.kind === "asset" && selection.id === asset.id ? "selected" : ""}`} key={asset.id} transform={`translate(${x} ${y}) rotate(${asset.headingDegrees})`} role="button" tabIndex={0} aria-label={`${asset.type} ${asset.demoIdentifier}, ${asset.progressPercent}% complete, ${asset.speed} ${asset.speedUnit}`} onMouseEnter={() => setHover(item)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(item)} onBlur={() => setHover(null)} onClick={(event) => { event.stopPropagation(); select(item); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(item); } }}><circle className="asset-hit" r="7" /><path d="M-3,-2 L4,0 L-3,2 Z" /><title>{asset.demoIdentifier}</title></g>;
              })}</g>}
              {mapCargo.length > 0 && <g className="radar-cargo-lots">{mapCargo.map((cargo, index) => {
                const baseAsset = baseAssetById.get(cargo.assetId); const corridor = corridorById.get(cargo.corridorId); if (!baseAsset || !corridor) return null;
                const asset = getAssetFrame(baseAsset, corridor);
                const [x, y] = pointAlongRoute(corridor.waypoints, asset.progressPercent); const offsetX = (index % 4 - 1.5) * 2.5; const offsetY = (Math.floor(index / 4) % 3 - 1) * 2.5; const item: Selection = { kind: "cargo", id: cargo.id };
                return <g className={`radar-cargo radar-cargo-${cargo.priority.toLowerCase().replaceAll(" ", "-")} ${selection?.kind === "cargo" && selection.id === cargo.id ? "selected" : ""}`} key={cargo.id} transform={`translate(${x + offsetX} ${y + offsetY})`} role="button" tabIndex={0} aria-label={`Cargo ${cargo.shipmentRef}, ${cargo.quantity} ${cargo.uom}, ${formatMoney(cargo.goodsValueUsd)}, ${cargo.priority}`} onMouseEnter={() => setHover(item)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(item)} onBlur={() => setHover(null)} onClick={(event) => { event.stopPropagation(); select(item); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(item); } }}><circle className="cargo-hit" r="6" /><rect x="-2.2" y="-2.2" width="4.4" height="4.4" /><title>{cargo.shipmentRef} · {cargo.description}</title></g>;
              })}</g>}
              {mapTransfers.length > 0 && <g className="radar-transfers">{mapTransfers.map((transfer) => {
                const location = networkLocations.find((item) => item.id === transfer.locationId); if (!location) return null; const [x, y] = project(location.coordinates); const item: Selection = { kind: "transfer", id: transfer.id };
                return <g className={`radar-transfer transfer-${transfer.status.toLowerCase().replaceAll(" ", "-")} ${selection?.kind === "transfer" && selection.id === transfer.id ? "selected" : ""}`} key={transfer.id} transform={`translate(${x + (Number(transfer.id.slice(-2)) % 5) * 2} ${y + 7})`} role="button" tabIndex={0} aria-label={`${transfer.status} transfer at ${location.name}, ${transfer.quantityUnits.toLocaleString()} ${transfer.quantityUom}, ${formatMoney(transfer.goodsValueUsd)}`} onMouseEnter={() => setHover(item)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(item)} onBlur={() => setHover(null)} onClick={(event) => { event.stopPropagation(); select(item); }} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(item); } }}><rect x="-2.5" y="-2.5" width="5" height="5" transform="rotate(45)" /></g>;
              })}</g>}
            </svg>
            <div className="radar-map-hud"><span>{engaged ? "DRAG TO PAN · SCROLL TO ZOOM · ESC TO RELEASE" : "PAGE SCROLL IS FREE · ENGAGE MAP TO PAN / ZOOM"}</span><b>{camera.label} · {camera.zoom.toFixed(1)}× · {mapCorridors.length} corridors · {mapAssets.length} assets</b></div>
            {(hoverCorridor || hoverAsset || hoverCargo || hoverLocation || hoverTransfer) && <div className="radar-hovercard" role="tooltip">{hoverAsset && <><span>{hoverAsset.type.toUpperCase()} · {hoverAsset.telemetryState}</span><b>{hoverAsset.demoIdentifier}</b><small>{hoverAsset.progressPercent}% · {hoverAsset.speed} {hoverAsset.speedUnit} · {hoverAsset.telemetryState === "Projected" ? "scenario-frame projection" : `${hoverAsset.freshnessMinutes}m old`}</small></>}{hoverCargo && <><span>CARGO · {hoverCargo.priority.toUpperCase()}</span><b>{hoverCargo.shipmentRef} · {hoverCargo.sku}</b><small>{hoverCargo.quantity.toLocaleString()} {hoverCargo.uom} · {(hoverCargo.weightKg / 1_000).toFixed(1)} t · {hoverCargo.cubeM3.toFixed(1)} m³ · {formatMoney(hoverCargo.goodsValueUsd)}</small></>}{hoverTransfer && <><span>TRANSFER · {hoverTransfer.status.toUpperCase()}</span><b>{hoverTransfer.id.toUpperCase()}</b><small>{hoverTransfer.quantityUnits.toLocaleString()} {hoverTransfer.quantityUom} · {formatMoney(hoverTransfer.goodsValueUsd)} · {hoverTransfer.dwellHours}h dwell</small></>}{hoverLocation && <><span>{hoverLocation.kind.toUpperCase()} · {hoverLocation.region}</span><b>{hoverLocation.name}</b><small>{hoverLocation.openOrders.toLocaleString()} orders · {formatMoney(hoverLocation.connectedValueUsd)} · {hoverLocation.utilizationPercent}% utilized</small></>}{hoverCorridor && !hoverAsset && !hoverCargo && <><span>{hoverCorridor.mode.toUpperCase()} · {hoverCorridor.status.toUpperCase()}</span><b>{hoverCorridor.from.toUpperCase()} → {hoverCorridor.to.toUpperCase()}</b><small>{hoverCorridor.committedUnits.toLocaleString()} {hoverCorridor.capacityUom} · {hoverCorridor.tonnes.toLocaleString()} t · {formatMoney(hoverCorridor.goodsValueUsd)} · {formatMoney(hoverCorridor.freightUsd)} freight</small></>}</div>}
          </div>

          <aside className="radar-inspector" aria-live="polite">
            {!selection && <div className="radar-empty-inspector"><span className="radar-scan" aria-hidden="true" /><p className="kicker">ENTITY INSPECTOR</p><h3>Select any rendered corridor, hub, asset, cargo lot, or transfer</h3><p>Hover for a compact radar view. Select to pin quantity, weight, cube, value, freight, ETA, ownership, evidence, and change history.</p><dl><div><dt>Corridors rendered</dt><dd>{mapCorridors.length}</dd></div><div><dt>Assets rendered</dt><dd>{mapAssets.length}</dd></div><div><dt>Cargo rendered</dt><dd>{mapCargo.length}</dd></div><div><dt>Transfers rendered</dt><dd>{mapTransfers.length}</dd></div></dl><button type="button" onClick={() => onTrace("Rendered map-window evidence opened", `${mapCorridors.length} corridors · ${mapLocations.length} locations · ${mapAssets.length} assets · ${mapCargo.length} cargo lots · ${mapTransfers.length} transfers · camera ${camera.label} ${camera.zoom.toFixed(1)}× · deterministic fixture.`, `MAP-${scope.toUpperCase()}-${frame}-VIEWPORT`)}>Trace viewport fixture ◇</button></div>}
            {selectedLocation && <LocationInspector location={selectedLocation} formatMoney={formatMoney} />}
            {selectedCorridor && <CorridorInspector corridor={selectedCorridor} assets={view.assets.filter((asset) => asset.corridorId === selectedCorridor.id)} cargo={view.cargo.filter((lot) => lot.corridorId === selectedCorridor.id)} changes={view.changes.filter((event) => event.entityId === selectedCorridor.id)} formatMoney={formatMoney} />}
            {selectedAsset && assetCorridor && <AssetInspector asset={selectedAsset} corridor={assetCorridor} cargo={view.cargo.filter((lot) => lot.assetId === selectedAsset.id)} formatMoney={formatMoney} />}
            {selectedCargo && <CargoInspector cargo={selectedCargo} asset={cargoAsset} corridor={cargoCorridor} formatMoney={formatMoney} />}
            {selectedTransfer && <TransferInspector transfer={selectedTransfer} formatMoney={formatMoney} />}
            {selectionContext && <div className="radar-inspector-actions"><button type="button" onClick={traceSelection}>Trace entity evidence ◇</button><button type="button" onClick={() => onOpenRisk(selectionContext)}>Analyze dependency</button><button type="button" onClick={() => onOpenOptimizer(selectionContext)}>{selectionContext.kind === "corridor" ? "Optimize corridor" : "Optimize selected context"}</button><button type="button" onClick={() => onOpenFlow(selectionContext)}>Inspect cash impact</button><button type="button" onClick={() => setSelection(null)}>Clear selection</button></div>}
          </aside>
        </div>
      ) : (
        <div className="radar-list">
          <div className="radar-list-types" role="group" aria-label="Choose network entity list">
            {(["Corridors", "Locations", "Assets", "Cargo", "Transfers"] as const).map((entity) => <button className={listEntity === entity ? "active" : ""} type="button" key={entity} onClick={() => setListEntity(entity)}>{entity}</button>)}
          </div>
          <div className="table-scroll">
            {listEntity === "Corridors" && <table><caption>{view.corridors.length} filtered synthetic corridors. Capacity is shown in each mode&apos;s native unit.</caption><thead><tr><th>Corridor / service</th><th>Mode</th><th>Committed / capacity</th><th>Weight / TEU</th><th>Value / freight ({currency})</th><th>ETA / reliability</th><th>State</th><th /></tr></thead><tbody>{view.corridors.map((corridor) => <tr key={corridor.id}><td><span className="asset-cell"><ToneDot tone={corridor.status} /><span><b>{corridor.from.toUpperCase()} → {corridor.to.toUpperCase()}</b><small>{corridor.service} · {corridor.carrier}</small></span></span></td><td>{corridor.mode}</td><td>{corridor.committedUnits.toLocaleString()} / {corridor.capacityUnits.toLocaleString()} {corridor.capacityUom}</td><td>{corridor.tonnes.toLocaleString()} t · {corridor.teu.toLocaleString()} TEU</td><td>{formatMoney(corridor.goodsValueUsd)} · {formatMoney(corridor.freightUsd)}</td><td>{corridor.etaVarianceHours > 0 ? "+" : ""}{corridor.etaVarianceHours}h · {corridor.reliabilityPercent}%</td><td><span className={`state-pill state-${corridor.status}`}>{corridor.status}</span></td><td><button type="button" onClick={() => inspectFromList({ kind: "corridor", id: corridor.id })}>Inspect</button></td></tr>)}</tbody></table>}
            {listEntity === "Locations" && <table><caption>{view.locations.length} filtered synthetic locations connected to the selected corridors.</caption><thead><tr><th>Location</th><th>Type / region</th><th>Capacity / utilization</th><th>Dwell</th><th>Orders</th><th>Connected value ({currency})</th><th /></tr></thead><tbody>{view.locations.map((location) => <tr key={location.id}><td><span className="asset-cell"><ToneDot tone={location.tone} /><span><b>{location.code}</b><small>{location.name} · {location.country}</small></span></span></td><td>{location.kind} · {location.region}</td><td>{location.capacityPerDay.toLocaleString()} / day · {location.utilizationPercent}%</td><td>{location.dwellHours}h</td><td>{location.openOrders.toLocaleString()}</td><td>{formatMoney(location.connectedValueUsd)}</td><td><button type="button" onClick={() => inspectFromList({ kind: "location", id: location.id })}>Inspect</button></td></tr>)}</tbody></table>}
            {listEntity === "Assets" && <table><caption>{view.assets.length} filtered synthetic assets at the selected time and scenario frame.</caption><thead><tr><th>Asset</th><th>Corridor</th><th>Position / state</th><th>Speed</th><th>ETA</th><th>Cargo sample</th><th /></tr></thead><tbody>{view.assets.map((asset) => { const corridor = corridorById.get(asset.corridorId); return <tr key={asset.id}><td><span className="asset-cell"><ToneDot tone={corridor?.status ?? "healthy"} /><span><b>{asset.demoIdentifier}</b><small>{asset.type} · {asset.operator}</small></span></span></td><td>{corridor ? `${corridor.from.toUpperCase()} → ${corridor.to.toUpperCase()}` : asset.corridorId}</td><td>{asset.progressPercent}% · {asset.telemetryState}{asset.arrived ? " · arrived" : ""}</td><td>{asset.speed} {asset.speedUnit}</td><td>{displayDate(asset.etaIso)}</td><td>{asset.cargoCount} lots</td><td><button type="button" onClick={() => inspectFromList({ kind: "asset", id: asset.id })}>Inspect</button></td></tr>; })}</tbody></table>}
            {listEntity === "Cargo" && <table><caption>{view.cargo.length} filtered synthetic cargo lots. Quantities retain their source unit of measure.</caption><thead><tr><th>Shipment / SKU</th><th>Category / priority</th><th>Quantity</th><th>Weight / cube</th><th>Goods / margin ({currency})</th><th>Program</th><th /></tr></thead><tbody>{view.cargo.map((cargo) => <tr key={cargo.id}><td><span className="asset-cell"><ToneDot tone={cargo.priority === "Production critical" ? "critical" : cargo.priority === "Customer promise" ? "watch" : "healthy"} /><span><b>{cargo.shipmentRef}</b><small>{cargo.sku} · {cargo.description}</small></span></span></td><td>{cargo.category} · {cargo.priority}</td><td>{cargo.quantity.toLocaleString()} {cargo.uom}</td><td>{(cargo.weightKg / 1_000).toFixed(1)} t · {cargo.cubeM3.toFixed(1)} m³</td><td>{formatMoney(cargo.goodsValueUsd)} · {formatMoney(cargo.marginExposureUsd)}</td><td>{cargo.customerProgram}</td><td><button type="button" onClick={() => inspectFromList({ kind: "cargo", id: cargo.id })}>Inspect</button></td></tr>)}</tbody></table>}
            {listEntity === "Transfers" && <table><caption>{view.transfers.length} topologically valid synthetic transfer events between connected legs.</caption><thead><tr><th>Transfer / location</th><th>Inbound → outbound</th><th>Quantity</th><th>Goods value ({currency})</th><th>Projected / cutoff</th><th>State / dwell</th><th /></tr></thead><tbody>{view.transfers.map((transfer) => { const location = networkLocations.find((item) => item.id === transfer.locationId); return <tr key={transfer.id}><td><span className="asset-cell"><ToneDot tone={transfer.status === "Customs hold" ? "critical" : transfer.status === "In progress" ? "watch" : "healthy"} /><span><b>{transfer.id.toUpperCase()}</b><small>{location?.name ?? transfer.locationId} · {transfer.cargoLotId}</small></span></span></td><td>{transfer.inboundAssetId} → {transfer.outboundAssetId}</td><td>{transfer.quantityUnits.toLocaleString()} {transfer.quantityUom}</td><td>{formatMoney(transfer.goodsValueUsd)}</td><td>{displayDate(transfer.projectedIso)} · {displayDate(transfer.cutoffIso)}</td><td>{transfer.status} · {transfer.dwellHours}h</td><td><button type="button" onClick={() => inspectFromList({ kind: "transfer", id: transfer.id })}>Inspect</button></td></tr>; })}</tbody></table>}
          </div>
        </div>
      )}

      <footer className="radar-timeline">
        <div className="timeline-heading"><div><p className="kicker">TIME + CHANGE</p><b>{frameDetail?.detail}</b><span>{scenarioDetail?.detail}</span></div><button className={playing ? "active" : ""} type="button" onClick={() => setPlaying((current) => !current)}>{playing ? "Pause timeline" : "Play timeline"}</button></div>
        <div className="timeline-track" role="group" aria-label="Network time frame">{networkFrames.map((item, index) => <button className={frame === item.id ? "active" : ""} type="button" key={item.id} onClick={() => { setFrameSelection({ horizon, frame: item.id }); setPlaying(false); }}><span>0{index + 1}</span><b>{item.label}</b><small>{item.detail}</small></button>)}</div>
        <div className="timeline-change-summary"><button type="button" onClick={() => onTrace("Mean utilization-change evidence opened", `${summary.averageUtilizationDeltaPoints.toFixed(1)} points across the filtered deterministic corridor fixture at ${frame} / ${scenario}.`, `MAP-${scope.toUpperCase()}-${frame}-UTILIZATION-DELTA`)}><span>Mean utilization change</span><b>{summary.averageUtilizationDeltaPoints >= 0 ? "+" : ""}{summary.averageUtilizationDeltaPoints.toFixed(1)} pts</b></button><button type="button" onClick={() => onTrace("Freight-change evidence opened", `${formatMoney(view.corridors.reduce((sum, item) => sum + item.costDeltaUsd, 0))} summed fixture cost delta across filtered corridors.`, `MAP-${scope.toUpperCase()}-${frame}-FREIGHT-DELTA`)}><span>Freight change</span><b>{formatMoney(view.corridors.reduce((sum, item) => sum + item.costDeltaUsd, 0))}</b></button><button type="button" onClick={() => onTrace("Critical-corridor count evidence opened", `${view.corridors.filter((item) => item.status === "critical").length} critical corridors in the filtered deterministic fixture.`, `MAP-${scope.toUpperCase()}-${frame}-CRITICAL`)}><span>Critical corridors</span><b>{view.corridors.filter((item) => item.status === "critical").length}</b></button><button type="button" onClick={() => onTrace("Frame-cutoff evidence-event count opened", `${view.changes.length} fixture change events at frame ${frame}; this is not an operational event stream.`, `MAP-${scope.toUpperCase()}-${frame}-EVENTS`)}><span>Evidence events by frame cutoff</span><b>{view.changes.length}</b></button></div>
      </footer>
    </section>
  );
}
