import { promises as fs } from "fs";
import MarkdownRenderer from "./MarkdownRenderer.js";
import type { Files, SpaceContent, SpaceContentPage } from "./MarkdownRenderer.js";


export default async (
  filename: string,
  files: Files = {},
  spaceContent: SpaceContent
) => {
  const renderer = new MarkdownRenderer(files, spaceContent);
  const file = await fs.readFile(filename, "utf8");
  const data = JSON.parse(file) as SpaceContentPage;

  let output = undefined;
  if (data.kind === "sheet" && data.document) {
    // top level of a page
    const desc = data?.description ? `\ndescription: ${data.description.replace(/:/g, " -")}`: '';
    const create = `\ncreate: ${new Date().toISOString()}`;
    output = `---\ntitle: ${data.title.replace(/:/g, " -")}${desc}${create}\n---\n\n`
    output += await renderer.render(data.document);
  }

  return output;
};
