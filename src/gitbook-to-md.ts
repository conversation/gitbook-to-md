import { promises as fs } from "fs";
import convertToMarkdown from "./convertToMarkdown.js";
import type { SpaceContent } from "./MarkdownRenderer.js";

const spaceName: string = process.argv[2];
const processFile: string = process.argv[3];

if (process.argv.length < 3) {
  console.error("Usage: npm run gitbook-to-md -- [Space Name] [page.json]");
  process.exit(1);
}

const parsePage = async (spaceName: string, processFile: string) => {
  const spaceContent: SpaceContent = JSON.parse(
    await fs.readFile(`data/${spaceName}/content.json`, "utf8")
  );
  return convertToMarkdown(processFile, undefined, spaceContent);
};

parsePage(spaceName, processFile).then((markdown) => {
  console.log(markdown);
});
