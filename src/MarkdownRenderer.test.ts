import { promises as fs } from "fs";
import MarkdownRenderer from "./MarkdownRenderer";
import type {
  BlockNode,
  InlineNode,
  LinkNode,
  gitbookLinkNode,
  ImageLinkNode,
  EmojiNode,
  LeafNode,
  Files,
  SpaceContent,
  SpaceContentFile,
  SpaceContentPage,
  ImageFileNode,
} from "./MarkdownRenderer";

const defaultSpaceContentTestInitializer: SpaceContent = {
  object: "revision",
  id: "-MVYmSNifA9RV4lb6xiN",
  parents: ["-MOnQAmPI8w7ceDocqT1"],
  pages: [],
  files: [],
};
const FilesInitializer: Files = {};

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

    const renderer = new MarkdownRenderer(
      FilesInitializer,
      defaultSpaceContentTestInitializer
    );
    const output: string = renderer.render(doc);

    expect(output).toEqual(expectedMd);
  });

  it("renders nested list items", async () => {
    const renderer = new MarkdownRenderer(
      FilesInitializer,
      defaultSpaceContentTestInitializer
    );
    const json = await fs.readFile("fixtures/nested-list.json", "utf8");
    const node = JSON.parse(json).document;
    const result: string = renderer.render(node);

    expect(result).toEqual("- list item\n  - nested item\n\n\n");
  });

  it("renders mixed type nested list items", async () => {
    const renderer = new MarkdownRenderer(
      FilesInitializer,
      defaultSpaceContentTestInitializer
    );
    const json = await fs.readFile(
      "fixtures/mixed-order-nested-list.json",
      "utf8"
    );
    const node = JSON.parse(json).document;
    const result: string = renderer.render(node);

    expect(result).toEqual(
      "1. One\n  - Nested unordered\n\n2. Two\n  1. Nested ordered\n\n\n"
    );
  });

  it("renders images", async () => {
    const files = { VlKCZMuShVzkE0pdnffR: "my-image.png" };
    const renderer = new MarkdownRenderer(
      files,
      defaultSpaceContentTestInitializer
    );
    const json = await fs.readFile("fixtures/images.json", "utf8");
    const node = JSON.parse(json).document;
    const result: string = renderer.render(node);

    expect(result).toEqual("![This is a caption](files/my-image.png)\n\n");
  });

  it("renders files", async () => {
    const files = { bYxy1vsBYjP2bXkJKFCb: "my-file.txt" };
    const renderer = new MarkdownRenderer(
      files,
      defaultSpaceContentTestInitializer
    );
    const json = await fs.readFile("fixtures/files.json", "utf8");
    const node = JSON.parse(json).document;
    const result: string = renderer.render(node);

    expect(result).toEqual("[This is a file](files/my-file.txt)\n\n");
  });
});

