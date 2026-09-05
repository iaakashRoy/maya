import type { CSSProperties } from "react";
import type { ProjectAppId } from "./workspace-model";

const appSymbols: Record<ProjectAppId, string> = {
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

const clientVisuals: Record<string, { monogram: string; color: string }> = {
  "apex-mobility": { monogram: "AM", color: "#6548c8" },
  "helixora": { monogram: "HX", color: "#c13f60" },
  "orion-silicon": { monogram: "OS", color: "#187b86" },
  "verdant-foods": { monogram: "VF", color: "#3f8738" },
  "stratos-aero": { monogram: "SA", color: "#2e63a5" },
  "solara-grid": { monogram: "SG", color: "#b66c05" },
  "terrametals": { monogram: "TM", color: "#99572d" },
  "blueharbor": { monogram: "BH", color: "#16658f" },
  "titanworks": { monogram: "TW", color: "#596879" },
  "meridian-commerce": { monogram: "MC", color: "#a43e7b" },
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
  const visual = clientVisuals[clientId] ?? { monogram: initialsFor(label), color: clientColorFor(clientId) };
  return <span className="path-entity-mark client-mark" style={{ "--entity-accent": visual.color } as CSSProperties} title={`${label} concept brand`} aria-hidden="true" data-client-mark={clientId}>{visual.monogram}</span>;
}

export function AppGlyph({ appId, label, className = "" }: { appId: ProjectAppId; label?: string; className?: string }) {
  return <span className={`app-glyph app-glyph-${appId} ${className}`.trim()} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} data-app-icon={appId}>{appSymbols[appId]}</span>;
}

export function IdentityAvatar({ id, name, initials, className = "" }: { id: string; name: string; initials?: string; className?: string }) {
  return <i className={`identity-avatar ${className}`.trim()} style={identityStyle(id)} aria-hidden="true" data-identity-color={identityColorFor(id)}>{initials ?? initialsFor(name)}</i>;
}
