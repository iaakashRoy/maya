import type { ScopeId, StatusTone } from "./platform-model";

export const DEMO_AS_OF = "2026-09-04T09:30:00Z";

export type NetworkRegion = "Americas" | "Europe" | "MEA" | "APAC";
export type TransportMode = "Ocean" | "Air" | "Road" | "Rail" | "Transfer";
export type MapLayer = TransportMode | "Assets" | "Cargo" | "Locations";
export type NetworkFrameId = "t-24h" | "t-6h" | "live" | "t+6h" | "t+24h" | "t+72h" | "t+7d" | "t+30d" | "t+90d";
export type NetworkScenarioId = "trajectory" | "no-action" | "recommended";

export const networkFrames: readonly { id: NetworkFrameId; label: string; detail: string }[] = [
  { id: "t-24h", label: "T-24h", detail: "Observed prior operating state" },
  { id: "t-6h", label: "T-6h", detail: "Latest reconciled telemetry" },
  { id: "live", label: "Now", detail: "Synthetic as-of state" },
  { id: "t+6h", label: "+6h", detail: "Near-term estimated position" },
  { id: "t+24h", label: "+24h", detail: "Current-policy forecast" },
  { id: "t+72h", label: "+72h", detail: "Planning forecast" },
  { id: "t+7d", label: "+7d", detail: "Seven-day operational outlook" },
  { id: "t+30d", label: "+30d", detail: "Thirty-day tactical outlook" },
  { id: "t+90d", label: "+90d", detail: "Ninety-day planning outlook" },
];

export const networkScenarios: readonly { id: NetworkScenarioId; label: string; detail: string }[] = [
  { id: "trajectory", label: "Current trajectory", detail: "Committed plan plus observed conditions" },
  { id: "no-action", label: "No-action disruption", detail: "Compound delay without approved recourse" },
  { id: "recommended", label: "Recommended response", detail: "Illustrative governed mitigation package" },
];

export type GeoPoint = readonly [longitude: number, latitude: number];

export type NetworkLocation = {
  id: string;
  code: string;
  name: string;
  country: string;
  region: NetworkRegion;
  kind: "port" | "airport" | "plant" | "warehouse" | "supplier" | "rail hub" | "transfer hub";
  coordinates: GeoPoint;
  timezone: string;
  companyRelevant: boolean;
  capacityPerDay: number;
  utilizationPercent: number;
  dwellHours: number;
  openOrders: number;
  connectedValueUsd: number;
  tone: StatusTone;
  owner: string;
  freshnessMinutes: number;
  provenance: string;
};

type CorridorSeed = {
  id: string;
  from: string;
  to: string;
  mode: TransportMode;
  via?: readonly GeoPoint[];
  companyRelevant?: boolean;
  category: "Critical materials" | "Electronics" | "Logistics" | "Direct materials";
  carrier: string;
  service: string;
};

export type TransportCorridor = CorridorSeed & {
  waypoints: readonly GeoPoint[];
  capacityUom: "TEU" | "ULD" | "loads" | "wagons" | "moves";
  capacityUnits: number;
  committedUnits: number;
  tonnes: number;
  teu: number;
  cubeM3: number;
  goodsValueUsd: number;
  freightUsd: number;
  costPerUnitUsd: number;
  plannedTransitHours: number;
  reliabilityPercent: number;
  carbonTons: number;
  activeAssets: number;
  minAllocationPercent: number;
  maxAllocationPercent: number;
  frozen: boolean;
  owner: string;
  status: StatusTone;
  etaVarianceHours: number;
  source: string;
  observed: boolean;
};

export type OperationalContact = {
  id: string;
  name: string;
  role: string;
  shift: string;
  timezone: string;
  availability: "Available" | "Monitoring" | "Handoff due";
  channel: string;
};

export type TransportAsset = {
  id: string;
  corridorId: string;
  demoIdentifier: string;
  type: "Vessel" | "Aircraft" | "Truck" | "Train" | "Transfer team";
  operator: string;
  progressPercent: number;
  speed: number;
  speedUnit: "kn" | "km/h";
  headingDegrees: number;
  telemetryState: "Observed" | "Estimated" | "Projected";
  freshnessMinutes: number;
  nextWaypoint: string;
  etaIso: string;
  cargoCount: number;
  contactId: string;
  temperatureC?: number;
  altitudeFt?: number;
  draughtM?: number;
  wagonCount?: number;
};

export type CargoLot = {
  id: string;
  corridorId: string;
  assetId: string;
  shipmentRef: string;
  sku: string;
  description: string;
  category: CorridorSeed["category"];
  quantity: number;
  uom: "units" | "kg" | "tonnes" | "pallets";
  weightKg: number;
  cubeM3: number;
  unitPriceUsd: number;
  goodsValueUsd: number;
  freightUsd: number;
  dutyUsd: number;
  marginExposureUsd: number;
  incoterm: "FOB" | "CIF" | "DAP" | "DDP";
  priority: "Production critical" | "Customer promise" | "Standard";
  orderCount: number;
  customerProgram: string;
  control: string;
};

export type TransferEvent = {
  id: string;
  locationId: string;
  inboundAssetId: string;
  outboundAssetId: string;
  status: "Planned" | "In progress" | "Customs hold" | "Released";
  quantityUnits: number;
  quantityUom: CargoLot["uom"];
  goodsValueUsd: number;
  cargoLotId: string;
  plannedIso: string;
  projectedIso: string;
  dwellHours: number;
  cutoffIso: string;
  contactId: string;
};

export type NetworkChangeEvent = {
  id: string;
  timestampIso: string;
  entityId: string;
  entityType: "corridor" | "asset" | "location" | "cargo" | "transfer";
  metric: string;
  previous: number;
  current: number;
  unit: string;
  reason: string;
  evidence: string;
  confidencePercent: number;
  decisionImpact: string;
};

export type CorridorFrame = TransportCorridor & {
  frame: NetworkFrameId;
  scenario: NetworkScenarioId;
  progressDelta: number;
  quantityDelta: number;
  costDeltaUsd: number;
  utilizationPercent: number;
  utilizationDeltaPoints: number;
};

export type TransportAssetFrame = TransportAsset & {
  frame: NetworkFrameId;
  scenario: NetworkScenarioId;
  arrived: boolean;
};

