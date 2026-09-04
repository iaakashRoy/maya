import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  DEMO_AS_OF,
  cargoLots,
  getAssetFrame,
  getCorridorFrame,
  getFrameTimestamp,
  getNetworkView,
  networkChangeEvents,
  networkCorridors,
  networkFrames,
  networkLocations,
  operationalContacts,
  summarizeNetwork,
  transferEvents,
  transportAssets,
} from "../app/network-operations-model.ts";

const unique = (records) => new Set(records.map((record) => record.id)).size === records.length;
const allLayers = new Set(["Ocean", "Air", "Road", "Rail", "Transfer", "Assets", "Cargo", "Locations"]);
const assetIndex = new Map(transportAssets.map((asset) => [asset.id, asset]));

test("the network radar has a large, deterministic, referentially complete synthetic model", () => {
  assert.ok(networkLocations.length >= 40);
  assert.equal(networkCorridors.length, 42);
  assert.equal(transportAssets.length, 96);
  assert.equal(cargoLots.length, 240);
  assert.equal(transferEvents.length, 72);
  assert.equal(networkChangeEvents.length, 72);
  assert.equal(operationalContacts.length, 12);
  for (const records of [networkLocations, networkCorridors, transportAssets, cargoLots, transferEvents, networkChangeEvents, operationalContacts]) assert.ok(unique(records));

  const locationIds = new Set(networkLocations.map((location) => location.id));
  const corridorIds = new Set(networkCorridors.map((corridor) => corridor.id));
  const assetIds = new Set(transportAssets.map((asset) => asset.id));
  const contactIds = new Set(operationalContacts.map((contact) => contact.id));
  const corridorById = new Map(networkCorridors.map((corridor) => [corridor.id, corridor]));
  const assetById = assetIndex;
  const cargoById = new Map(cargoLots.map((lot) => [lot.id, lot]));
  for (const location of networkLocations) {
    assert.ok(location.coordinates[0] >= -180 && location.coordinates[0] <= 180);
    assert.ok(location.coordinates[1] >= -90 && location.coordinates[1] <= 90);
    assert.match(location.owner, /synthetic/i);
  }
  for (const corridor of networkCorridors) {
    assert.ok(locationIds.has(corridor.from) && locationIds.has(corridor.to));
    assert.ok(corridor.committedUnits <= corridor.capacityUnits);
    assert.ok(corridor.waypoints.length >= 2);
    assert.ok(["TEU", "ULD", "loads", "wagons", "moves"].includes(corridor.capacityUom));
  }
  for (const asset of transportAssets) {
    assert.ok(corridorIds.has(asset.corridorId));
    assert.ok(contactIds.has(asset.contactId));
    assert.ok(asset.progressPercent >= 0 && asset.progressPercent <= 100);
    assert.equal(cargoLots.filter((lot) => lot.assetId === asset.id).length, asset.cargoCount);
  }
  for (const lot of cargoLots) {
    const asset = assetById.get(lot.assetId);
    const corridor = corridorById.get(lot.corridorId);
    assert.ok(corridor && asset);
    assert.equal(asset.corridorId, lot.corridorId);
    assert.equal(lot.category, corridor.category);
  }
  for (const transfer of transferEvents) {
    const inbound = assetById.get(transfer.inboundAssetId);
    const outbound = assetById.get(transfer.outboundAssetId);
    const inboundCorridor = corridorById.get(inbound?.corridorId);
    const outboundCorridor = corridorById.get(outbound?.corridorId);
    const cargo = cargoById.get(transfer.cargoLotId);
    assert.ok(inbound && outbound && inboundCorridor && outboundCorridor && cargo);
    assert.equal(inboundCorridor.to, transfer.locationId);
    assert.equal(outboundCorridor.from, transfer.locationId);
    assert.equal(inboundCorridor.category, outboundCorridor.category);
    assert.equal(cargo.assetId, inbound.id);
    assert.equal(cargo.quantity, transfer.quantityUnits);
    assert.equal(cargo.uom, transfer.quantityUom);
    assert.equal(cargo.goodsValueUsd, transfer.goodsValueUsd);
  }
  assert.ok(cargoLots.every((lot) => corridorIds.has(lot.corridorId) && assetIds.has(lot.assetId)));
  assert.ok(transferEvents.every((transfer) => locationIds.has(transfer.locationId) && assetIds.has(transfer.inboundAssetId) && assetIds.has(transfer.outboundAssetId)));
  assert.deepEqual(new Set(networkCorridors.map((corridor) => corridor.mode)), new Set(["Ocean", "Air", "Road", "Rail", "Transfer"]));
  assert.deepEqual(networkFrames.slice(-3).map((frame) => frame.id), ["t+7d", "t+30d", "t+90d"]);
  assert.equal(Date.parse(getFrameTimestamp("t+7d")) - Date.parse(DEMO_AS_OF), 7 * 24 * 3_600_000);
  assert.equal(Date.parse(getFrameTimestamp("t+30d")) - Date.parse(DEMO_AS_OF), 30 * 24 * 3_600_000);
  assert.equal(Date.parse(getFrameTimestamp("t+90d")) - Date.parse(DEMO_AS_OF), 90 * 24 * 3_600_000);
});

