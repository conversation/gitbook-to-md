import { promises as fs } from "fs";
import MarkdownRenderer from "./MarkdownRenderer";
import type { BlockNode, InlineNode, LinkNode, ImageNode, LeafNode } from "./MarkdownRenderer";

describe("render", () => {
  it("renders a sample document", async () => {
    const json = await fs.readFile(
      "fixtures/platform-team-on-boarding.json",
      "utf8"
    );
    const expectedMd = await fs.readFile(
      "fixtures/platform-team-on-boarding.md",
      "utf8"
    );
    const doc = JSON.parse(json).document;

    const renderer = new MarkdownRenderer();
    const output: string = renderer.render(doc);

    expect(output).toEqual(expectedMd);
  });

  it("renders nested list items", async () => {
    const renderer = new MarkdownRenderer();
    const json = await fs.readFile("fixtures/nested-list.json", "utf8");
    const node = JSON.parse(json).document;
    const result: string = renderer.render(node);

    expect(result).toEqual("- list item\n  - nested item\n\n\n");
  });

  it("renders mixed type nested list items", async () => {
    const renderer = new MarkdownRenderer();
    const json = await fs.readFile("fixtures/mixed-order-nested-list.json", "utf8");
    const node = JSON.parse(json).document;
    const result: string = renderer.render(node);

    expect(result).toEqual("1. One\n  - Nested unordered\n\n2. Two\n  1. Nested ordered\n\n\n");
  });

  it("renders images", async () => {
    const renderer = new MarkdownRenderer();
    const json = await fs.readFile("fixtures/images.json", "utf8");
    const node = JSON.parse(json).document;
    const result: string = renderer.render(node);

    expect(result).toEqual("![This is a caption](/todo/path)\n\n");
  });

  it("renders files", async () => {
    const renderer = new MarkdownRenderer();
    const json = await fs.readFile("fixtures/files.json", "utf8");
    const node = JSON.parse(json).document;
    const result: string = renderer.render(node);

    expect(result).toEqual("[This is a file](/todo/path)\n\n");
  });
});

describe("renderBlock()", () => {
  let renderer: MarkdownRenderer;

  beforeEach(() => {
    renderer = new MarkdownRenderer();
  });

  it("renders a heading", () => {
    const node: BlockNode = {
      object: "block",
      type: "heading-2",
      leaves: [
        { marks: [], object: "leaf", selections: [], text: "heading text" },
      ],
    };

    expect(renderer.renderBlock(node, 0)).toEqual("## heading text\n\n");
  });

  it("renders unordered list items", () => {
    const node: BlockNode = {
      object: "block",
      type: "list-unordered",
      nodes: [
        {
          object: "block",
          type: "list-item",
          nodes: [
            {
              object: "block",
              type: "paragraph",
              leaves: [
                {
                  marks: [],
                  object: "leaf",
                  selections: [],
                  text: "list text",
                },
              ],
            },
          ],
        },
        {
          object: "block",
          type: "list-item",
          nodes: [
            {
              object: "block",
              type: "paragraph",
              leaves: [
                {
                  marks: [],
                  object: "leaf",
                  selections: [],
                  text: "list text",
                },
              ],
            },
          ],
        },
      ],
    };

    expect(renderer.renderBlock(node, 0)).toEqual(
      "- list text\n- list text\n\n"
    );
  });

  it("renders ordered list items", () => {
    const node: BlockNode = {
      object: "block",
      type: "list-ordered",
      nodes: [
        {
          object: "block",
          type: "list-item",
          nodes: [
            {
              object: "block",
              type: "paragraph",
              leaves: [
                {
                  marks: [],
                  object: "leaf",
                  selections: [],
                  text: "list text",
                },
              ],
            },
          ],
        },
        {
          object: "block",
          type: "list-item",
          nodes: [
            {
              object: "block",
              type: "paragraph",
              leaves: [
                {
                  marks: [],
                  object: "leaf",
                  selections: [],
                  text: "another item",
                },
              ],
            },
          ],
        },
      ],
    };

    expect(renderer.renderBlock(node, 0)).toEqual(
      "1. list text\n2. another item\n\n"
    );
  });

  it("renders a block quote", () => {
    const node: BlockNode = {
      object: "block",
      type: "blockquote",
      leaves: [
        { marks: [], object: "leaf", selections: [], text: "line one\n" },
        { marks: [], object: "leaf", selections: [], text: "line two" },
      ],
    };

    expect(renderer.renderBlock(node, 0)).toEqual("> line one\n> line two\n");
  });

  it("renders a code block", () => {
    const node: BlockNode = {
      object: "block",
      type: "code",
      data: { syntax: "javascript" },
      nodes: [
        {
          object: "block",
          type: "code-line",
          nodes: [
            {
              object: "text",
              leaves: [{ object: "leaf", text: "// line one", marks: [] }],
            }
          ]
        },
        {
          object: "block",
          type: "code-line",
          nodes: [
            {
              object: "text",
              leaves: [{ object: "leaf", text: "// line two", marks: [] }],
            }
          ]
        },
      ],
    };

    expect(renderer.renderBlock(node, 0)).toEqual("```javascript\n// line one\n// line two\n```\n\n");
  });

  it("renders a paragraph", () => {
    const node: BlockNode = {
      object: "block",
      type: "paragraph",
      leaves: [
        { marks: [], object: "leaf", selections: [], text: "my paragraph" },
      ],
    };

    expect(renderer.renderBlock(node, 0)).toEqual("my paragraph\n\n");
  });

  it("renders an unknown block type", () => {
    const node: BlockNode = {
      object: "block",
      type: "who-knows",
      leaves: [{ marks: [], object: "leaf", selections: [], text: "my text" }],
    };

    expect(renderer.renderBlock(node, 0)).toEqual("my text");
  });
});

