export type Settings = {
  target: string;
  projectName: string;
  runtime: "node" | "bun";
  eventBridge: "default" | "mqtt" | "amqp" | "nats" | "dapr";
  useWebserver: true;
};

export type PackageManager = "npm" | "bun" | "pnpm" | "yarn";
