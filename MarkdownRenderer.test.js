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

describe("renderBlock()", () => {
  let renderer;

  beforeEach(() => {
    renderer = new MarkdownRenderer();
  });

  it("renders a heading", () => {
    const node = {
      type: "heading-2",
      leaves: [
        { marks: [], object: "leaf", selections: [], text: "heading text" },
      ],
    };

    expect(renderer.renderBlock(node, 0)).toEqual("## heading text\n\n");
  });

  it("renders a list item", () => {
    const node = {
      type: "list-item",
      leaves: [
        { marks: [], object: "leaf", selections: [], text: "list text" },
      ],
    };

    expect(renderer.renderBlock(node, 0)).toEqual("- list text");
  });

  it("renders a block quote", () => {
    const node = {
      type: "blockquote",
      leaves: [
        { marks: [], object: "leaf", selections: [], text: "line one\n" },
        { marks: [], object: "leaf", selections: [], text: "line two" },
      ],
    };

    expect(renderer.renderBlock(node, 0)).toEqual("> line one\n> line two\n");
  });

  it("renders a paragraph", () => {
    const node = {
      type: "paragraph",
      leaves: [
        { marks: [], object: "leaf", selections: [], text: "my paragraph" },
      ],
    };

    expect(renderer.renderBlock(node, 0)).toEqual("my paragraph\n\n");
  });

  it("renders an unknown block type", () => {
    const node = {
      type: "who-knows",
      leaves: [{ marks: [], object: "leaf", selections: [], text: "my text" }],
    };

    expect(renderer.renderBlock(node, 0)).toEqual("my text");
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

describe("renderLeaf()", () => {
  let renderer;

  beforeEach(() => {
    renderer = new MarkdownRenderer();
  });

  it("renders plain text", () => {
    const node = { text: "my text", marks: [] };
    expect(renderer.renderLeaf(node, 0)).toEqual("my text");
  });

  it("renders bold text", () => {
    const node = { text: "my text", marks: [{ object: "mark", type: "bold" }] };
    expect(renderer.renderLeaf(node, 0)).toEqual("**my text**");
  });

  it("renders italic text", () => {
    const node = {
      text: "my text",
      marks: [{ object: "mark", type: "italic" }],
    };
    expect(renderer.renderLeaf(node, 0)).toEqual("_my text_");
  });

  it("renders bold and italic text", () => {
    const node = {
      text: "my text",
      marks: [
        { object: "mark", type: "bold" },
        { object: "mark", type: "italic" },
      ],
    };
    expect(renderer.renderLeaf(node, 0)).toEqual("_**my text**_");
  });

  it("renders code", () => {
    const node = { text: "my text", marks: [{ object: "mark", type: "code" }] };
    expect(renderer.renderLeaf(node, 0)).toEqual("`my text`");
  });
});
