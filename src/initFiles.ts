import fs from "node:fs";
import path from "node:path";
import { createDaprBridge } from "./createDaprBridge.js";
import { createRegularBridges } from "./createRegularBridges.js";
import { getPackageJson } from "./getPackageJson.js";
import { setPuristaConfig } from './setPuristaConfig.js';

import type { Settings } from "./types.js";

export const initFiles = async (settings: Settings) => {
  const targetDirectoryPath = path.join(process.cwd(), settings.target);

  const templateName = settings.eventBridge === "dapr" ? "dapr" : "base";

  if (templateName === "base") {
    await createRegularBridges(targetDirectoryPath, templateName);
  }

  if (templateName === "dapr") {
    await createDaprBridge(targetDirectoryPath, templateName);
  }

  const packageJsonPath = path.join(targetDirectoryPath, "package.json");

  if (fs.existsSync(packageJsonPath)) {
    const packageJson = fs.readFileSync(packageJsonPath, "utf-8");
    const newPackageJson = getPackageJson(JSON.parse(packageJson), settings);
    fs.writeFileSync(packageJsonPath, JSON.stringify(newPackageJson, null, 2));
  }

  await setPuristaConfig(settings,targetDirectoryPath)
};