const contacts: readonly OperationalContact[] = [
  ["contact-01", "Maya Singh — synthetic", "Global transport controller", "EMEA / APAC overlap", "UTC+05:30", "Available"],
  ["contact-02", "Leo Martins — synthetic", "Ocean operations lead", "Americas", "UTC-03:00", "Monitoring"],
  ["contact-03", "Elena Weiss — synthetic", "European network planner", "Europe", "UTC+01:00", "Available"],
  ["contact-04", "Kenji Mori — synthetic", "APAC control-tower lead", "APAC", "UTC+09:00", "Monitoring"],
  ["contact-05", "Amara Okafor — synthetic", "MEA flow coordinator", "MEA", "UTC+03:00", "Handoff due"],
  ["contact-06", "Sofia Alvarez — synthetic", "Customer promise manager", "Americas", "UTC-06:00", "Available"],
  ["contact-07", "Noah Chen — synthetic", "Air-freight controller", "Global", "UTC+08:00", "Monitoring"],
  ["contact-08", "Priya Desai — synthetic", "Plant materials lead", "India", "UTC+05:30", "Available"],
  ["contact-09", "Omar Haddad — synthetic", "Customs and transfer lead", "MEA", "UTC+04:00", "Handoff due"],
  ["contact-10", "Hannah Reed — synthetic", "Rail and road planner", "Europe", "UTC+00:00", "Available"],
  ["contact-11", "Mateo Cruz — synthetic", "Supplier recovery lead", "Americas", "UTC-05:00", "Monitoring"],
  ["contact-12", "Lin Zhao — synthetic", "Electronics category lead", "APAC", "UTC+08:00", "Available"],
].map(([id, name, role, shift, timezone, availability], index) => ({
  id, name, role, shift, timezone, availability: availability as OperationalContact["availability"], channel: `MAYA-DEMO-${String(index + 21).padStart(3, "0")}`,
}));

type LocationSeed = readonly [string, string, string, string, NetworkRegion, NetworkLocation["kind"], number, number, string, boolean];
const locationSeeds: readonly LocationSeed[] = [
  ["long-beach", "USLGB", "Long Beach Port", "United States", "Americas", "port", -118.22, 33.75, "UTC-08:00", true],
  ["los-angeles-air", "USLAX", "Los Angeles Air Gateway", "United States", "Americas", "airport", -118.41, 33.94, "UTC-08:00", true],
  ["vancouver", "CAVAN", "Vancouver Port", "Canada", "Americas", "port", -123.11, 49.29, "UTC-08:00", false],
  ["houston", "USHOU", "Houston Port", "United States", "Americas", "port", -95.01, 29.73, "UTC-06:00", true],
  ["new-york", "USNYC", "New York / New Jersey", "United States", "Americas", "port", -74.04, 40.68, "UTC-05:00", false],
  ["savannah", "USSAV", "Savannah Port", "United States", "Americas", "port", -81.09, 32.08, "UTC-05:00", true],
  ["chicago", "USCHI", "Chicago Rail Hub", "United States", "Americas", "rail hub", -87.63, 41.88, "UTC-06:00", true],
  ["detroit", "USDET", "Detroit Plant Cluster", "United States", "Americas", "plant", -83.05, 42.33, "UTC-05:00", true],
  ["monterrey", "MXMTY", "Monterrey Plant 04", "Mexico", "Americas", "plant", -100.32, 25.69, "UTC-06:00", true],
  ["manzanillo", "MXZLO", "Manzanillo Port", "Mexico", "Americas", "port", -104.32, 19.05, "UTC-06:00", true],
  ["panama", "PAPTY", "Panama Transfer Hub", "Panama", "Americas", "transfer hub", -79.55, 9.02, "UTC-05:00", false],
  ["santos", "BRSSZ", "Santos Port", "Brazil", "Americas", "port", -46.3, -23.96, "UTC-03:00", false],
  ["rotterdam", "NLRTM", "Rotterdam Port", "Netherlands", "Europe", "port", 4.48, 51.92, "UTC+01:00", true],
  ["rotterdam-dc", "NLRTD", "Rotterdam Distribution Center", "Netherlands", "Europe", "warehouse", 4.68, 51.96, "UTC+01:00", true],
  ["hamburg", "DEHAM", "Hamburg Port", "Germany", "Europe", "port", 9.99, 53.54, "UTC+01:00", true],
  ["antwerp", "BEANR", "Antwerp-Bruges Port", "Belgium", "Europe", "port", 4.4, 51.27, "UTC+01:00", false],
  ["felixstowe", "GBFXT", "Felixstowe Port", "United Kingdom", "Europe", "port", 1.31, 51.96, "UTC+00:00", false],
  ["valencia", "ESVLC", "Valencia Port", "Spain", "Europe", "port", -0.32, 39.44, "UTC+01:00", false],
  ["frankfurt", "DEFRA", "Frankfurt Air Gateway", "Germany", "Europe", "airport", 8.57, 50.04, "UTC+01:00", true],
  ["lyon", "FRLYO", "Lyon Customer Hub", "France", "Europe", "warehouse", 4.84, 45.76, "UTC+01:00", true],
  ["katowice", "PLKTW", "Katowice Plant 07", "Poland", "Europe", "plant", 19.02, 50.26, "UTC+01:00", true],
  ["gdansk", "PLGDN", "Gdansk Rail-Port Hub", "Poland", "Europe", "rail hub", 18.65, 54.35, "UTC+01:00", false],
  ["istanbul", "TRIST", "Istanbul Transfer Hub", "Türkiye", "Europe", "transfer hub", 28.97, 41.01, "UTC+03:00", true],
  ["jebel-ali", "AEJEA", "Jebel Ali Port", "United Arab Emirates", "MEA", "port", 55.06, 24.99, "UTC+04:00", true],
  ["dubai-air", "AEDXB", "Dubai Air Gateway", "United Arab Emirates", "MEA", "airport", 55.36, 25.25, "UTC+04:00", true],
  ["jeddah", "SAJED", "Jeddah Islamic Port", "Saudi Arabia", "MEA", "port", 39.17, 21.48, "UTC+03:00", false],
  ["cairo", "EGCAI", "Cairo Distribution Hub", "Egypt", "MEA", "warehouse", 31.24, 30.04, "UTC+02:00", true],
  ["tangier", "MAPTM", "Tanger Med Port", "Morocco", "MEA", "port", -5.5, 35.89, "UTC+01:00", false],
  ["mombasa", "KEMBA", "Mombasa Port", "Kenya", "MEA", "port", 39.67, -4.04, "UTC+03:00", false],
  ["durban", "ZADUR", "Durban Port", "South Africa", "MEA", "port", 31.04, -29.87, "UTC+02:00", true],
  ["cape-town", "ZACPT", "Cape Town Port", "South Africa", "MEA", "port", 18.44, -33.92, "UTC+02:00", false],
  ["singapore", "SGSIN", "Singapore Port", "Singapore", "APAC", "port", 103.84, 1.26, "UTC+08:00", true],
  ["singapore-dc", "SGSGD", "Singapore Control Hub", "Singapore", "APAC", "warehouse", 103.73, 1.35, "UTC+08:00", true],
  ["shanghai", "CNSHA", "Shanghai Port", "China", "APAC", "port", 121.49, 31.23, "UTC+08:00", true],
  ["shenzhen", "CNSZX", "Shenzhen Electronics Hub", "China", "APAC", "supplier", 114.06, 22.54, "UTC+08:00", true],
  ["busan", "KRPUS", "Busan Port", "South Korea", "APAC", "port", 129.08, 35.1, "UTC+09:00", false],
  ["yokohama", "JPYOK", "Yokohama Port", "Japan", "APAC", "port", 139.64, 35.45, "UTC+09:00", false],
  ["haiphong", "VNHPH", "Hai Phong Supplier Cluster", "Vietnam", "APAC", "supplier", 106.68, 20.86, "UTC+07:00", true],
  ["bangkok", "THBKK", "Bangkok Plant Cluster", "Thailand", "APAC", "plant", 100.5, 13.76, "UTC+07:00", false],
  ["chennai", "INMAA", "Chennai Port", "India", "APAC", "port", 80.3, 13.09, "UTC+05:30", true],
  ["mumbai", "INBOM", "Mumbai Air and Ocean Hub", "India", "APAC", "transfer hub", 72.88, 19.08, "UTC+05:30", true],
  ["pune", "INPNQ", "Pune Plant 02", "India", "APAC", "plant", 73.86, 18.52, "UTC+05:30", true],
  ["sydney", "AUSYD", "Sydney Customer Hub", "Australia", "APAC", "warehouse", 151.21, -33.87, "UTC+10:00", false],
];

