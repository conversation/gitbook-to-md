import { promises as pfs, existsSync, mkdirSync } from "fs";
import type {
  SpaceContent,
} from "./MarkdownRenderer.js";
import axios from "axios";
import { writeFileSync } from "fs";

if (process.argv.length < 2) {
  console.error("Usage: npm run download-files -- [space name]");
  process.exit(1);
}

const spaceNameArg: string = process.argv[2];

const download = async (imageUrl: string, filePath: string) => {
  const download = await axios.get(imageUrl);
  writeFileSync(download.data, filePath);
};

const main = async () => {
  // Create the directory if it doesn't exist
  const spaceContent: SpaceContent = JSON.parse(
    await pfs.readFile(`data/${spaceNameArg}/content.json`, "utf8")
  );

  const filesDir = `data/${spaceNameArg}/files/`;

  if (!existsSync(filesDir)) {
    mkdirSync(filesDir);
  }

  for (const f of spaceContent.files) {
    const filePath = `${filesDir}${f.id}.${f.name}`;
    console.log(`Downloading ${f.name} (${f.id}) to ${filePath}...`);

    // TODO: handle duplicate named files (such as from screenshots)

    download(f.downloadURL, filePath).catch((err) => {
      console.error("Failed downloading", err);
    });
  }
};

main()
  .then((output) => {
    console.log("output", JSON.stringify(output));
  })
  .catch((err) => {
    console.error("Error downloading image:", err);
  });
