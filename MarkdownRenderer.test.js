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

describe("renderInline()", () => {
  it("throws an error if not a link", () => {
    const node = { type: "other-inline" };
    const renderer = new MarkdownRenderer();
    expect(() => renderer.renderInline(node, 0)).toThrowError(
      "Unknown inline type: other-inline"
    );
  });

  it("renders links", () => {
    const node = {
      type: "link",
      data: { ref: { url: "https://example.com" } },
      leaves: [
        { marks: [], object: "leaf", selections: [], text: "link text" },
      ],
    };
    const renderer = new MarkdownRenderer();
    expect(renderer.renderInline(node, 0)).toEqual(
      "[link text](https://example.com)"
    );
  });
});