export const networkLocations: readonly NetworkLocation[] = locationSeeds.map((seed, index) => {
  const [id, code, name, country, region, kind, longitude, latitude, timezone, companyRelevant] = seed;
  const utilizationPercent = 52 + (index * 11) % 45;
  const tone: StatusTone = utilizationPercent > 91 ? "critical" : utilizationPercent > 79 ? "watch" : index % 9 === 0 ? "opportunity" : "healthy";
  return {
    id, code, name, country, region, kind, coordinates: [longitude, latitude], timezone, companyRelevant,
    capacityPerDay: 740 + (index * 317) % 6200,
    utilizationPercent,
    dwellHours: Number((3.5 + (index * 2.7) % 39).toFixed(1)),
    openOrders: 74 + (index * 193) % 2300,
    connectedValueUsd: 14_000_000 + (index * 37_900_000) % 580_000_000,
    tone,
    owner: contacts[index % contacts.length].name,
    freshnessMinutes: 2 + (index * 7) % 41,
    provenance: index % 3 === 0 ? "Synthetic EDI + terminal event fusion" : index % 3 === 1 ? "Synthetic telematics + ERP reconciliation" : "Synthetic carrier milestone feed",
  };
});

const V = {
  malacca: [100.1, 3.1] as GeoPoint,
  colombo: [79.8, 6.3] as GeoPoint,
  aden: [45.1, 12.5] as GeoPoint,
  suez: [32.55, 29.9] as GeoPoint,
  gibraltar: [-5.5, 35.9] as GeoPoint,
  cape: [18.2, -34.4] as GeoPoint,
  panamaPacific: [-80.2, 7.2] as GeoPoint,
  panamaAtlantic: [-79.6, 9.4] as GeoPoint,
  pacificWest: [168, 34] as GeoPoint,
  pacificEast: [-168, 34] as GeoPoint,
};

