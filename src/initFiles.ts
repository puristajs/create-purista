import fs from "node:fs";
import path from "node:path";
import { createSpinner } from "nanospinner";
// @ts-expect-error tiged does not have types
import tiged from "tiged";
import type { Settings } from "./types.js";

const templateConig = {
  directory: "templates",
  repository: "starter",
  user: "puristajs",
  ref: "main",
};

export const initFiles = async (settings: Settings) => {
  const targetDirectoryPath = path.join(process.cwd(), settings.target);
  const spinner = createSpinner("Cloning the template").start();

  const templateName = settings.eventBridge === "dapr" ? "dapr" : "base";

  await new Promise((res) => {
    const emitter = tiged(
      `${templateConig.user}/${templateConig.repository}/${templateConig.directory}/${templateName}#${templateConig.ref}`,
      {
        cache: false,
        force: true,
      },
    );
    emitter.clone(targetDirectoryPath).then(() => {
      spinner.success();
      res({});
    });
  });

  const packageJsonPath = path.join(targetDirectoryPath, "package.json");

  if (fs.existsSync(packageJsonPath)) {
    const packageJson = fs.readFileSync(packageJsonPath, "utf-8");

    const packageJsonParsed = JSON.parse(packageJson);
    const newPackageJson = {
      name: settings.projectName,
      ...packageJsonParsed,
    };

    fs.writeFileSync(packageJsonPath, JSON.stringify(newPackageJson, null, 2));
  }
};
