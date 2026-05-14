function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatInline(text) {
  let output = escapeHtml(text);
  output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  output = output.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer">$1</a>',
  );
  return output;
}

export function parseMarkdownToHtml(markdown) {
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const html = [];
  let paragraph = [];
  let listOpen = false;
  let codeOpen = false;
  let codeBuffer = [];

  function flushParagraph() {
    if (paragraph.length === 0) return;
    html.push(`<p>${formatInline(paragraph.join(" "))}</p>`);
    paragraph = [];
  }

  function closeList() {
    if (!listOpen) return;
    html.push("</ul>");
    listOpen = false;
  }

  function closeCodeBlock() {
    if (!codeOpen) return;
    html.push(`<pre><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`);
    codeBuffer = [];
    codeOpen = false;
  }

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      flushParagraph();
      closeList();
      if (codeOpen) {
        closeCodeBlock();
      } else {
        codeOpen = true;
        codeBuffer = [];
      }
      continue;
    }

    if (codeOpen) {
      codeBuffer.push(line);
      continue;
    }

    if (line.trim() === "") {
      flushParagraph();
      closeList();
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      closeList();
      const level = headingMatch[1].length;
      html.push(`<h${level}>${formatInline(headingMatch[2])}</h${level}>`);
      continue;
    }

    const imageMatch = line.match(/^!\[(.*?)\]\(([^)\s]+)\)$/);
    if (imageMatch) {
      flushParagraph();
      closeList();
      const alt = escapeHtml(imageMatch[1] || "Embedded screenshot");
      const src = escapeHtml(imageMatch[2]);
      html.push(
        `<figure><img src="${src}" alt="${alt}" loading="lazy" /><figcaption>${alt}</figcaption></figure>`,
      );
      continue;
    }

    const listMatch = line.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      flushParagraph();
      if (!listOpen) {
        html.push("<ul>");
        listOpen = true;
      }
      html.push(`<li>${formatInline(listMatch[1])}</li>`);
      continue;
    }

    paragraph.push(line.trim());
  }

  closeCodeBlock();
  flushParagraph();
  closeList();
  return html.join("\n");
}