describe("renderInline()", () => {
  it("throws an error for unknown inline types", () => {
    const node: InlineNode = { object: "inline", type: "other-inline" };
    const renderer = new MarkdownRenderer();
    expect(() => renderer.renderInline(node, 0)).toThrowError(
      "Unknown inline type: other-inline"
    );
  });

  it("renders links", () => {
    const node: LinkNode = {
      object: "inline",
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

  it("renders images", () => {
    const node: ImageNode = {
      object: "inline",
      type: "inline-image",
      data: { caption: "my image", ref: { url: "https://example.com" }, size: "line" },
      leaves: [
        { marks: [], object: "leaf", selections: [], text: "link text" },
      ],
    };
    const renderer = new MarkdownRenderer();
    expect(renderer.renderInline(node, 0)).toEqual(
      "![my image](https://example.com)"
    );
  });

});

describe("renderLeaf()", () => {
  let renderer: MarkdownRenderer;

  beforeEach(() => {
    renderer = new MarkdownRenderer();
  });

  it("renders plain text", () => {
    const node: LeafNode = { object: "leaf", text: "my text", marks: [] };
    expect(renderer.renderLeaf(node, 0)).toEqual("my text");
  });

  it("renders bold text", () => {
    const node: LeafNode = { object: "leaf", text: "my text", marks: [{ object: "mark", type: "bold" }] };
    expect(renderer.renderLeaf(node, 0)).toEqual("**my text**");
  });

  it("renders italic text", () => {
    const node: LeafNode = {
      object: "leaf",
      text: "my text",
      marks: [{ object: "mark", type: "italic" }],
    };
    expect(renderer.renderLeaf(node, 0)).toEqual("_my text_");
  });

  it("renders bold and italic text", () => {
    const node: LeafNode = {
      object: "leaf",
      text: "my text",
      marks: [
        { object: "mark", type: "bold" },
        { object: "mark", type: "italic" },
      ],
    };
    expect(renderer.renderLeaf(node, 0)).toEqual("_**my text**_");
  });

  it("renders code", () => {
    const node: LeafNode = { object: "leaf", text: "my text", marks: [{ object: "mark", type: "code" }] };
    expect(renderer.renderLeaf(node, 0)).toEqual("`my text`");
  });
});