test("scope, category, movement, time, and scenario selectors produce meaningful reconciled changes", () => {
  const base = { scope: "global", frame: "live", scenario: "trajectory", category: "All categories", movement: "All movements", layers: allLayers };
  const global = getNetworkView(base);
  const apac = getNetworkView({ ...base, scope: "region" });
  const company = getNetworkView({ ...base, scope: "company" });
  const electronics = getNetworkView({ ...base, category: "Electronics" });
  const atRisk = getNetworkView({ ...base, movement: "At risk" });
  const arriving = getNetworkView({ ...base, movement: "Arriving" });
  assert.ok(global.corridors.length > apac.corridors.length);
  assert.ok(global.corridors.length > company.corridors.length);
  assert.ok(global.corridors.length > electronics.corridors.length);
  assert.ok(global.corridors.length > atRisk.corridors.length);
  assert.ok(electronics.corridors.every((corridor) => corridor.category === "Electronics"));
  assert.ok(electronics.cargo.every((lot) => lot.category === "Electronics"));
  assert.ok(atRisk.corridors.every((corridor) => corridor.status === "watch" || corridor.status === "critical"));
  assert.ok(arriving.corridors.length > 0);
  const liveTimestamp = Date.parse(getFrameTimestamp("live"));
  for (const corridor of arriving.corridors) {
    assert.ok(transportAssets
      .filter((asset) => asset.corridorId === corridor.id)
      .map((asset) => getAssetFrame(asset, corridor))
      .some((asset) => !asset.arrived && Date.parse(asset.etaIso) >= liveTimestamp && Date.parse(asset.etaIso) <= liveTimestamp + 72 * 3_600_000));
  }

  for (const category of ["Critical materials", "Electronics", "Logistics", "Direct materials"]) {
    const categoryView = getNetworkView({ ...base, category });
    const visibleCorridors = new Set(categoryView.corridors.map((corridor) => corridor.id));
    assert.ok(categoryView.corridors.every((corridor) => corridor.category === category));
    assert.ok(categoryView.cargo.every((lot) => lot.category === category && visibleCorridors.has(lot.corridorId)));
    for (const transfer of categoryView.transfers) {
      assert.ok(visibleCorridors.has(assetIndex.get(transfer.inboundAssetId).corridorId));
      assert.ok(visibleCorridors.has(assetIndex.get(transfer.outboundAssetId).corridorId));
    }
  }

  const corridor = networkCorridors[1];
  const history = getCorridorFrame(corridor, "t-24h", "trajectory");
  const live = getCorridorFrame(corridor, "live", "trajectory");
  const noAction = getCorridorFrame(corridor, "t+72h", "no-action");
  const response = getCorridorFrame(corridor, "t+72h", "recommended");
  const sevenDays = getCorridorFrame(corridor, "t+7d", "trajectory");
  const thirtyDays = getCorridorFrame(corridor, "t+30d", "trajectory");
  const ninetyDays = getCorridorFrame(corridor, "t+90d", "trajectory");
  assert.notEqual(history.committedUnits, live.committedUnits);
  assert.ok(noAction.etaVarianceHours > response.etaVarianceHours);
  assert.ok(noAction.freightUsd > response.freightUsd);
  assert.ok(sevenDays.progressDelta < thirtyDays.progressDelta && thirtyDays.progressDelta < ninetyDays.progressDelta);
  const historicalNoAction = getCorridorFrame(corridor, "t-24h", "no-action");
  const historicalRecommended = getCorridorFrame(corridor, "t-24h", "recommended");
  assert.equal(historicalNoAction.committedUnits, historicalRecommended.committedUnits);
  assert.equal(historicalNoAction.etaVarianceHours, historicalRecommended.etaVarianceHours);
  assert.equal(historicalNoAction.freightUsd, historicalRecommended.freightUsd);

  const baseAsset = transportAssets.find((asset) => asset.corridorId === corridor.id && asset.progressPercent < 80) ?? transportAssets.find((asset) => asset.corridorId === corridor.id);
  const liveAsset = getAssetFrame(baseAsset, live);
  const futureAsset = getAssetFrame(baseAsset, ninetyDays);
  assert.ok(futureAsset.progressPercent >= liveAsset.progressPercent && futureAsset.progressPercent <= 100);
  assert.equal(futureAsset.telemetryState, "Projected");
  assert.equal(futureAsset.arrived, true);

  const historicalView = getNetworkView({ ...base, frame: "t-24h" });
  assert.ok(historicalView.changes.length < global.changes.length);
  assert.ok(historicalView.changes.every((event) => Date.parse(event.timestampIso) <= Date.parse(getFrameTimestamp("t-24h"))));

  const withoutCargo = getNetworkView({ ...base, layers: new Set([...allLayers].filter((layer) => layer !== "Cargo")) });
  assert.equal(withoutCargo.cargo.length, 0);
  assert.equal(summarizeNetwork(withoutCargo).marginExposureUsd, 0);

  const summary = summarizeNetwork(global);
  const expectedQuantities = global.cargo.reduce((totals, lot) => ({ ...totals, [lot.uom]: totals[lot.uom] + lot.quantity }), { units: 0, kg: 0, tonnes: 0, pallets: 0 });
  assert.equal(summary.cargoLots, global.cargo.length);
  assert.deepEqual(summary.cargoQuantityByUom, expectedQuantities);
  assert.equal(summary.tonnes, Number((global.cargo.reduce((sum, lot) => sum + lot.weightKg, 0) / 1_000).toFixed(1)));
  assert.equal(summary.cubeM3, Number(global.cargo.reduce((sum, lot) => sum + lot.cubeM3, 0).toFixed(1)));
  assert.equal("quantityUnits" in summary, false);
  assert.equal(summary.goodsValueUsd, global.corridors.reduce((sum, item) => sum + item.goodsValueUsd, 0));
  assert.ok(Number.isFinite(summary.averageUtilizationDeltaPoints));
});

test("the bundled Natural Earth geography is valid and substantial", async () => {
  const raw = await readFile(new URL("../public/maps/ne_110m_land.geojson", import.meta.url), "utf8");
  const geography = JSON.parse(raw);
  assert.equal(geography.type, "FeatureCollection");
  assert.ok(geography.features.length > 100);
});
