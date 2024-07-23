import { createSpinner } from "nanospinner";
// @ts-expect-error tiged does not have types
import tiged from "tiged";

const templateConig = {
  directory: "templates",
  repository: "starter",
  user: "puristajs",
  ref: "main",
};

export const createRegularBridges = async (
  targetDirectoryPath: string,
  templateName = "base",
) => {
  const spinner = createSpinner(`Cloning the ${templateName} template`).start();

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
};
