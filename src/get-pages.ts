import { promises as fs } from "fs";
import axios from "axios";

if (process.env.API_TOKEN === undefined) {
  console.error("Please provide the API_TOKEN environment variable");
  process.exit(1);
}
if (process.argv.length < 2) {
  console.error("Usage: npm run get-pages -- [space name]");
  process.exit(1);
}

const apiToken: string = process.env.API_TOKEN;
const spaceName: string = process.argv[2];

const config = { headers: { Authorization: `Bearer ${apiToken}` } };

type Node = {
  path?: string;
  pages: Node[];
};

const fetchPage = async (spaceId: string, spaceName: string, path: string) => {
  try {
    const page = await axios.get(
      `https://api.gitbook.com/v1/spaces/${spaceId}/content/path/${encodeURIComponent(path)}`,
      { ...config, responseType: "stream" }
    );
    const f = await fs.open(`data/${spaceName}/${path}.json`, "w");
    page.data.pipe(f.createWriteStream());
  } catch (error) {
    console.error(error);
  }
};

const fetchPath = async (spaceName: string, spaceId: string, path: string, node: Node) => {
  const absNodePath = node.path ? `${node.path}` : path;

  if (node.path !== undefined) {
    try {
      await fs.mkdir(`data/${spaceName}/${path}`);
    } catch (error) { }
    console.log(absNodePath);

    await fetchPage(spaceId, spaceName, absNodePath);
  }

  if (node.pages !== undefined) {
    for (const page of node.pages) {
      fetchPath(spaceName, spaceId, absNodePath, page);
    }
  }
};

const getPages = async (spaceName: string) => {
  const content = JSON.parse(
    await fs.readFile(`data/${spaceName}/content.json`, "utf8")
  );

  const spaceId = await fs.readFile(`data/${spaceName}/space.id`, "utf8");

  await fetchPath(spaceName, spaceId, "", content);
};

getPages(spaceName).then(() => console.log("Done"));
