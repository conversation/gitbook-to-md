import { promises as fs } from "fs";
import MarkdownRenderer from "./MarkdownRenderer.js";

export default async (filename: string) => {
  const data = await fs.readFile(filename, "utf8");
  const renderer = new MarkdownRenderer();
  const output = renderer.render(JSON.parse(data).document);
  return output;
};