const corridorSeeds: readonly CorridorSeed[] = [
  { id: "ocn-01", from: "shanghai", to: "singapore", mode: "Ocean", via: [[118, 20], V.malacca], category: "Electronics", carrier: "Meridian Ocean Demo", service: "Asia feeder A" },
  { id: "ocn-02", from: "singapore", to: "rotterdam", mode: "Ocean", via: [V.malacca, V.colombo, V.aden, V.suez, [20, 35], V.gibraltar], companyRelevant: true, category: "Critical materials", carrier: "Northstar Marine Demo", service: "Asia-Europe 1" },
  { id: "ocn-03", from: "shanghai", to: "long-beach", mode: "Ocean", via: [[142, 35], V.pacificWest, V.pacificEast, [-145, 36]], companyRelevant: true, category: "Electronics", carrier: "Pacifica Lines Demo", service: "Transpacific East" },
  { id: "ocn-04", from: "busan", to: "vancouver", mode: "Ocean", via: [[151, 42], V.pacificWest, V.pacificEast, [-148, 47]], category: "Direct materials", carrier: "BlueArc Demo", service: "North Pacific" },
  { id: "ocn-05", from: "chennai", to: "jebel-ali", mode: "Ocean", via: [[71, 12], [58, 19]], companyRelevant: true, category: "Direct materials", carrier: "GulfBridge Demo", service: "India-Gulf" },
  { id: "ocn-06", from: "jebel-ali", to: "rotterdam", mode: "Ocean", via: [V.aden, V.suez, [18, 35], V.gibraltar], companyRelevant: true, category: "Critical materials", carrier: "Northstar Marine Demo", service: "Gulf-Europe" },
  { id: "ocn-07", from: "santos", to: "rotterdam", mode: "Ocean", via: [[-30, -8], [-18, 14], V.gibraltar], category: "Direct materials", carrier: "Atlantic South Demo", service: "South Atlantic" },
  { id: "ocn-08", from: "durban", to: "rotterdam", mode: "Ocean", via: [V.cape, [-4, -5], V.gibraltar], category: "Critical materials", carrier: "Cape Meridian Demo", service: "Cape-Europe" },
  { id: "ocn-09", from: "mombasa", to: "jebel-ali", mode: "Ocean", via: [[49, 1], [53, 14]], category: "Direct materials", carrier: "Swahili Gulf Demo", service: "East Africa-Gulf" },
  { id: "ocn-10", from: "houston", to: "rotterdam", mode: "Ocean", via: [[-75, 28], [-35, 39], V.gibraltar], companyRelevant: true, category: "Critical materials", carrier: "Atlantic Vector Demo", service: "US Gulf-Europe" },
  { id: "ocn-11", from: "manzanillo", to: "savannah", mode: "Ocean", via: [V.panamaPacific, V.panamaAtlantic, [-80, 19]], companyRelevant: true, category: "Logistics", carrier: "Canal Connect Demo", service: "Panama relay" },
  { id: "ocn-12", from: "haiphong", to: "singapore", mode: "Ocean", via: [[109, 14], V.malacca], companyRelevant: true, category: "Electronics", carrier: "ASEAN Link Demo", service: "Vietnam feeder" },
  { id: "ocn-13", from: "yokohama", to: "long-beach", mode: "Ocean", via: [[156, 36], V.pacificWest, V.pacificEast, [-147, 35]], category: "Electronics", carrier: "Pacifica Lines Demo", service: "Japan-US" },
  { id: "ocn-14", from: "singapore", to: "sydney", mode: "Ocean", via: [[113, -8], [135, -20]], category: "Direct materials", carrier: "Southern Cross Demo", service: "Asia-Oceania" },
  { id: "ocn-15", from: "jeddah", to: "valencia", mode: "Ocean", via: [V.suez, [18, 35]], category: "Critical materials", carrier: "RedMed Demo", service: "Red Sea-Med" },
  { id: "air-01", from: "shenzhen", to: "frankfurt", mode: "Air", companyRelevant: true, category: "Electronics", carrier: "AeroBridge Demo", service: "Priority electronics" },
  { id: "air-02", from: "singapore-dc", to: "chicago", mode: "Air", companyRelevant: true, category: "Electronics", carrier: "Polar Cargo Demo", service: "APAC-US expedite" },
  { id: "air-03", from: "yokohama", to: "los-angeles-air", mode: "Air", category: "Electronics", carrier: "Pacifica Air Demo", service: "Transpacific priority" },
  { id: "air-04", from: "mumbai", to: "frankfurt", mode: "Air", companyRelevant: true, category: "Critical materials", carrier: "AeroBridge Demo", service: "India-Europe priority" },
  { id: "air-05", from: "dubai-air", to: "frankfurt", mode: "Air", category: "Logistics", carrier: "Gulf Cargo Demo", service: "Middle East connector" },
  { id: "air-06", from: "shenzhen", to: "dubai-air", mode: "Air", companyRelevant: true, category: "Electronics", carrier: "Silk Air Cargo Demo", service: "Asia-Gulf" },
  { id: "air-07", from: "frankfurt", to: "detroit", mode: "Air", companyRelevant: true, category: "Direct materials", carrier: "Atlantic Airlift Demo", service: "EU-US plant rescue" },
  { id: "air-08", from: "singapore-dc", to: "sydney", mode: "Air", category: "Electronics", carrier: "Southern Air Demo", service: "Oceania priority" },
  { id: "road-01", from: "monterrey", to: "long-beach", mode: "Road", companyRelevant: true, category: "Direct materials", carrier: "Continental Truck Demo", service: "MX-US west" },
  { id: "road-02", from: "monterrey", to: "houston", mode: "Road", companyRelevant: true, category: "Critical materials", carrier: "Continental Truck Demo", service: "MX-US gulf" },
  { id: "road-03", from: "pune", to: "mumbai", mode: "Road", companyRelevant: true, category: "Critical materials", carrier: "Deccan Road Demo", service: "Plant-port shuttle" },
  { id: "road-04", from: "pune", to: "chennai", mode: "Road", companyRelevant: true, category: "Direct materials", carrier: "Deccan Road Demo", service: "South India plant lane" },
  { id: "road-05", from: "rotterdam-dc", to: "lyon", mode: "Road", companyRelevant: true, category: "Electronics", carrier: "EuroRoad Demo", service: "Benelux-France" },
  { id: "road-06", from: "rotterdam-dc", to: "katowice", mode: "Road", companyRelevant: true, category: "Direct materials", carrier: "EuroRoad Demo", service: "Benelux-Poland" },
  { id: "road-07", from: "jebel-ali", to: "jeddah", mode: "Road", category: "Logistics", carrier: "GulfRoad Demo", service: "GCC connector" },
  { id: "road-08", from: "cairo", to: "jeddah", mode: "Road", category: "Direct materials", carrier: "RedSea Road Demo", service: "Egypt-KSA" },
  { id: "rail-01", from: "chicago", to: "detroit", mode: "Rail", companyRelevant: true, category: "Direct materials", carrier: "Great Lakes Rail Demo", service: "Midwest plant" },
  { id: "rail-02", from: "long-beach", to: "chicago", mode: "Rail", companyRelevant: true, category: "Electronics", carrier: "Continental Rail Demo", service: "West coast inland" },
  { id: "rail-03", from: "gdansk", to: "katowice", mode: "Rail", category: "Direct materials", carrier: "Baltic Rail Demo", service: "Poland industrial" },
  { id: "rail-04", from: "hamburg", to: "katowice", mode: "Rail", companyRelevant: true, category: "Critical materials", carrier: "EuroRail Demo", service: "Germany-Poland" },
  { id: "rail-05", from: "rotterdam", to: "frankfurt", mode: "Rail", companyRelevant: true, category: "Electronics", carrier: "Rhine Rail Demo", service: "Port-air connector" },
  { id: "rail-06", from: "shanghai", to: "haiphong", mode: "Rail", companyRelevant: true, category: "Electronics", carrier: "Asia Rail Demo", service: "China-Vietnam" },
  { id: "xfr-01", from: "rotterdam", to: "rotterdam-dc", mode: "Transfer", companyRelevant: true, category: "Logistics", carrier: "Rotterdam Ops Demo", service: "Port-to-DC" },
  { id: "xfr-02", from: "singapore", to: "singapore-dc", mode: "Transfer", companyRelevant: true, category: "Logistics", carrier: "Singapore Ops Demo", service: "Port-to-control hub" },
  { id: "xfr-03", from: "mumbai", to: "pune", mode: "Transfer", companyRelevant: true, category: "Critical materials", carrier: "India Transfer Demo", service: "Gateway-to-plant" },
  { id: "xfr-04", from: "los-angeles-air", to: "long-beach", mode: "Transfer", companyRelevant: true, category: "Electronics", carrier: "LA Transfer Demo", service: "Air-ocean interchange" },
  { id: "xfr-05", from: "dubai-air", to: "jebel-ali", mode: "Transfer", companyRelevant: true, category: "Logistics", carrier: "Dubai Transfer Demo", service: "Air-sea interchange" },
];

