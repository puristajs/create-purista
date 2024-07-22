import path from "node:path";
import input from "@inquirer/input";
import select from "@inquirer/select";
import chalk from "chalk";
import type { Arguments } from "yargs-parser";
import { version } from "../package.json";
import type { Settings } from "./types.js";

const runtimes = [
  { value: "node", name: "Node.js" },
  { value: "bun", name: "Bun" },
];

const bridges = [
  {
    value: "default",
    name: "Default",
    description: "In-Memory without scaling",
  },
  { value: "amqp", name: "AMQP", description: "Message Broker like RabbitMQ" },
  { value: "nats", name: "NATS", description: "NATS Message Broker" },
  {
    value: "mqtt",
    name: "MQTT",
    description: "MQTT Message Broker like Mosquitto",
  },
  { value: "dapr", name: "Dapr", description: "Dapr Runtime" },
];

export const getSettings = async (args: Arguments) => {
  const config: Settings = {
    target: "",
    projectName: "my-app",
    runtime: "node",
    eventBridge: "default",
    useWebserver: true,
  };

  console.log(chalk.gray(`create-purista version ${version}`));

  const { install, pm, template: templateArg } = args;

  if (args._[0]) {
    config.target = args._[0].toString();
    console.log(
      `${chalk.bold(`${chalk.green("✔")} Using target directory`)} … ${config.target}`,
    );
  } else {
    const answer = await input({
      message: "Target directory",
      default: "my-app",
    });
    config.target = answer;
  }

  if (config.target === ".") {
    config.projectName = path.basename(process.cwd());
  } else {
    config.projectName = path.basename(config.target);
  }

  config.runtime =
    templateArg ||
    (await select({
      loop: true,
      message: "Which runtime do you use?",
      choices: runtimes,
      default: 0,
    }));

  config.eventBridge =
    templateArg ||
    (await select({
      loop: true,
      message: "Choose the Event Bridge",
      choices: bridges,
      default: 0,
    }));

  config.useWebserver =
    templateArg ||
    (await select({
      loop: true,
      message: "Install Webservice",
      choices: [
        {
          value: true,
          name: "Yes",
        },
        {
          value: false,
          name: "No",
        },
      ],
      default: 0,
    }));

  return config;
};
