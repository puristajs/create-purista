import { exec } from "node:child_process";
import { chdir, exit } from "node:process";
import select from "@inquirer/select";
import { execa } from "execa";
import { createSpinner } from "nanospinner";
import type { PackageManager } from "./types.js";

const knownPackageManagers: { [key: string]: string } = {
  npm: "npm install",
  bun: "bun install",
  pnpm: "pnpm install",
  yarn: "yarn",
};
const knownPackageManagerNames = Object.keys(knownPackageManagers);

function getCurrentPackageManager(): PackageManager {
  const agent = process.env.npm_config_user_agent || "npm"; // Types say it might be undefined, just being cautious;

  if (agent.startsWith("bun")) return "bun";
  if (agent.startsWith("pnpm")) return "pnpm";
  if (agent.startsWith("yarn")) return "yarn";

  return "npm";
}

const currentPackageManager = getCurrentPackageManager();

function checkPackageManagerInstalled(packageManager: string) {
  return new Promise<boolean>((resolve) => {
    execa(packageManager, ["--version"])
      .then(() => resolve(true))
      .catch(() => resolve(false));
  });
}

export const installDependencies = async (
  pmArg: PackageManager,
  directoryPath: string,
) => {
  const installedPackageManagerNames = await Promise.all(
    knownPackageManagerNames.map(checkPackageManagerInstalled),
  ).then((results) =>
    knownPackageManagerNames.filter((_, index) => results[index]),
  );

  if (!installedPackageManagerNames.length) return;

  let packageManager: PackageManager;

  if (pmArg && installedPackageManagerNames.includes(pmArg)) {
    packageManager = pmArg;
  } else {
    packageManager = await select({
      message: "Which package manager do you want to use?",
      choices: installedPackageManagerNames.map((template: string) => ({
        title: template,
        value: template as PackageManager,
      })),
      default: currentPackageManager,
    });
  }

  chdir(directoryPath);

  if (!knownPackageManagers[packageManager]) {
    exit(1);
  }

  const spinner = createSpinner("Installing project dependencies").start();
  const proc = exec(knownPackageManagers[packageManager]);

  const procExit: number = await new Promise((res) => {
    proc.on("exit", (code) => res(code == null ? 0xff : code));
  });

  if (procExit === 0) {
    spinner.success();
  } else {
    spinner.stop({
      mark: chalk.red("×"),
      text: "Failed to install project dependencies",
    });
    exit(procExit);
  }
};
