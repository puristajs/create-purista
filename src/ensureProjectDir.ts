import fs from "node:fs";
import confirm from "@inquirer/confirm";
import type { Settings } from "./types.js";

function mkdirp(dir: string) {
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch (e) {
    if (e instanceof Error) {
      if ("code" in e && e.code === "EEXIST") return;
    }
    throw e;
  }
}

export const ensureProjectDir = async (settings: Settings) => {
  if (fs.existsSync(settings.target)) {
    if (fs.readdirSync(settings.target).length > 0) {
      const response = await confirm({
        message: "Directory not empty. Continue?",
        default: false,
      });
      if (!response) {
        process.exit(1);
      }
    }
  } else {
    mkdirp(settings.target);
  }
};
