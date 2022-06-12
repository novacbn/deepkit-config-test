import { stat } from "fs/promises";

import { Project } from "./types";

const FILE_TEST = "./test.json";

(async () => {
  try {
    await stat(FILE_TEST);

    const previous_project = await Project.read(FILE_TEST);
    console.log({ previous_project });
  } catch (err) {}

  const project = Project.from({
    title: "Test Project",
  });

  const serialized = project.stringify();
  const deserialized = Project.parse(serialized);

  const cloned = project.clone();

  console.log({
    project,
    serialized,
    deserialized,
    original: cloned === project,
  });

  await project.write(FILE_TEST, true);
})();
