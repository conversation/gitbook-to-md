type Node = {
  object: string;
  nodes?: Array<Node | BlockNode | InlineNode | LeafNode>;
  leaves?: Array<LeafNode>;
  fragments?: Array<Node | BlockNode | InlineNode | LeafNode>;
};

type BlockNode = Node & {
  object: "block";
  type: string;
};

type InlineNode = Node & {
  object: "inline";
  type: string;
};

type LinkNode = InlineNode & {
  type: "link";
  data: { ref: { url: string } };
};

type ImageNode = InlineNode & {
  type: "inline-image";
  data: {
    caption: string,
    ref: {
      url: string
    },
    size: string,
  };
};

type Mark = {
  object: "mark";
  type: "bold" | "italic" | "code";
};

type LeafNode = Node & {
  object: "leaf";
  text: string;
  marks: Array<Mark>;
  selections?: [];
};

function isLinkNode(node: InlineNode): node is LinkNode {
  return node.type === "link";
}
function isImageNode(node: InlineNode): node is ImageNode {
  return node.type === "inline-image";
}

class MarkdownRenderer {
  listCount: number[];
  listType: ("list-unordered" | "list-ordered")[];

  constructor() {
    this.listCount = [];
    this.listType = [];
  }

  render(node: Node) {
    this.listCount = [];
    this.listType = [];
    return this.stripTrailingWhitespace(this.renderNode(node));
  }

  renderNode(node: Node, depth: number = 0) {
    let output = "";

    switch (node.object) {
      case "document":
        output += this.renderChildren(node, depth);
        break;

      case "block":
        output += this.renderBlock(node as BlockNode, depth);
        break;

      case "fragment":
        output += this.renderFragment(node, depth);
        break;

      case "text":
        output += this.renderChildren(node, depth);
        break;

      case "leaf":
        output += this.renderLeaf(node as LeafNode, depth);
        break;

      case "inline":
        output += this.renderInline(node as InlineNode, depth);
        break;

      default:
        break;
    }

    return output;
  }

  renderBlock(node: BlockNode, depth: number) {
    let block = "";

    const getChildren = () => this.renderChildren(node, depth);

    if (node.type.startsWith("heading-")) {
      // Default to level 2 heading if undefined
      const headingLevel = parseInt(node.type.split("-").pop() || "2");
      const headingMark = "#".repeat(headingLevel);
      block = `${headingMark} ${getChildren()}\n\n`;

    } else if (node.type == "paragraph") {
      block = getChildren() + "\n";
      if (this.listCount.length == 0) block += "\n";

    } else if (node.type == "list-unordered" || node.type == "list-ordered") {
      this.listType.push(node.type);
      this.listCount.push(0);

      block += getChildren();
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

      block += getChildren();

    } else if (node.type == "image") {
      block = `![${getChildren().trim()}](/todo/path)\n\n`;

    } else if (node.type == "file") {
      block = `[${getChildren().trim()}](/todo/path)\n\n`;

    } else if (node.type == "blockquote") {
      block = getChildren()
        .split("\n")
        .map((line) => `> ${line}\n`)
        .join("");

    } else {
      block = getChildren();
    }

    return block;
  }

  renderFragment(node: Node, depth: number) {
    return this.renderChildren(node, depth);
  }

  renderInline(node: InlineNode, depth: number) {
    if (isLinkNode(node)) {
      const text = this.renderChildren(node, depth);
      const url = node.data.ref.url;
      return `[${text}](${url})`;
    } else if (isImageNode(node)) {
      const text = node.data.caption;
      const url = node.data.ref.url;
      return `![${text}](${url})`;
    } else {
      throw `Unknown inline type: ${node.type}`;
    }
  }

  renderLeaf(node: LeafNode, depth: number) {
    let text = node.text;

    for (const mark of node.marks) {
      switch (mark.type) {
        case "bold":
          text = `**${text}**`;
          break;
        case "italic":
          text = `_${text}_`;
          break;
        case "code":
          text = `\`${text}\``;
          break;
      }
    }

    return text;
  }

  renderChildren(node: Node, depth: number) {
    let output = "";

    for (const n of node.nodes || []) {
      output += this.renderNode(n, depth + 1);
    }
    for (const n of node.leaves || []) {
      output += this.renderNode(n, depth + 1);
    }
    for (const n of node.fragments || []) {
      output += this.renderNode(n, depth + 1);
    }

    return output;
  }

  stripTrailingWhitespace(output: string) {
    return output
      .split("\n")
      .map((s) => s.trimEnd())
      .join("\n");
  }
}
export type { Node, BlockNode, InlineNode, LinkNode, ImageNode, LeafNode };
export default MarkdownRenderer;
