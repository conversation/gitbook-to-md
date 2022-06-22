import { promises as fs } from "fs";
import convertToMarkdown from "./convertToMarkdown.js";
import { extractFilename } from "./utils.js";
import type { Files } from "./MarkdownRenderer.js";

if (process.argv.length < 2) {
  console.error("Usage: npm run parse-pages -- [space name]");
  process.exit(1);
}

const spaceName: string = process.argv[2];

type GitbookFile = {
  id: string;
  downloadURL: string;
};

// Convert files as provided in gitbook content to lookup of { id: downloadURL }
const buildFilesLookup = (files: GitbookFile[]) => {
  return files.reduce((lookup: Files, f: GitbookFile) => {
    lookup[f.id] = extractFilename(f.downloadURL);
    return lookup;
  }, {});
};

const readDir = async (path: string, fileURLs: Files) => {
  const filenames = await fs.readdir(path);

  for (const file of filenames) {
    const absPath = `${path}/${file}`;

    const stat = await fs.lstat(absPath);

    if (stat.isDirectory()) {
      readDir(absPath, fileURLs);
    } else if (file.match(/\.json$/) && file != "content.json") {
      console.log(`${absPath} -> ${absPath.replace(".json", ".md")}`);
      const markdown = await convertToMarkdown(absPath, fileURLs);
      if (markdown) {
        await fs.writeFile(absPath.replace(".json", ".md"), markdown);
      }
    }
  }
};

const parsePages = async (spaceName: string) => {
  const content = JSON.parse(
    await fs.readFile(`data/${spaceName}/content.json`, "utf8")
  );
  const fileURLs = buildFilesLookup(content.files);

  await readDir(`data/${spaceName}`, fileURLs);
};

parsePages(spaceName).then(() => console.log("Done"));
