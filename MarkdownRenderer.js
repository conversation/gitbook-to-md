class MarkdownRenderer {
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
        console.log(`${"-".repeat(depth)} ${node.object} - ${node.type}`);
        output += this.renderBlock(node, depth);
        break;

      case "text":
        console.log(`${"-".repeat(depth)} ${node.object}`);
        output += this.renderChildren(node, depth);
        break;

      case "leaf":
        console.log(`${"-".repeat(depth)} ${node.object}`);
        output += this.renderLeaf(node, depth);
        break;

      case "inline":
        console.log(`${"-".repeat(depth)} ${node.object}`);
        output += this.renderInline(node, depth);
        break;

      default:
        console.log(`Unknown object type: ${node.object}`);
        break;
    }

    return output;
  }

  renderBlock(node, depth) {
    let block = "";

    if (node.type.startsWith("heading-")) {
      let headingLevel = parseInt(node.type.split("-").pop());
      let mdHeader = "#".repeat(headingLevel) + " ";

      block += mdHeader;
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
    } else if (node.type == "blockquote") {
      block = block
        .split("\n")
        .map((line) => `> ${line}\n`)
        .join("");
    } else if (node.type == "list-unordered") {
      this.listDepth--;
      block += "\n";
    }

    return block;
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

    for (const n of node.nodes || []) {
      output += this.renderNode(n, depth + 1);
    }
    for (const n of node.leaves || []) {
      output += this.renderNode(n, depth + 1);
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

module.exports = MarkdownRenderer;