const locationById = new Map(networkLocations.map((location) => [location.id, location]));
const modeTransit = { Ocean: 310, Air: 18, Road: 28, Rail: 42, Transfer: 7 } satisfies Record<TransportMode, number>;
const modeCapacity = { Ocean: 3800, Air: 210, Road: 84, Rail: 760, Transfer: 320 } satisfies Record<TransportMode, number>;
const modeCapacityUom = { Ocean: "TEU", Air: "ULD", Road: "loads", Rail: "wagons", Transfer: "moves" } as const satisfies Record<TransportMode, TransportCorridor["capacityUom"]>;

export const networkCorridors: readonly TransportCorridor[] = corridorSeeds.map((seed, index) => {
  const from = locationById.get(seed.from);
  const to = locationById.get(seed.to);
  if (!from || !to) throw new Error(`Invalid corridor ${seed.id}`);
  const capacityUnits = modeCapacity[seed.mode] + (index * 137) % Math.max(100, modeCapacity[seed.mode]);
  const utilization = 0.56 + ((index * 13) % 39) / 100;
  const etaVarianceHours = Number((((index * 17) % 31) - 8).toFixed(1));
  const status: StatusTone = etaVarianceHours > 16 || utilization > .91 ? "critical" : etaVarianceHours > 6 || utilization > .82 ? "watch" : index % 11 === 0 ? "opportunity" : "healthy";
  const committedUnits = Math.round(capacityUnits * utilization);
  return {
    ...seed,
    companyRelevant: Boolean(seed.companyRelevant),
    waypoints: [from.coordinates, ...(seed.via ?? []), to.coordinates],
    capacityUom: modeCapacityUom[seed.mode],
    capacityUnits,
    committedUnits,
    tonnes: Math.round(committedUnits * (seed.mode === "Ocean" ? 7.4 : seed.mode === "Air" ? .18 : 1.2)),
    teu: seed.mode === "Ocean" ? Math.round(committedUnits * .72) : 0,
    cubeM3: Math.round(committedUnits * (seed.mode === "Air" ? 1.8 : 5.6)),
    goodsValueUsd: 8_500_000 + (index * 23_700_000) % 410_000_000,
    freightUsd: 180_000 + (index * 281_000) % 8_900_000,
    costPerUnitUsd: Number((84 + (index * 37) % 620).toFixed(2)),
    plannedTransitHours: modeTransit[seed.mode] + (index * 19) % modeTransit[seed.mode],
    reliabilityPercent: Number((88.2 + ((index * 23) % 107) / 10).toFixed(1)),
    carbonTons: Number((seed.mode === "Air" ? 142 + index * 2.7 : seed.mode === "Ocean" ? 64 + index * 1.8 : 18 + index * .9).toFixed(1)),
    activeAssets: 1 + (index * 5) % (seed.mode === "Ocean" ? 5 : 8),
    minAllocationPercent: seed.companyRelevant ? 12 : 0,
    maxAllocationPercent: 72 + index % 29,
    frozen: index % 8 === 0,
    owner: contacts[(index + 2) % contacts.length].name,
    status,
    etaVarianceHours,
    source: index % 2 ? "Synthetic carrier + customs milestone" : "Synthetic control-tower telemetry fusion",
    observed: index % 4 !== 0,
  };
});

const assetTypeByMode = { Ocean: "Vessel", Air: "Aircraft", Road: "Truck", Rail: "Train", Transfer: "Transfer team" } as const;
const assetPrefixByMode = { Ocean: "MV", Air: "MX", Road: "TRK", Rail: "RAIL", Transfer: "TEAM" } as const;
export const transportAssets: readonly TransportAsset[] = Array.from({ length: 96 }, (_, index) => {
  const corridor = networkCorridors[index % networkCorridors.length];
  const progressPercent = 6 + (index * 17) % 89;
  const etaHours = Math.max(2, Math.round(corridor.plannedTransitHours * (1 - progressPercent / 100) + corridor.etaVarianceHours));
  const etaIso = new Date(Date.parse(DEMO_AS_OF) + etaHours * 3_600_000).toISOString();
  return {
    id: `asset-${String(index + 1).padStart(3, "0")}`,
    corridorId: corridor.id,
    demoIdentifier: `${assetPrefixByMode[corridor.mode]}-${corridor.from.slice(0, 3).toUpperCase()}-${String(210 + index).padStart(3, "0")}`,
    type: assetTypeByMode[corridor.mode],
    operator: corridor.carrier,
    progressPercent,
    speed: corridor.mode === "Ocean" ? 13 + index % 7 : corridor.mode === "Air" ? 690 + index % 170 : 48 + index % 46,
    speedUnit: corridor.mode === "Ocean" ? "kn" : "km/h",
    headingDegrees: (index * 47) % 360,
    telemetryState: index % 4 === 0 ? "Estimated" : "Observed",
    freshnessMinutes: 1 + (index * 5) % 43,
    nextWaypoint: corridor.to.toUpperCase(),
    etaIso,
    cargoCount: index < 48 ? 3 : 2,
    contactId: contacts[index % contacts.length].id,
    ...(corridor.mode === "Air" ? { altitudeFt: 29_000 + (index % 8) * 1_000 } : {}),
    ...(corridor.mode === "Ocean" ? { draughtM: Number((8.2 + (index % 10) * .45).toFixed(1)) } : {}),
    ...(corridor.mode === "Rail" ? { wagonCount: 28 + index % 42 } : {}),
    ...(corridor.mode === "Road" && index % 4 === 0 ? { temperatureC: Number((4.5 + index % 3).toFixed(1)) } : {}),
  };
});

