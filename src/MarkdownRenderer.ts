import { isNullUndefinedOrEmptyString } from "./utils.js";
import axios from 'axios'

type Node = {
  object: string;
  nodes?: Array<Node | BlockNode | InlineNode | LeafNode>;
  leaves?: Array<LeafNode>;
  fragments?: Array<Node | BlockNode | InlineNode | LeafNode>;
};

type BlockNode = Node & {
  object: "block";
  type: string;
  data?: {
    syntax?: string;
    style?: string;
  };
};

type ImageBlockNode = BlockNode & {
  type: "image";
  isVoid: boolean;
  data: {
    ref: {
      kind: "file";
      file: string;
    };
  };
};

type FileBlockNode = BlockNode & {
  type: "file";
  data: {
    ref: {
      file: string;
    };
  };
};

type InlineNode = Node & {
  object: "inline";
  type: string;
  isVoid?: boolean;
  data?: {
    ref?: {
      kind?: string;
    };
  };
};

type LinkNode = InlineNode & {
  type: "link";
  data: { ref: { url: string } };
};

type gitbookLinkNode = InlineNode & {
  type: "link";
  data: { ref: { kind: "page" | "anchor"; page: string; anchor?: string } };
};

// two types: link image, or file in GitBook.
// Might make sense to split
type ImageLinkNode = InlineNode & {
  type: "inline-image";
  data: {
    caption: string;
    ref: {
      url: string;
    };
    size: string;
  };
};

type ImageFileNode = InlineNode & {
  type: "inline-image";
  data: {
    ref: {
      kind: string;
      file: string;
    };
    size: string;
  };
};

type EmojiNode = InlineNode & {
  type: "emoji";
  data: {
    code: string;
  };
};

type MathNode = InlineNode & {
  type: "inline-math";
  data: {
    formula: string;
  };
};

type AnnotationNode = InlineNode & {
  type: "annotation";
};

type Mark = {
  object: "mark";
  type: "bold" | "italic" | "code";
  data?: {};
};

type LeafNode = Node & {
  object: "leaf";
  text: string;
  marks: Array<Mark>;
  selections?: [];
};

type Files = {
  [id: string]: string;
};

type SpaceContentPage = {
  id: string;
  title: string;
  kind: "sheet" | "group" | "link";
  type: "group" | "document" | "link";
  description?: string;
  path?: string;
  slug?: string;
  pages?: SpaceContentPage[];
  href?: string;
  document?: Node;
};

// TODO: this is likely a duplicate of existing File type
type SpaceContentFile = {
  id: string;
  name: string;
  downloadURL: string;
  contentType: string;
};

type SpaceContent = {
  object: string;
  id: string;
  parents: string[];
  pages: SpaceContentPage[];
  files: SpaceContentFile[];
};

function isLinkNode(node: InlineNode): node is LinkNode {
  return node.type === "link";
}

function isGitbookLinkNode(node: InlineNode): node is gitbookLinkNode {
  return (
    node.type === "link" &&
    ["page", "anchor"].includes(node.data?.ref?.kind || "")
  );
}

function isImageLinkNode(node: InlineNode): node is ImageLinkNode {
  return node.type === "inline-image";
}

function isImageFileNode(node: InlineNode): node is ImageFileNode {
  return node.type === "inline-image" && node.data?.ref?.kind == "file";
}

function isEmojiNode(node: InlineNode): node is EmojiNode {
  return node.type === "emoji";
}
function isMathNode(node: InlineNode): node is MathNode {
  return node.type === "inline-math";
}
function isAnnotationNode(node: InlineNode): node is MathNode {
  return node.type === "annotation";
}
function isImageBlockNode(node: BlockNode): node is ImageBlockNode {
  return node.type === "image";
}
function isFileBlockNode(node: BlockNode): node is FileBlockNode {
  return node.type === "file";
}

class MarkdownRenderer {
  files: Files;
  spaceContent: SpaceContent;
  listCount: number[];
  listType: ("list-unordered" | "list-ordered")[];

  constructor(files: Files = {}, spaceContent: SpaceContent) {
    this.files = files;
    this.spaceContent = spaceContent;
    this.listCount = [];
    this.listType = [];
  }

  async render(node: Node) {
    this.listCount = [];
    this.listType = [];
    return this.stripTrailingWhitespace(await this.renderNode(node));
  }

