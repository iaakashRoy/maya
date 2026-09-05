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

export function BrandMark() {
  return <span className="tanjx-mark" aria-hidden="true"><i /><i /></span>;
}

export function AppGlyph({ appId, label, className = "" }: { appId: ProjectAppId; label?: string; className?: string }) {
  return <span className={`app-glyph app-glyph-${appId} ${className}`.trim()} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true} data-app-icon={appId}>{appSymbols[appId]}</span>;
}

export function IdentityAvatar({ id, name, initials, className = "" }: { id: string; name: string; initials?: string; className?: string }) {
  return <i className={`identity-avatar ${className}`.trim()} style={identityStyle(id)} aria-hidden="true" data-identity-color={identityColorFor(id)}>{initials ?? initialsFor(name)}</i>;
}
