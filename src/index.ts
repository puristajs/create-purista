import chalk from "chalk";
import yargsParser from "yargs-parser";
import { ensureProjectDir } from "./ensureProjectDir.js";
import { getSettings } from "./getSettings.js";
import { initFiles } from "./initFiles.js";
import { installDependencies } from "./installDependencies.js";

async function main() {
  const args = yargsParser(process.argv.slice(2));

  //const { install, pm } = args;
  //console.log(install, pm);

  const settings = await getSettings(args);

  await ensureProjectDir(settings);
  await initFiles(settings);
  const p = "";
  await installDependencies("npm", settings.target);

  console.log(chalk.green(`🎉 ${chalk.bold("Copied project files")}`));
  console.log(
    chalk.gray("Get started with:"),
    chalk.bold(`cd ${settings.target}`),
  );
}

main();
