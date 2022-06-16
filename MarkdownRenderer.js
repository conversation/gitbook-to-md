class MarkdownRenderer {
  render(node, output = [], depth = 0) {
    switch (node.object) {
      case "document":
        output = this.renderChildren(node, output, depth);
        break;

      case "block":
        console.log(`${"-".repeat(depth)} ${node.object} - ${node.type}`);
        output.push(this.renderBlock(node, output, depth));
        break;

      case "text":
        console.log(`${"-".repeat(depth)} ${node.object}`);
        output = this.renderChildren(node, output, depth);
        break;

      case "leaf":
        console.log(`${"-".repeat(depth)} ${node.object}`);
        output = this.renderLeaf(node, output, depth);
        break;

      case "inline":
        console.log(`${"-".repeat(depth)} ${node.object}`);
        output = this.renderInline(node, output, depth);
        break;

      default:
        console.log(`Unknown object type: ${node.object}`);
        break;
    }

    return output;
  }

  renderBlock(block, output, depth) {
    if (block.type.startsWith("heading-")) {
      let headingLevel = parseInt(block.type.split("-").pop());
      let mdHeader = "#".repeat(headingLevel) + " ";

      output.push(mdHeader);
    } else if (block.type == "list-item") {
      output.push("- ");
    }

    output = this.renderChildren(block, output, depth);

    if (block.type == "paragraph" || block.type.startsWith("heading-")) {
      output.push("\n\n");
    }

    return output;
  }

  renderInline(node, output, depth) {
    if (node.type != "link") throw `Unknown inline type: ${node.type}`;

    const text = this.renderChildren(node, [], depth);
    output.push(`[${text.join()}](${node.data.ref.url})`);
    return output;
  }

  renderLeaf(node, output, depth) {
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

    output.push(text);

    return output;
  }

  renderChildren(node, output, depth) {
    for (const n of node.nodes || []) {
      output = this.render(n, output, depth + 1);
    }
    for (const n of node.leaves || []) {
      output = this.render(n, output, depth + 1);
    }
    return output;
  }
}

module.exports = MarkdownRenderer;