  async renderNode(node: Node, depth: number = 0) {
    let output = "";

    switch (node.object) {
      case "document":
        output += await this.renderChildren(node, depth);
        break;

      case "block":
        output += await this.renderBlock(node as BlockNode, depth);
        break;

      case "fragment":
        output += await this.renderFragment(node, depth);
        break;

      case "text":
        output += await this.renderChildren(node, depth);
        break;

      case "leaf":
        output += this.renderLeaf(node as LeafNode, depth);
        break;

      case "inline":
        output += await this.renderInline(node as InlineNode, depth);
        break;

      default:
        break;
    }

    return output;
  }

  async renderBlock(node: BlockNode, depth: number) {
    let block = "";

    const getChildren = () => this.renderChildren(node, depth);

    if (node.type.startsWith("heading-")) {
      // Default to level 2 heading if undefined
      const headingLevel = parseInt(node.type.split("-").pop() || "2");
      const headingMark = "#".repeat(headingLevel);
      block = `${headingMark} ${await getChildren()}\n\n`;
    } else if (node.type == "paragraph") {
      block = await getChildren() + "\n";
      if (this.listCount.length == 0) block += "\n";
    } else if (node.type == "list-unordered" || node.type == "list-ordered") {
      this.listType.push(node.type);
      this.listCount.push(0);

      block += await getChildren();
      block += "\n";

      this.listType.pop();
      this.listCount.pop();
    } else if (node.type == "list-item") {
      const count = this.listCount[this.listCount.length - 1]++;
      block += " ".repeat((this.listCount.length - 1) * 2);

      if (this.listType.at(-1) == "list-unordered") {
        block += "- ";
      } else if (this.listType.at(-1) == "list-ordered") {
        block += `${count + 1}. `;
      }

      block += await getChildren();
    } else if (isImageBlockNode(node)) {
      const fileId = node.data.ref.file;
      let captionAltText = (await getChildren()).trim();
      block = await this.renderImageFile(fileId, captionAltText);
      block += "\n\n";
    } else if (isFileBlockNode(node)) {
      const fileId = node.data.ref.file;
      const filename = this.files[fileId];
      block = `[${(await getChildren()).trim()}](files/${filename})\n\n`;
    } else if (node.type == "code") {
      block += "```";
      if (node.data) block += node.data?.syntax || "";
      block += "\n";
      block += await getChildren();
      block += "```\n\n";
    } else if (node.type == "code-line") {
      block += await getChildren() + "\n";
    } else if (node.type == "blockquote") {
      block = (await getChildren())
        .split("\n")
        .map((line) => `> ${line}\n`)
        .join("");
    } else if (node.type == "hint") {
      let children = await getChildren();
      // hack to remove extra newlines on hint blocks
      if (children.slice(children.length - 2, children.length) === "\n\n") {
        children = children.slice(0, children.length - 2);
      }

      // https://docs.gitbook.com/content-creation/blocks/hint
      const hintStyleToEmoji: Record<string, string> = {
        info: "⏹",
        success: "✅",
        warning: "⚠️",
        danger: "🚩",
      };
      const styleKey = node.data?.style || "info";
      const symbolReplacementPrefix = hintStyleToEmoji[styleKey] + " ";
      block = children
        .split("\n")
        .map(
          (line, i) => `> ${i === 0 ? symbolReplacementPrefix : ""}${line}\n`
        )
        .join("");
      // add the newline back at the end, so that it pushes the next markdown block away.
      block += "\n";
    } else {
      block = await getChildren();
    }

    return block;
  }

  renderFragment(node: Node, depth: number) {
    return this.renderChildren(node, depth);
  }

  async renderInline(node: InlineNode, depth: number) {
    if (isLinkNode(node)) {
      const text = await this.renderChildren(node, depth);
      let url = "";
      let linkTitle = "";
      if (isGitbookLinkNode(node)) {
        const pageRef = node.data.ref.page;
        const anchor = node.data.ref.anchor ? `#${node.data.ref.anchor}` : "";
        // this ID can be tied back to a page slug and more using the `content.json` file
        url = pageRef;
        const pageInfo = this.findPageInfoFromGitbookPageRef(
          this.spaceContent.pages,
          pageRef
        );
        if (pageInfo) {
          url = `/${pageInfo?.path}`;
          linkTitle = ` "${pageInfo.title}"`;
        }
        if (!url) {
          // It's a link to the same document, so just use the anchor
          url = "";
        }
        // still add the anchor, since it's useful even without full page info
        url = `${url}${anchor}`;
      } else {
        url = node.data.ref.url;
        linkTitle = "";
      }
      return `[${text}](${url}${linkTitle})`;
    } else if (isImageFileNode(node)) {
      const imageRef = node.data.ref.file;
      const captionAltText = await this.renderChildren(node, depth);
      return await this.renderImageFile(imageRef, captionAltText);
    } else if (isImageLinkNode(node)) {
      const text = node.data.caption;
      const url = node.data.ref.url;
      return `![${text}](${url})`;
    } else if (isEmojiNode(node)) {
      const unicode_hex_code_point = node.data.code;
      const hex_val = Number(`0x${unicode_hex_code_point}`);
      return `${String.fromCodePoint(hex_val)} `;
    } else if (isMathNode(node)) {
      return `$$${node.data.formula}$$`;
    } else if (isAnnotationNode(node)) {
      return `> ${await this.renderChildren(node, depth)}`;
    } else {
      throw `Unknown inline type: ${node.type}`;
    }
  }