type ProductSeed = readonly [sku: string, description: string, category: CorridorSeed["category"], uom: CargoLot["uom"], unitPriceUsd: number];
const productSeeds: readonly ProductSeed[] = [
  ["G-142", "Battery-grade graphite", "Critical materials", "tonnes", 7_800],
  ["IGBT-A7", "Power controller module", "Electronics", "units", 1_240],
  ["AX4-HSG", "Precision drive housing", "Direct materials", "units", 410],
  ["SEAL-V9", "Thermal seal compound", "Direct materials", "kg", 92],
  ["CELL-C9", "Cylindrical cell module", "Electronics", "pallets", 22_400],
  ["STEEL-42", "42CrMo4 specialty steel", "Critical materials", "tonnes", 3_600],
  ["RTP-48", "Returnable transport packaging", "Logistics", "units", 680],
  ["MRO-KIT", "Port handling service kit", "Logistics", "pallets", 4_200],
];

export const cargoLots: readonly CargoLot[] = Array.from({ length: 240 }, (_, index) => {
  const asset = transportAssets[index % transportAssets.length];
  const corridor = networkCorridors.find((candidate) => candidate.id === asset.corridorId) ?? networkCorridors[0];
  const compatibleProducts = productSeeds.filter((product) => product[2] === corridor.category);
  const product = compatibleProducts[Math.floor(index / transportAssets.length) % compatibleProducts.length] ?? productSeeds[0];
  const quantity = 18 + (index * 29) % 820;
  const unitPriceUsd = product[4] + (index % 9) * product[4] * .025;
  const goodsValueUsd = Math.round(quantity * unitPriceUsd);
  return {
    id: `cargo-${String(index + 1).padStart(4, "0")}`,
    corridorId: corridor.id,
    assetId: asset.id,
    shipmentRef: `SYN-${corridor.id.toUpperCase()}-${String(6000 + index)}`,
    sku: product[0], description: product[1], category: product[2], quantity, uom: product[3],
    weightKg: Math.round(quantity * (product[3] === "tonnes" ? 1_000 : product[3] === "kg" ? 1 : 8.4)),
    cubeM3: Number((quantity * (product[3] === "pallets" ? 1.6 : .18)).toFixed(1)),
    unitPriceUsd: Number(unitPriceUsd.toFixed(2)), goodsValueUsd,
    freightUsd: Math.round(goodsValueUsd * (.018 + (index % 7) * .004)),
    dutyUsd: Math.round(goodsValueUsd * ((index % 5) * .012)),
    marginExposureUsd: Math.round(goodsValueUsd * (.16 + (index % 6) * .025)),
    incoterm: (["FOB", "CIF", "DAP", "DDP"] as const)[index % 4],
    priority: index % 5 === 0 ? "Production critical" : index % 3 === 0 ? "Customer promise" : "Standard",
    orderCount: 2 + (index * 7) % 38,
    customerProgram: ["AX-4 mobility", "GridCore industrial", "NovaDrive launch", "Service spares", "Energy storage"][index % 5],
    control: index % 8 === 0 ? "Temperature monitored" : index % 11 === 0 ? "Hazard documentation" : "Standard secure handling",
  };
});

type TransferRouteSeed = {
  locationId: string;
  inboundCorridorId: string;
  outboundCorridorId: string;
};

// A handoff is only valid when the inbound leg ends at the transfer location,
// the outbound leg starts there, and both legs carry the same cargo category.
// Deriving these routes from the corridor graph prevents synthetic transfer
// records from drifting away from the topology as the network is extended.
const transferRoutes: readonly TransferRouteSeed[] = networkLocations.flatMap((location) => {
  const inbound = networkCorridors.filter((corridor) => corridor.to === location.id);
  const outbound = networkCorridors.filter((corridor) => corridor.from === location.id);
  return inbound.flatMap((inboundCorridor) => outbound
    .filter((outboundCorridor) => outboundCorridor.category === inboundCorridor.category)
    .map((outboundCorridor) => ({
      locationId: location.id,
      inboundCorridorId: inboundCorridor.id,
      outboundCorridorId: outboundCorridor.id,
    })));
});

const assetsByCorridor = new Map(networkCorridors.map((corridor) => [corridor.id, transportAssets.filter((asset) => asset.corridorId === corridor.id)]));
export const transferEvents: readonly TransferEvent[] = Array.from({ length: 72 }, (_, index) => {
  const route = transferRoutes[index % transferRoutes.length];
  const cycle = Math.floor(index / transferRoutes.length);
  const inboundPool = assetsByCorridor.get(route.inboundCorridorId) ?? [];
  const outboundPool = assetsByCorridor.get(route.outboundCorridorId) ?? [];
  const inbound = inboundPool[cycle % inboundPool.length];
  const outbound = outboundPool[(cycle + 1) % outboundPool.length];
  if (!inbound || !outbound) throw new Error(`Invalid transfer connection at ${route.locationId}`);
  const linkedCargo = cargoLots.filter((lot) => lot.assetId === inbound.id);
  const cargo = linkedCargo[cycle % linkedCargo.length];
  if (!cargo) throw new Error(`Transfer ${index + 1} has no inbound cargo`);
  const planned = Date.parse(DEMO_AS_OF) + ((index % 18) - 5) * 3_600_000;
  const dwellHours = Number((2 + (index * 1.9) % 29).toFixed(1));
  return {
    id: `transfer-${String(index + 1).padStart(3, "0")}`,
    locationId: route.locationId,
    inboundAssetId: inbound.id,
    outboundAssetId: outbound.id,
    status: (["Planned", "In progress", "Customs hold", "Released"] as const)[index % 4],
    quantityUnits: cargo.quantity,
    quantityUom: cargo.uom,
    goodsValueUsd: cargo.goodsValueUsd,
    cargoLotId: cargo.id,
    plannedIso: new Date(planned).toISOString(),
    projectedIso: new Date(planned + dwellHours * 3_600_000).toISOString(),
    dwellHours,
    cutoffIso: new Date(planned + 12 * 3_600_000).toISOString(),
    contactId: contacts[(index + 3) % contacts.length].id,
  };
});

