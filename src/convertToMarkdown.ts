import { promises as fs } from "fs";
import MarkdownRenderer from "./MarkdownRenderer.js";
import type { Files, SpaceContent } from "./MarkdownRenderer.js";

export default async (
  filename: string,
  files: Files = {},
  spaceContent: SpaceContent
) => {
  const renderer = new MarkdownRenderer(files, spaceContent);
  const file = await fs.readFile(filename, "utf8");
  const data = JSON.parse(file);
  const output =
    data.kind == "sheet" ? renderer.render(data.document) : undefined;

  return output;
};
