export type Settings = {
  target: string;
  projectName: string;
  runtime: "node" | "bun";
  eventBridge: "default" | "mqtt" | "amqp" | "nats" | "dapr";
  useWebserver: true;
  fileConvention: "camel" | "snake" | "kebab";
  linter: "biome" | "eslint" | "none";
  type: "module" | "commonjs";
};

export type PackageManager = "npm" | "bun" | "pnpm" | "yarn";
