import { promises as pfs, existsSync, mkdirSync, createWriteStream } from "fs";
import { Readable } from "stream";
import { ReadableStream } from "stream/web";
import { finished } from "stream/promises";
import type {
  Files,
  SpaceContent,
  SpaceContentFile,
} from "./MarkdownRenderer.js";

if (process.argv.length < 2) {
  console.error("Usage: npm run download-files -- [space name]");
  process.exit(1);
}

const spaceNameArg: string = process.argv[2];

const download = async (imageUrl: string, filePath: string) => {
  const stream = createWriteStream(filePath);
  const { body } = await fetch(imageUrl);
  if (body === null) {
    throw Error("Body was null!");
  }
  await finished(Readable.fromWeb(body as ReadableStream).pipe(stream));
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
