import type { CSSProperties } from "react";
import type { ProjectAppId } from "./workspace-model";

type AppGlyphId = ProjectAppId | "playground";

const appSymbols: Record<AppGlyphId, string> = {
  statistics: "Σ",
  risk: "⌖",
  optimizer: "⎔",
  flow: "⇄",
  demand: "⌁",
  suppliers: "⋈",
  minerals: "◆",
  workforce: "♙",
  manufacturing: "⚙",
  logistics: "⇢",
  quality: "✓",
  playground: ">_",
};

const identityPalette = [
  "#2f6fed",
  "#8b5cf6",
  "#c46d22",
  "#d04a46",
  "#0f8b8d",
  "#2f855a",
  "#4f6f8f",
  "#c0567f",
  "#168aad",
  "#718414",
  "#7a5af8",
  "#b45309",
] as const;

const sectorVisuals: Record<string, { symbol: string; color: string }> = {
  "consumer-electronics": { symbol: "\u2318", color: "#2563eb" },
  "beverage-bottling": { symbol: "\u25C9", color: "#dc2626" },
  "luxury-fashion": { symbol: "\u25C8", color: "#7c3aed" },
  "automotive-industrial": { symbol: "\u27F2", color: "#475569" },
  "ev-energy-storage": { symbol: "\u26A1", color: "#16a34a" },
  "global-nev-manufacturing": { symbol: "\u25CE", color: "#0f766e" },
  "food-confectionery": { symbol: "\u2739", color: "#92400e" },
  "semiconductor-foundry": { symbol: "\u25A6", color: "#0891b2" },
  "aerospace-defense": { symbol: "\u2708", color: "#1d4ed8" },
  "pharmaceuticals": { symbol: "\u271A", color: "#be123c" },
  "aerospace": { symbol: "✈", color: "#3567b0" },
  "energy-grid": { symbol: "ϟ", color: "#c77b0a" },
  "food-agriculture": { symbol: "✿", color: "#4d913f" },
  "industrial-automation": { symbol: "⚙", color: "#64748b" },
  "life-sciences": { symbol: "✚", color: "#c94e68" },
  "mobility-ev": { symbol: "↯", color: "#7657d6" },
  "critical-minerals": { symbol: "◆", color: "#ad6530" },
  "semiconductors": { symbol: "▦", color: "#287d84" },
  "ports-maritime": { symbol: "⚓", color: "#2474a6" },
  "retail-commerce": { symbol: "▤", color: "#b34c88" },
};

const clientVisuals: Record<string, { monogram: string; color: string; shape: string }> = {
  "apple": { monogram: "A", color: "#111827", shape: "apple" },
  "coca-cola": { monogram: "CC", color: "#e41e2b", shape: "coca-cola" },
  "gucci": { monogram: "GG", color: "#0f5132", shape: "gucci" },
  "tata-motors": { monogram: "T", color: "#1e5aa8", shape: "tata" },
  "tesla": { monogram: "T", color: "#cc0000", shape: "tesla" },
  "byd": { monogram: "BYD", color: "#d71920", shape: "byd" },
  "hershey": { monogram: "H", color: "#4b1f2a", shape: "hershey" },
  "tsmc": { monogram: "TC", color: "#d81e05", shape: "tsmc" },
  "airbus": { monogram: "A", color: "#005b9f", shape: "airbus" },
  "pfizer": { monogram: "P", color: "#0067b1", shape: "pfizer" },
  "apex-mobility": { monogram: "AM", color: "#6548c8", shape: "generic" },
  "helixora": { monogram: "HX", color: "#c13f60", shape: "generic" },
  "orion-silicon": { monogram: "OS", color: "#187b86", shape: "generic" },
  "verdant-foods": { monogram: "VF", color: "#3f8738", shape: "generic" },
  "stratos-aero": { monogram: "SA", color: "#2e63a5", shape: "generic" },
  "solara-grid": { monogram: "SG", color: "#b66c05", shape: "generic" },
  "terrametals": { monogram: "TM", color: "#99572d", shape: "generic" },
  "blueharbor": { monogram: "BH", color: "#16658f", shape: "generic" },
  "titanworks": { monogram: "TW", color: "#596879", shape: "generic" },
  "meridian-commerce": { monogram: "MC", color: "#a43e7b", shape: "generic" },
};

function initialsFor(name: string) {
  return name.split(/\s+/).filter(Boolean).map((word) => word[0]).join("").slice(0, 2).toUpperCase();
}

export function identityColorFor(id: string) {
  const hash = [...id].reduce((total, character) => ((total * 31) + character.charCodeAt(0)) >>> 0, 17);
  return identityPalette[hash % identityPalette.length];
}

export function identityStyle(id: string): CSSProperties {
  return { "--identity-accent": identityColorFor(id) } as CSSProperties;
}

export function sectorColorFor(sectorId: string) {
  return sectorVisuals[sectorId]?.color ?? identityColorFor(sectorId);
}

export function clientColorFor(clientId: string) {
  return clientVisuals[clientId]?.color ?? identityColorFor(clientId);
}

export function BrandMark() {
  return <span className="tanjx-mark" aria-hidden="true"><i /><i /></span>;
}

export type NavigationIconName = "client-add" | "project-add" | "collapse" | "expand" | "close" | "workspace" | "world";

export function NavigationIcon({ name }: { name: NavigationIconName }) {
  return <span className={`navigation-icon navigation-icon-${name}`} aria-hidden="true" data-navigation-icon={name}><i /><em /></span>;
}

export function SectorMark({ sectorId, label }: { sectorId: string; label: string }) {
  const visual = sectorVisuals[sectorId] ?? { symbol: label.trim().slice(0, 1).toUpperCase() || "•", color: sectorColorFor(sectorId) };
  return <span className="path-entity-mark sector-mark" style={{ "--entity-accent": visual.color } as CSSProperties} title={`${label} tower`} aria-hidden="true" data-sector-mark={sectorId}>{visual.symbol}</span>;
}

export function ClientMark({ clientId, label }: { clientId: string; label: string }) {
  const visual = clientVisuals[clientId] ?? { monogram: initialsFor(label), color: clientColorFor(clientId), shape: "generic" };
  return <span className={`path-entity-mark client-mark client-mark-${visual.shape}`} style={{ "--entity-accent": visual.color } as CSSProperties} title={`${label} client`} role="img" aria-label={`${label} client mark`} data-client-mark={clientId}><b>{visual.monogram}</b><i aria-hidden="true" /></span>;
}

export function AppGlyph({ appId, label, className = "" }: { appId: AppGlyphId; label?: string; className?: string }) {
  return <span className={`app-glyph app-glyph-${appId} ${className}`.trim()} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} data-app-icon={appId}>{appSymbols[appId]}</span>;
}

export function IdentityAvatar({ id, name, initials, className = "" }: { id: string; name: string; initials?: string; className?: string }) {
  return <i className={`identity-avatar ${className}`.trim()} style={identityStyle(id)} aria-hidden="true" data-identity-color={identityColorFor(id)}>{initials ?? initialsFor(name)}</i>;
}