  renderLeaf(node: LeafNode, depth: number) {
    let text = node.text;

    for (const mark of node.marks) {
      // Get the whitespace before the mark
      const whitespaceBefore = text.match(/^\s*/)?.[0] || "";
      // Get the whitespace after the mark
      const whitespaceAfter = text.match(/\s*$/)?.[0] || "";
      switch (mark.type) {
        case "bold":
          text = `**${text.trim()}**`;
          break;
        case "italic":
          text = `_${text.trim()}_`;
          break;
        case "code":
          text = `\`${text.trim()}\``;
          break;
      }
      text = `${whitespaceBefore}${text}${whitespaceAfter}`;
    }

    return text;
  }

  async renderChildren(node: Node, depth: number) {
    let output = "";

    for (const n of node.nodes || []) {
      output +=  await this.renderNode(n, depth + 1);
    }
    for (const n of node.leaves || []) {
      output += await this.renderNode(n, depth + 1);
    }
    for (const n of node.fragments || []) {
      output += await this.renderNode(n, depth + 1);
    }

    return output;
  }

  stripTrailingWhitespace(output: string) {
    return output
      .split("\n")
      .map((s) => s.trimEnd())
      .join("\n");
  }

  findPageInfoFromGitbookPageRef(
    searchPages: SpaceContentPage[],
    gitbookPageRef: string
  ): SpaceContentPage | null {
    for (const p of searchPages) {
      if (p.id === gitbookPageRef) {
        return p;
      } else if (p.pages) {
        // didn't find at top level, now do recursive pages
        let pageInfo: SpaceContentPage | null = null;
        pageInfo = this.findPageInfoFromGitbookPageRef(p.pages, gitbookPageRef);
        if (pageInfo) {
          return pageInfo;
        }
      }
    }
    return null;
  }

  async renderImageFile(imageRefID: string, captionAltText: string = "") {
    // TODO: this ignores existing captions
    const fileInfo = this.findFileInfoFromGitbookFileRef(
      this.spaceContent.files,
      imageRefID
    );
    const filename = fileInfo?.name || "unknown-file";
    const filesRef = `files/${fileInfo?.id}.${filename}`;
    captionAltText = isNullUndefinedOrEmptyString(captionAltText)
      ? filename
      : captionAltText;
    if (fileInfo) {
      if (process.env.DOWNLOAD_IMAGES === 'true' && fileInfo.downloadURL) {
        // Download the file and embed it as base64
        console.log(`Downloading ${filename} (${fileInfo.id})...`);
        const file = await axios.get(fileInfo.downloadURL, { responseType: "arraybuffer" });
        const base64 = Buffer.from(file.data, 'binary').toString('base64');
        return `![${captionAltText}](data:${fileInfo.contentType};base64,${base64})`;
      }
      return `![${captionAltText}](${filesRef} "${fileInfo?.downloadURL}")`;
    }
    return `![unknown-file.${imageRefID}]()`;
  }

  findFileInfoFromGitbookFileRef(
    files: SpaceContentFile[],
    fileRef: string
  ): SpaceContentFile | null {
    for (const f of files) {
      if (f.id === fileRef) {
        return f;
      }
    }
    return null;
  }
}
export type {
  Node,
  BlockNode,
  ImageBlockNode,
  InlineNode,
  LinkNode,
  gitbookLinkNode,
  ImageLinkNode as ImageLinkNode,
  ImageFileNode,
  EmojiNode,
  LeafNode,
  Files,
  SpaceContent,
  SpaceContentFile,
  SpaceContentPage,
};
export default MarkdownRenderer;
