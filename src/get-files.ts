import { promises as fs } from "fs";
import axios from "axios";
import { extractFilename } from "./utils.js";

if (process.argv.length < 2) {
  console.error("Usage: npm run get-pages -- [space name]");
  process.exit(1);
}

const spaceName: string = process.argv[2];

const getFile = async (spaceName: string, url: string) => {
  const filename = extractFilename(url);
  console.log(filename);
  const page = await axios.get(url, { responseType: "stream" });
  const f = await fs.open(`data/${spaceName}/files/${filename}`, "w");
  page.data.pipe(f.createWriteStream());
};

const getFiles = async (spaceName: string) => {
  const content = JSON.parse(
    await fs.readFile(`data/${spaceName}/content.json`, "utf8")
  );

  try {
    await fs.mkdir(`data/${spaceName}/files`);
  } catch (error) { }

  await Promise.all(
    content.files.map((file: { downloadURL: string }) => {
      getFile(spaceName, file.downloadURL)
    })
  );
};

getFiles(spaceName).then(() => console.log("Done"));