const changeReasons = [
  ["Port dwell increased after berth sequence change", "Synthetic terminal milestone", "Review customer promise and alternative departure"],
  ["Carrier accepted protected-capacity request", "Synthetic carrier confirmation", "Move volume into the recommended allocation"],
  ["Customs document confidence fell after schema mismatch", "Synthetic data-agent exception", "Hold release until evidence is reconciled"],
  ["Forecast uplift raised the critical-order reserve", "Synthetic DemandSense scenario", "Recalculate committed and discretionary volume"],
  ["Road congestion added transfer uncertainty", "Synthetic telematics aggregation", "Protect cutoff with an earlier handoff"],
  ["Supplier recovery estimate improved", "Synthetic SupplierGraph assessment", "Reduce emergency-air exposure"],
] as const;

export const networkChangeEvents: readonly NetworkChangeEvent[] = Array.from({ length: 72 }, (_, index) => {
  const corridor = networkCorridors[index % networkCorridors.length];
  const reason = changeReasons[index % changeReasons.length];
  const previous = 2 + (index * 7) % 28;
  const current = previous + ((index % 5) - 1) * 2.5;
  return {
    id: `change-${String(index + 1).padStart(3, "0")}`,
    timestampIso: new Date(Date.parse(DEMO_AS_OF) - (index + 1) * 37 * 60_000).toISOString(),
    entityId: corridor.id,
    entityType: "corridor",
    metric: index % 3 === 0 ? "ETA variance" : index % 3 === 1 ? "Committed utilization" : "Freight exposure",
    previous,
    current: Number(current.toFixed(1)),
    unit: index % 3 === 0 ? "hours" : index % 3 === 1 ? "percentage points" : "USD thousands",
    reason: reason[0], evidence: reason[1], confidencePercent: 72 + (index * 7) % 27, decisionImpact: reason[2],
  };
});

export const operationalContacts = contacts;

const frameFactor: Record<NetworkFrameId, number> = {
  "t-24h": -.08,
  "t-6h": -.025,
  live: 0,
  "t+6h": .018,
  "t+24h": .055,
  "t+72h": .11,
  "t+7d": .15,
  "t+30d": .24,
  "t+90d": .34,
};
const frameOffsetHours: Record<NetworkFrameId, number> = {
  "t-24h": -24,
  "t-6h": -6,
  live: 0,
  "t+6h": 6,
  "t+24h": 24,
  "t+72h": 72,
  "t+7d": 7 * 24,
  "t+30d": 30 * 24,
  "t+90d": 90 * 24,
};
const scenarioFactor: Record<NetworkScenarioId, number> = { trajectory: 0, "no-action": .18, recommended: -.09 };

export function getFrameTimestamp(frame: NetworkFrameId) {
  return new Date(Date.parse(DEMO_AS_OF) + frameOffsetHours[frame] * 3_600_000).toISOString();
}

export function getCorridorFrame(corridor: TransportCorridor, frame: NetworkFrameId, scenario: NetworkScenarioId): CorridorFrame {
  const time = frameFactor[frame];
  const frameHours = frameOffsetHours[frame];
  const scenarioShock = frameHours <= 0 ? 0 : scenarioFactor[scenario];
  const sensitivity = corridor.status === "critical" ? 1.35 : corridor.status === "watch" ? 1.1 : .75;
  const delay = Number((corridor.etaVarianceHours + (time + scenarioShock) * corridor.plannedTransitHours * .34 * sensitivity).toFixed(1));
  const baseUtilization = corridor.committedUnits / corridor.capacityUnits * 100;
  const utilization = Math.max(8, Math.min(100, baseUtilization + (time + scenarioShock) * 28));
  const status: StatusTone = delay > 20 || utilization > 96 ? "critical" : delay > 7 || utilization > 84 ? "watch" : scenario === "recommended" && frameHours > 0 && corridor.companyRelevant ? "opportunity" : "healthy";
  return {
    ...corridor,
    committedUnits: Math.round(corridor.committedUnits * (1 + time * .6 + scenarioShock * .35)),
    goodsValueUsd: Math.round(corridor.goodsValueUsd * (1 + time * .45)),
    freightUsd: Math.round(corridor.freightUsd * (1 + (time + scenarioShock) * sensitivity)),
    etaVarianceHours: delay,
    reliabilityPercent: Number(Math.max(61, Math.min(99.8, corridor.reliabilityPercent - (time + scenarioShock) * 28)).toFixed(1)),
    status,
    observed: frameHours <= 0 && corridor.observed,
    frame,
    scenario,
    progressDelta: Number((time * 100).toFixed(1)),
    quantityDelta: Math.round(corridor.committedUnits * (time * .6 + scenarioShock * .35)),
    costDeltaUsd: Math.round(corridor.freightUsd * (time + scenarioShock) * sensitivity),
    utilizationPercent: Number(utilization.toFixed(1)),
    utilizationDeltaPoints: Number((utilization - baseUtilization).toFixed(1)),
  };
}

export function getAssetFrame(asset: TransportAsset, corridor: CorridorFrame): TransportAssetFrame {
  const offsetHours = frameOffsetHours[corridor.frame];
  const baseCorridor = networkCorridors.find((candidate) => candidate.id === corridor.id) ?? corridor;
  const progressPercent = Number(Math.max(0, Math.min(100, asset.progressPercent + corridor.progressDelta)).toFixed(1));
  const etaAdjustmentHours = corridor.etaVarianceHours - baseCorridor.etaVarianceHours;
  const etaIso = new Date(Date.parse(asset.etaIso) + etaAdjustmentHours * 3_600_000).toISOString();
  const arrived = progressPercent >= 100 || Date.parse(etaIso) <= Date.parse(getFrameTimestamp(corridor.frame));
  return {
    ...asset,
    progressPercent: arrived ? 100 : progressPercent,
    telemetryState: offsetHours > 0 ? "Projected" : asset.telemetryState,
    nextWaypoint: arrived ? `Arrived · ${corridor.to.toUpperCase()}` : asset.nextWaypoint,
    etaIso,
    frame: corridor.frame,
    scenario: corridor.scenario,
    arrived,
  };
}

