const express = require("express");
const fs = require("fs");
const path = require("path");
const { marked } = require("marked");

const app = express();
const PORT = process.env.PORT || 3000;
const CONTENT_DIR = path.join(__dirname, "site", "content");

marked.setOptions({ gfm: true, breaks: false });

function listDocs() {
  return fs
    .readdirSync(CONTENT_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();
}

function titleFromFile(filename) {
  const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), "utf8");
  const match = raw.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : filename.replace(/\.md$/, "");
}

function slugFromFile(filename) {
  return filename.replace(/\.md$/, "");
}

function layout({ title, body, nav }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — ECU Repair Academy</title>
<style>
  :root {
    --bg: #0b0d12;
    --panel: #12151c;
    --border: #232733;
    --text: #e6e8ec;
    --muted: #9aa3b2;
    --accent: #f2a541;
    --accent2: #4ab8f0;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background: var(--bg);
    color: var(--text);
    display: flex;
    min-height: 100vh;
  }
  aside {
    width: 280px;
    flex-shrink: 0;
    background: var(--panel);
    border-right: 1px solid var(--border);
    padding: 24px 18px;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
  }
  aside h2 {
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--muted);
    margin: 0 0 14px;
  }
  aside a {
    display: block;
    color: var(--text);
    text-decoration: none;
    padding: 8px 10px;
    border-radius: 6px;
    font-size: 14px;
    margin-bottom: 2px;
  }
  aside a:hover { background: #1c2029; }
  aside a.active { background: var(--accent); color: #10131a; font-weight: 600; }
  main {
    flex: 1;
    padding: 40px 56px;
    max-width: 900px;
  }
  main h1, main h2, main h3 { color: #fff; }
  main h1 { border-bottom: 2px solid var(--accent); padding-bottom: 10px; }
  main a { color: var(--accent2); }
  main code {
    background: #1a1e27;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
  }
  main pre {
    background: #1a1e27;
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    border: 1px solid var(--border);
  }
  main table { border-collapse: collapse; width: 100%; margin: 16px 0; }
  main th, main td {
    border: 1px solid var(--border);
    padding: 8px 12px;
    text-align: left;
    font-size: 14px;
  }
  main th { background: #171b24; }
  main blockquote {
    border-left: 3px solid var(--accent);
    margin: 0;
    padding: 4px 16px;
    color: var(--muted);
    background: #14171f;
  }
  footer {
    margin-top: 60px;
    padding-top: 20px;
    border-top: 1px solid var(--border);
    color: var(--muted);
    font-size: 13px;
  }
  @media (max-width: 800px) {
    body { flex-direction: column; }
    aside { width: 100%; height: auto; position: relative; }
    main { padding: 24px; }
  }
</style>
</head>
<body>
<aside>
  <h2>ECU Repair Academy</h2>
  ${nav}
</aside>
<main>
  ${body}
  <footer>Jatelo Technologies Limited — ECU Repair Academy Study Notes</footer>
</main>
</body>
</html>`;
}

function buildNav(activeSlug) {
  return listDocs()
    .map((f) => {
      const slug = slugFromFile(f);
      const title = titleFromFile(f);
      const cls = slug === activeSlug ? "active" : "";
      return `<a class="${cls}" href="/${slug === "00-Index-ECU-Repair-Academy-Study-Notes" ? "" : slug}">${title}</a>`;
    })
    .join("\n");
}

app.get("/", (req, res) => {
  const indexFile = "00-Index-ECU-Repair-Academy-Study-Notes.md";
  const raw = fs.readFileSync(path.join(CONTENT_DIR, indexFile), "utf8");
  const html = layout({
    title: titleFromFile(indexFile),
    body: marked.parse(raw),
    nav: buildNav(slugFromFile(indexFile)),
  });
  res.send(html);
});

app.get("/:slug", (req, res) => {
  const filename = `${req.params.slug}.md`;
  const filePath = path.join(CONTENT_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send(
      layout({ title: "Not Found", body: "<h1>404 — Not Found</h1>", nav: buildNav("") })
    );
  }
  const raw = fs.readFileSync(filePath, "utf8");
  const html = layout({
    title: titleFromFile(filename),
    body: marked.parse(raw),
    nav: buildNav(req.params.slug),
  });
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`ECU Repair Academy notes site running on port ${PORT}`);
});
