class MarkdownRenderer {
  listDepth: number;

  constructor() {
    this.listDepth = 0;
  }

  render(node) {
    this.listDepth = 0;
    return this.stripTrailingWhitespace(this.renderNode(node));
  }

  renderNode(node, depth = 0) {
    let output = "";

    switch (node.object) {
      case "document":
        output += this.renderChildren(node, depth);
        break;

      case "block":
        output += this.renderBlock(node, depth);
        break;

      case "fragment":
        output += this.renderFragment(node, depth);
        break;

      case "text":
        output += this.renderChildren(node, depth);
        break;

      case "leaf":
        output += this.renderLeaf(node, depth);
        break;

      case "inline":
        output += this.renderInline(node, depth);
        break;

      default:
        break;
    }

    return output;
  }

  renderBlock(node, depth) {
    let block = "";

    if (node.type.startsWith("heading-")) {
      let headingLevel = parseInt(node.type.split("-").pop());
      block += "#".repeat(headingLevel) + " ";
    } else if (node.type == "list-unordered") {
      this.listDepth++;
    } else if (node.type == "list-item") {
      block += " ".repeat((this.listDepth - 1) * 2);
      block += "- ";
    }

    block += this.renderChildren(node, depth);

    if (node.type.startsWith("heading-")) {
      block += "\n\n";
    } else if (node.type == "paragraph") {
      block += "\n";
      if (this.listDepth == 0) block += "\n";
    } else if (node.type == "list-unordered") {
      this.listDepth--;
      block += "\n";
    } else if (node.type == "image") {
      block = `![${block.trim()}](/todo/path)\n\n`;
    } else if (node.type == "file") {
      block = `[${block.trim()}](/todo/path)\n\n`;
    } else if (node.type == "blockquote") {
      block = block
        .split("\n")
        .map((line) => `> ${line}\n`)
        .join("");
    }

    return block;
  }

  renderFragment(node, depth) {
    return this.renderChildren(node, depth);
  }

  renderInline(node, depth) {
    if (node.type != "link") throw `Unknown inline type: ${node.type}`;

    const text = this.renderChildren(node, depth);
    return `[${text}](${node.data.ref.url})`;
  }

  renderLeaf(node, depth) {
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

  renderChildren(node, depth) {
    let output = "";

    for (const childType of ["nodes", "leaves", "fragments"]) {
      for (const n of node[childType] || []) {
        output += this.renderNode(n, depth + 1);
      }
    }

    return output;
  }

  stripTrailingWhitespace(output) {
    return output
      .split("\n")
      .map((s) => s.trimEnd())
      .join("\n");
  }
}

export default MarkdownRenderer;
