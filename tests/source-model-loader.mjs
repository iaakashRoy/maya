import { readFile } from "node:fs/promises";
import ts from "typescript";

export const readSource = (path) => readFile(new URL(path, import.meta.url), "utf8");

export const asModuleUrl = (source) =>
  `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;

export const transpileSource = (source) =>
  ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
  }).outputText;

export async function linkedCaseStudyUrl() {
  return asModuleUrl(transpileSource(await readSource("../app/case-study-model.ts")));
}

export async function linkedWorkspaceUrl() {
  const [workspaceSource, caseStudyUrl] = await Promise.all([
    readSource("../app/workspace-model.ts"),
    linkedCaseStudyUrl(),
  ]);
  return asModuleUrl(transpileSource(
    workspaceSource.replace('"./case-study-model"', JSON.stringify(caseStudyUrl)),
  ));
}

export async function loadLinkedWorkspaceModel() {
  return import(await linkedWorkspaceUrl());
}

export async function linkedActivityUrl() {
  const [activitySource, workspaceUrl, caseStudyUrl] = await Promise.all([
    readSource("../app/project-activity-model.ts"),
    linkedWorkspaceUrl(),
    linkedCaseStudyUrl(),
  ]);
  return asModuleUrl(transpileSource(
    activitySource
      .replace('"./workspace-model"', JSON.stringify(workspaceUrl))
      .replace('"./case-study-model"', JSON.stringify(caseStudyUrl)),
  ));
}
