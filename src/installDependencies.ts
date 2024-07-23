import { exec } from "node:child_process";
import { chdir, exit } from "node:process";
import select from "@inquirer/select";
import chalk from "chalk";
import { execa } from "execa";
import { createSpinner } from "nanospinner";
import type { PackageManager, Settings } from "./types.js";

const knownPackageManagers: { [key: string]: string } = {
  npm: "npm install",
  bun: "bun install",
  pnpm: "pnpm install",
  yarn: "yarn",
};

const installEslintCmd: { [key: string]: string } = {
  npm: "npm init @eslint/config@latest",
  bun: "bun create @eslint/config@latest",
  pnpm: "pnpm create @eslint/config@latest",
  yarn: "yarn create @eslint/config@latest",
};

const installBiomeCmd: { [key: string]: string } = {
  npm: "npm install --save-dev --save-exact @biomejs/biome && npx @biomejs/biome init",
  bun: "bun add --dev --exact @biomejs/biome && bunx biome init",
  pnpm: "pnpm add --save-dev --save-exact @biomejs/biome && pnpm biome init",
  yarn: "yarn add --dev --exact @biomejs/biome && yarn biome init",
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
  pmArg: PackageManager | undefined,
  settings: Settings,
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

  chdir(settings.target);

  if (!knownPackageManagers[packageManager]) {
    exit(1);
  }

  const spinnerDeps = createSpinner("Installing project dependencies").start();
  const procDeps = exec(knownPackageManagers[packageManager]);
  procDeps.stdout?.pipe(process.stdout);

  const procDepsExit: number = await new Promise((res) => {
    procDeps.on("exit", (code) => res(code == null ? 0xff : code));
  });

  if (procDepsExit === 0) {
    spinnerDeps.success();
  } else {
    spinnerDeps.stop({
      mark: chalk.red("×"),
      text: "Failed to install project dependencies",
    });
    exit(procDepsExit);
  }

  if (settings.linter !== "none") {
    const spinnerLint = createSpinner("Installing linter").start();
    const linterCmd =
      settings.linter === "biome" ? installBiomeCmd : installEslintCmd;
    const procLint = exec(linterCmd[packageManager]);
    procLint.stdout?.pipe(process.stdout);

    const procLintExit: number = await new Promise((res) => {
      procLint.on("exit", (code) => res(code == null ? 0xff : code));
    });

    if (procLintExit === 0) {
      spinnerLint.success();
    } else {
      spinnerLint.stop({
        mark: chalk.red("×"),
        text: "Failed to install linter",
      });
      exit(procLintExit);
    }
  }
};