export type NetworkFilters = {
  scope: ScopeId;
  frame: NetworkFrameId;
  scenario: NetworkScenarioId;
  category: string;
  movement: "All movements" | "At risk" | "Arriving";
  layers: ReadonlySet<MapLayer>;
};

export function getNetworkView(filters: NetworkFilters) {
  const corridorFrames = networkCorridors
    .filter((corridor) => {
      const from = locationById.get(corridor.from);
      const to = locationById.get(corridor.to);
      const scopeMatch = filters.scope === "global" || filters.scope === "region"
        ? filters.scope === "global" || from?.region === "APAC" || to?.region === "APAC"
        : corridor.companyRelevant;
      const categoryMatch = filters.category === "All categories" || filters.category === corridor.category;
      const layerMatch = filters.layers.has(corridor.mode);
      return scopeMatch && categoryMatch && layerMatch;
    })
    .map((corridor) => getCorridorFrame(corridor, filters.frame, filters.scenario))
    .filter((corridor) => {
      if (filters.movement === "All movements") return true;
      if (filters.movement === "At risk") return corridor.status === "watch" || corridor.status === "critical";
      const frameTime = Date.parse(getFrameTimestamp(filters.frame));
      const arrivalLimit = frameTime + 72 * 3_600_000;
      return transportAssets
        .filter((asset) => asset.corridorId === corridor.id)
        .map((asset) => getAssetFrame(asset, corridor))
        .some((asset) => !asset.arrived && Date.parse(asset.etaIso) >= frameTime && Date.parse(asset.etaIso) <= arrivalLimit);
    });
  const corridorIds = new Set(corridorFrames.map((corridor) => corridor.id));
  const locationIds = new Set(corridorFrames.flatMap((corridor) => [corridor.from, corridor.to]));
  const locations = filters.layers.has("Locations") ? networkLocations.filter((location) => locationIds.has(location.id)) : [];
  const corridorFrameById = new Map(corridorFrames.map((corridor) => [corridor.id, corridor]));
  const framedAssets = transportAssets
    .filter((asset) => corridorIds.has(asset.corridorId))
    .map((asset) => getAssetFrame(asset, corridorFrameById.get(asset.corridorId)!));
  const assets = filters.layers.has("Assets") ? framedAssets : [];
  const cargo = filters.layers.has("Cargo")
    ? cargoLots.filter((lot) => corridorIds.has(lot.corridorId) && (filters.category === "All categories" || lot.category === filters.category))
    : [];
  const assetById = new Map(transportAssets.map((asset) => [asset.id, asset]));
  const transfers = filters.layers.has("Transfer") ? transferEvents.filter((event) => {
    const inbound = assetById.get(event.inboundAssetId);
    const outbound = assetById.get(event.outboundAssetId);
    return locationIds.has(event.locationId) && Boolean(inbound && outbound && corridorIds.has(inbound.corridorId) && corridorIds.has(outbound.corridorId));
  }) : [];
  const frameTimestamp = Date.parse(getFrameTimestamp(filters.frame));
  const changes = networkChangeEvents.filter((event) => corridorIds.has(event.entityId) && Date.parse(event.timestampIso) <= frameTimestamp);
  return { corridors: corridorFrames, locations, assets, cargo, transfers, changes };
}

export function summarizeNetwork(view: ReturnType<typeof getNetworkView>) {
  const delayed = view.assets.filter((asset) => {
    const corridor = view.corridors.find((candidate) => candidate.id === asset.corridorId);
    return corridor?.status === "critical" || corridor?.status === "watch";
  }).length;
  const cargoQuantityByUom = view.cargo.reduce<Record<CargoLot["uom"], number>>((totals, lot) => {
    totals[lot.uom] += lot.quantity;
    return totals;
  }, { units: 0, kg: 0, tonnes: 0, pallets: 0 });
  return {
    movements: view.assets.length,
    delayed,
    cargoLots: view.cargo.length,
    cargoQuantityByUom,
    tonnes: Number((view.cargo.reduce((sum, lot) => sum + lot.weightKg, 0) / 1_000).toFixed(1)),
    cubeM3: Number(view.cargo.reduce((sum, lot) => sum + lot.cubeM3, 0).toFixed(1)),
    goodsValueUsd: view.corridors.reduce((sum, corridor) => sum + corridor.goodsValueUsd, 0),
    freightUsd: view.corridors.reduce((sum, corridor) => sum + corridor.freightUsd, 0),
    averageEtaVarianceHours: view.corridors.length ? view.corridors.reduce((sum, corridor) => sum + corridor.etaVarianceHours, 0) / view.corridors.length : 0,
    averageUtilizationPercent: view.corridors.length ? view.corridors.reduce((sum, corridor) => sum + corridor.utilizationPercent, 0) / view.corridors.length : 0,
    averageUtilizationDeltaPoints: view.corridors.length ? view.corridors.reduce((sum, corridor) => sum + corridor.utilizationDeltaPoints, 0) / view.corridors.length : 0,
    marginExposureUsd: view.cargo.reduce((sum, lot) => sum + lot.marginExposureUsd, 0),
  };
}

export function getCorridorDetail(corridorId: string) {
  const corridor = networkCorridors.find((candidate) => candidate.id === corridorId);
  if (!corridor) return undefined;
  return {
    corridor,
    from: locationById.get(corridor.from),
    to: locationById.get(corridor.to),
    assets: transportAssets.filter((asset) => asset.corridorId === corridorId),
    cargo: cargoLots.filter((lot) => lot.corridorId === corridorId),
    changes: networkChangeEvents.filter((event) => event.entityId === corridorId),
  };
}

export function getContact(contactId: string) {
  return contacts.find((contact) => contact.id === contactId);
}

export function formatUsd(value: number, compact = true) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", notation: compact ? "compact" : "standard", maximumFractionDigits: compact ? 1 : 0 }).format(value);
}
