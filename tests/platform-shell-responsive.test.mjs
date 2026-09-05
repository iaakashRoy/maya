import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("responsive project chrome keeps navigation, session, and account actions reachable", async () => {
  const [shell, css] = await Promise.all([
    read("../app/PlatformShell.tsx"),
    read("../app/globals.css"),
  ]);

  assert.match(shell, /const \[compactContext, setCompactContext\] = useState\(false\)/);
  assert.match(shell, /window\.matchMedia\("\(max-width: 1180px\)"\)/);
  assert.match(shell, /mountedAppPreviewLimit = compactContext \? 2 : 6/);
  assert.match(shell, /identityPreviewLimit = compactContext \? 1 : 2/);
  assert.match(shell, /Math\.max\(0, mountedAppPreviewLimit - 1\).*activeMountedAppId/s);
  assert.doesNotMatch(css, /\.context-mounted-apps\s*>\s*button:nth-of-type\([^)]*\)[^{]*\{[^}]*display:\s*none/s);

  assert.match(shell, /const toggleRailDensity = \(\) => \{[\s\S]*?if \(drawerMode\)[\s\S]*?setMobileOpen\(false\)/);
  assert.match(shell, /data-action-id="nav\.collapse"[^>]*onClick=\{toggleRailDensity\}/);
  assert.match(shell, /aria-label="Onboard a new client"/);
  assert.match(shell, /aria-label="Create a new project"/);
  assert.match(shell, /setMobileOpen\(false\)[\s\S]*?projectPathKeys\(project, projectPathMode\)/);
  assert.match(shell, /querySelector<HTMLElement>\('\[aria-current="page"\]'\)\?\.scrollIntoView/);

  assert.match(shell, /aria-label=\{activeWorkSessionId \? `Open active Playground session/);
  assert.match(css, /\.context-session\s*\{[\s\S]*?width:\s*100%;[\s\S]*?grid-row:\s*3;/);
  assert.match(css, /\.mobile-project-path\s*>\s*span,[\s\S]*?white-space:\s*normal;/);

  assert.match(shell, /aria-label=\{`Open account menu for/);
  assert.match(shell, /aria-controls="maya-profile-panel"/);
  assert.match(shell, /ref=\{profilePanelRef\} id="maya-profile-panel"/);
  assert.match(shell, /setIdentitySelection\(null\)/);
  assert.match(css, /\.work-identity-inspector\s*\{[\s\S]*?top:\s*var\(--topbar-height\);[\s\S]*?width:\s*min\(430px, calc\(100vw - 12px\)\)/);
});

test("laptop context strip clips no unbounded child layout and uses high contrast controls", async () => {
  const css = await read("../app/globals.css");
  const responsiveContract = css.slice(css.lastIndexOf("Final responsive shell contract"));

  assert.match(responsiveContract, /@media \(max-width: 1180px\) and \(min-width: 761px\)/);
  assert.match(responsiveContract, /\.context-work-tools\s*\{[\s\S]*?grid-template-columns:[\s\S]*?overflow:\s*hidden;/);
  assert.match(responsiveContract, /\.context-mounted-apps,[\s\S]*?\.context-identity-tools\s*\{[^}]*overflow:\s*hidden;/);
  assert.match(responsiveContract, /\.search-trigger\s*\{\s*color:\s*#3f4d45;/);
  assert.match(responsiveContract, /\.user-button small\s*\{\s*color:\s*#48564e;/);
});