describe("renderBlock()", () => {
  let renderer: MarkdownRenderer;

  beforeEach(() => {
    renderer = new MarkdownRenderer(
      FilesInitializer,
      defaultSpaceContentTestInitializer
    );
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

  it("renders a hint", () => {
    const node: BlockNode = {
      object: "block",
      type: "hint",
      data: {
        style: "info",
      },
      nodes: [
        {
          object: "block",
          type: "paragraph",
          data: {},
          nodes: [
            {
              object: "text",
              leaves: [
                {
                  object: "leaf",
                  text: "An important hint callout block for user information.",
                  marks: [],
                  selections: [],
                },
              ],
            },
            {
              object: "text",
              leaves: [
                {
                  object: "leaf",
                  text: " Continued text.\nWith a newline.",
                  marks: [],
                  selections: [],
                },
              ],
            },
          ],
        },
      ],
    };

    // it renders with 2 extra newlines which end up harmless, not worth diggin for now. Hack in place in renderBlock()
    // - Culprit is at the `(node.type == "paragraph") {` section adding extra \n's.
    expect(renderer.renderBlock(node, 0)).toEqual(
      "> ⏹ An important hint callout block for user information. Continued text.\n> With a newline.\n\n"
    );
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
            },
          ],
        },
        {
          object: "block",
          type: "code-line",
          nodes: [
            {
              object: "text",
              leaves: [{ object: "leaf", text: "// line two", marks: [] }],
            },
          ],
        },
      ],
    };

    expect(renderer.renderBlock(node, 0)).toEqual(
      "```javascript\n// line one\n// line two\n```\n\n"
    );

    // also handle if they don't have syntax defined
    node.data = {};
    expect(renderer.renderBlock(node, 0)).toEqual(
      "```\n// line one\n// line two\n```\n\n"
    );
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
    const renderer = new MarkdownRenderer(
      FilesInitializer,
      defaultSpaceContentTestInitializer
    );
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
    const renderer = new MarkdownRenderer(
      FilesInitializer,
      defaultSpaceContentTestInitializer
    );
    expect(renderer.renderInline(node, 0)).toEqual(
      "[link text](https://example.com)"
    );
  });

  it("renders Gitbook page links", () => {
    const node: gitbookLinkNode = {
      object: "inline",
      type: "link",
      isVoid: false,
      data: {
        ref: {
          kind: "page",
          page: "-M9UwQjn8e1kKADwPrrF",
        },
      },
      nodes: [
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: "installing",
              marks: [
                {
                  object: "mark",
                  type: "bold",
                  data: {},
                },
              ],
              selections: [],
            },
          ],
        },
      ],
    };

    const spaceContent: SpaceContent = {
      object: "revision",
      id: "qCxFzUy2hI6unJ3GmG4Y",
      parents: ["6GqIbuAopAEOTYSG9sQZ", "no294apqgYMSpghDgOHp"],
      files: [],
      pages: [
        {
          id: "-M9UwQjmVoE_PKEmahWz",
          title: "Getting started",
          kind: "group",
          type: "group",
          path: "getting-started",
          slug: "getting-started",
          pages: [
            {
              id: "-M9UwQjn8e1kKADwPrrF",
              title: "Install Title",
              kind: "sheet",
              type: "document",
              description: "",
              path: "getting-started/install",
              slug: "install",
              pages: [],
            },
          ],
        },
      ],
    };

    const renderer = new MarkdownRenderer(FilesInitializer, spaceContent);
    expect(renderer.renderInline(node, 0)).toEqual(
      `[**installing**](/getting-started/install "Install Title")`
    );

    // also anchor type
    node.data = {
      ref: {
        kind: "anchor",
        anchor: "list-of-ids",
        page: "-M9UwQjn8e1kKADwPrrF",
      },
    };
    expect(renderer.renderInline(node, 0)).toEqual(
      `[**installing**](/getting-started/install#list-of-ids "Install Title")`
    );
  });

  it("renders inline link images", () => {
    const node: ImageLinkNode = {
      object: "inline",
      type: "inline-image",
      data: {
        caption: "my image",
        ref: { url: "https://example.com" },
        size: "line",
      },
      leaves: [
        { marks: [], object: "leaf", selections: [], text: "link text" },
      ],
    };
    const renderer = new MarkdownRenderer(
      FilesInitializer,
      defaultSpaceContentTestInitializer
    );
    expect(renderer.renderInline(node, 0)).toEqual(
      "![my image](https://example.com)"
    );
  });

  it("renders inline file imagess with no info in Space", () => {
    const node: ImageFileNode = {
      object: "inline",
      type: "inline-image",
      data: {
        ref: {
          kind: "file",
          file: "-M9ar8a0oxijwIvaQYA4",
        },
        size: "original",
      },
      nodes: [
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: "",
              marks: [],
              selections: [],
            },
          ],
        },
      ],
    };
    const renderer = new MarkdownRenderer(
      FilesInitializer,
      defaultSpaceContentTestInitializer
    );
    expect(renderer.renderInline(node, 0)).toEqual(
      "![unknown-image-file.-M9ar8a0oxijwIvaQYA4]()"
    );
  });

  it("renders inline file images with info in Space", () => {
    const spaceContent: SpaceContent = JSON.parse(
      JSON.stringify(defaultSpaceContentTestInitializer)
    );
    spaceContent.files = [
      {
        id: "-MC0GpDJ0v0g6fZ7qshj",
        name: "image.png",
        downloadURL:
          "https://files.gitbook.com/v0/b/gitbook-legacy-files/o/assets%2F-M8N-2NuR5V0ryoqtTWk%2F-MC0GoHeyr3P9glwOxk7%2F-MC0GpDJ0v0g6fZ7qshj%2Fimage.png?alt=media&token=5246ece1-816a-4432-b066-0f6709b06b4f",
        contentType: "image/png",
      },
    ];
    const node: ImageFileNode = {
      object: "inline",
      type: "inline-image",
      data: {
        ref: {
          kind: "file",
          file: "-MC0GpDJ0v0g6fZ7qshj",
        },
        size: "original",
      },
      nodes: [
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: "",
              marks: [],
              selections: [],
            },
          ],
        },
      ],
    };
    const renderer = new MarkdownRenderer(FilesInitializer, spaceContent);
    expect(renderer.renderInline(node, 0)).toEqual(
      '![download: https://files.gitbook.com/v0/b/gitbook-legacy-files/o/assets%2F-M8N-2NuR5V0ryoqtTWk%2F-MC0GoHeyr3P9glwOxk7%2F-MC0GpDJ0v0g6fZ7qshj%2Fimage.png?alt=media&token=5246ece1-816a-4432-b066-0f6709b06b4f](image.png "-MC0GpDJ0v0g6fZ7qshj")'
    );
  });

  it("renders emojis", () => {
    const node: EmojiNode = {
      object: "inline",
      type: "emoji",
      isVoid: true,
      data: {
        code: "1f510",
      },
      nodes: [
        {
          object: "text",
          leaves: [
            {
              object: "leaf",
              text: "",
              marks: [],
              selections: [],
            },
          ],
        },
      ],
    };
    const renderer = new MarkdownRenderer(
      FilesInitializer,
      defaultSpaceContentTestInitializer
    );
    expect(renderer.renderInline(node, 0)).toEqual("🔐 ");
  });
});

describe("renderLeaf()", () => {
  let renderer: MarkdownRenderer;

  beforeEach(() => {
    renderer = new MarkdownRenderer(
      FilesInitializer,
      defaultSpaceContentTestInitializer
    );
  });

  it("renders plain text", () => {
    const node: LeafNode = { object: "leaf", text: "my text", marks: [] };
    expect(renderer.renderLeaf(node, 0)).toEqual("my text");
  });

  it("renders bold text", () => {
    const node: LeafNode = {
      object: "leaf",
      text: "my text",
      marks: [{ object: "mark", type: "bold" }],
    };
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
    const node: LeafNode = {
      object: "leaf",
      text: "my text",
      marks: [{ object: "mark", type: "code" }],
    };
    expect(renderer.renderLeaf(node, 0)).toEqual("`my text`");
  });
});
