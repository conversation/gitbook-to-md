const fs = require("fs").promises;
const MarkdownRenderer = require("./MarkdownRenderer");

describe("render", () => {
  it("renders a sample document", async () => {
    const json = await fs.readFile("platform-team-on-boarding.json", "utf8");
    const expectedMd = await fs.readFile(
      "platform-team-on-boarding.md",
      "utf8"
    );
    const doc = JSON.parse(json).document;

    const renderer = new MarkdownRenderer();
    const output = renderer.render(doc);

    expect(output).toEqual(expectedMd);
  });
});
