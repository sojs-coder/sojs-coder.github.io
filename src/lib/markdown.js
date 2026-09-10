function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeUrl(value, image = false) {
  if (/[\u0000-\u0020\u007f\\]/.test(value) || value.startsWith('//')) return false;
  try {
    const url = new URL(value, 'https://portfolio.invalid/');
    return ['http:', 'https:', ...(image ? [] : ['mailto:'])].includes(url.protocol);
  } catch { return false; }
}

function formatInline(text, links = true) {
  // Tokenize before escaping so formatting never rewrites code or generated attributes.
  const pattern = /`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let html = '', end = 0;
  for (const match of text.matchAll(pattern)) {
    html += escapeHtml(text.slice(end, match.index));
    const [raw, code, label, url, strong, emphasis] = match;
    if (code !== undefined) html += `<code>${escapeHtml(code)}</code>`;
    else if (label !== undefined) html += links && safeUrl(url)
      ? `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${formatInline(label, false)}</a>`
      : escapeHtml(label);
    else if (strong !== undefined) html += `<strong>${escapeHtml(strong)}</strong>`;
    else html += `<em>${escapeHtml(emphasis)}</em>`;
    end = match.index + raw.length;
  }
  return html + escapeHtml(text.slice(end));
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
      if (!safeUrl(imageMatch[2], true)) {
        html.push(`<p>${alt}</p>`);
        continue;
      }
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
