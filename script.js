/* AG CraftNode download site — README fetch + render */

const FALLBACK_README = `# AG CraftNode

AG CraftNode is a local Minecraft server manager for creating, configuring, and running server instances from a desktop app.

## Features
- Create and manage multiple local Minecraft servers
- Install and configure Java-based server versions
- Start, stop, and monitor server state
- Manage plugins, server config, and tunnel setup
- Use themed desktop UI and local asset branding

## Run locally

From the project root:

\`\`\`bash
python main.py
\`\`\`

If you are using the project virtual environment:

\`\`\`bash
.venv\\Scripts\\python.exe main.py
\`\`\`

## Project structure

- \`main.py\` – application entry point
- \`app/\` – modular configuration and theme helpers
- \`assets/\` – app branding assets, including \`icon.ico\`
- \`servers/\` – server data and world folders
- \`java/\` – bundled Java runtimes

## Notes
- The app icon and window icon are loaded from \`assets/icon.ico\`.
- This project is currently versioned as \`v0.0.1\`.
`;

const DOWNLOAD_FILE = "downloads/AG-CraftNode-v0.0.1-Windows.zip";

/* ---------- helpers ---------- */

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inlineCode(s) {
  return esc(s).replace(/`([^`]+)`/g, "<code>$1</code>");
}

/* ---------- markdown parsing ---------- */

function parseReadme(md) {
  const sections = [];
  let current = null;
  let inCode = false;
  let codeLines = [];
  let codeLang = "";

  for (const line of md.split(/\r?\n/)) {
    const h2 = line.match(/^##\s+(.*)/);
    if (h2 && !inCode) {
      current = { title: h2[1].trim(), blocks: [] };
      sections.push(current);
      continue;
    }
    if (!current) continue;

    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      if (inCode) {
        current.blocks.push({ type: "code", lang: codeLang, text: codeLines.join("\n") });
        inCode = false;
        codeLines = [];
      } else {
        inCode = true;
        codeLang = fence[1];
        codeLines = [];
      }
      continue;
    }
    if (inCode) { codeLines.push(line); continue; }

    if (/^-\s+/.test(line)) {
      current.blocks.push({ type: "li", text: line.replace(/^-\s+/, "").trim() });
    } else if (line.trim() === "") {
      current.blocks.push({ type: "break" });
    } else {
      const last = current.blocks[current.blocks.length - 1];
      if (last && last.type === "p") last.text += " " + line.trim();
      else current.blocks.push({ type: "p", text: line.trim() });
    }
  }
  if (inCode && current) current.blocks.push({ type: "code", lang: codeLang, text: codeLines.join("\n") });
  return sections;
}

function findSection(sections, name) {
  return sections.find(s => s.title.toLowerCase() === name.toLowerCase());
}

/* ---------- section renderers ---------- */

const FEATURE_ICONS = [
  [/java/i, { icon: "☕", title: "Java Made Easy" }],
  [/start|stop|monitor/i, { icon: "⏯️", title: "Start · Stop · Monitor" }],
  [/plugin|tunnel/i, { icon: "🔌", title: "Plugins & Tunnels" }],
  [/create|manage/i, { icon: "🖥️", title: "Multi-Server Manager" }],
  [/ui|branding/i, { icon: "🎨", title: "Themed Desktop UI" }],
];

function renderFeatures(section, chipEl) {
  const grid = document.getElementById("features-grid");
  const items = section.blocks.filter(b => b.type === "li");
  grid.innerHTML = items.map(item => {
    const match = FEATURE_ICONS.find(([re]) => re.test(item.text));
    const meta = match ? match[1] : { icon: "⛏️", title: "Feature" };
    return `<article class="feature-card">
      <span class="feature-icon">${meta.icon}</span>
      <strong>${esc(meta.title)}</strong>
      <p>${inlineCode(item.text)}</p>
    </article>`;
  }).join("");
  chipEl.textContent = "Loaded live from README.md";
  chipEl.classList.add("ok");
}

function renderRunLocally(section, chipEl) {
  const box = document.getElementById("runlocally-content");
  box.innerHTML = section.blocks
    .filter(b => b.type === "p" || b.type === "code")
    .map(b => b.type === "code"
      ? `<pre class="code-block"><code>${esc(b.text)}</code></pre>`
      : `<p class="run-para">${esc(b.text)}</p>`)
    .join("");
  chipEl.textContent = "Loaded live from README.md";
  chipEl.classList.add("ok");
}

function renderProject(section, chipEl) {
  const box = document.getElementById("projectstructure-content");
  const items = section.blocks.filter(b => b.type === "li");
  box.innerHTML = items.map(item => {
    const m = item.text.match(/^`?([^`–]+)`?\s*[–-]\s*(.*)$/);
    const path = m ? m[1].trim() : item.text;
    const desc = m ? m[2].trim() : "";
    return `<div class="project-entry">
      <span class="project-path">${esc(path)}</span>
      <span class="project-desc">${inlineCode(desc)}</span>
    </div>`;
  }).join("");
  chipEl.textContent = "Loaded live from README.md";
  chipEl.classList.add("ok");
}

function renderNotes(section, chipEl) {
  const box = document.getElementById("notes-content");
  const items = section.blocks.filter(b => b.type === "li");
  box.innerHTML = items.map(item => `<li>${inlineCode(item.text)}</li>`).join("");
  chipEl.textContent = "Loaded live from README.md";
  chipEl.classList.add("ok");
}

function renderGeneric(section) {
  const main = document.querySelector("main");
  const sec = document.createElement("section");
  sec.className = "section";
  sec.innerHTML = `<div class="section-head"><h2>${esc(section.title)}</h2></div>
    <div class="notes-list"></div>`;
  const list = sec.querySelector(".notes-list");
  section.blocks.forEach(b => {
    if (b.type === "li") list.insertAdjacentHTML("beforeend", `<li>${inlineCode(b.text)}</li>`);
    else if (b.type === "code") sec.insertAdjacentHTML("beforeend", `<pre class="code-block"><code>${esc(b.text)}</code></pre>`);
    else if (b.type === "p") sec.insertAdjacentHTML("beforeend", `<p class="run-para">${esc(b.text)}</p>`);
  });
  main.appendChild(sec);
}

/* ---------- fetch + fallback ---------- */

function renderReadme(md, live) {
  const sections = parseReadme(md);
  const status = document.getElementById("fetch-status");
  const routes = [
    ["Features", renderFeatures, "src-features"],
    ["Run locally", renderRunLocally, "src-runlocally"],
    ["Project structure", renderProject, "src-projectstructure"],
    ["Notes", renderNotes, "src-notes"],
  ];

  let rendered = 0;
  for (const [name, fn, chipId] of routes) {
    const chip = document.getElementById(chipId);
    const sec = findSection(sections, name);
    if (sec) { fn(sec, chip); rendered++; }
    else chip.textContent = "Section not found in README.md";
  }

  sections.forEach(sec => {
    if (!routes.some(([name]) => name.toLowerCase() === sec.title.toLowerCase())) renderGeneric(sec);
  });

  if (live) {
    status.textContent = `✔ ${rendered} section${rendered === 1 ? "" : "s"} fetched live from README.md`;
    status.classList.add("ok");
  } else {
    status.textContent = "⚡ fetch unavailable here — showing embedded README copy (host the site over HTTP for live fetch)";
    status.classList.add("fallback");
    document.querySelectorAll(".section-src").forEach(el => {
      if (el.classList.contains("ok")) {
        el.textContent = "Embedded README copy";
        el.classList.remove("ok");
        el.classList.add("fallback");
      }
    });
  }
}

function loadReadme() {
  fetch("README.md", { cache: "no-store" })
    .then(res => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    })
    .then(md => renderReadme(md, true))
    .catch(() => renderReadme(FALLBACK_README, false));
}

/* ---------- download size (best effort) ---------- */

function updateDownloadSize() {
  const el = document.getElementById("dl-size");
  fetch(DOWNLOAD_FILE, { method: "HEAD" })
    .then(res => {
      const len = parseInt(res.headers.get("Content-Length"), 10);
      if (!len) return;
      el.textContent = len > 1048576
        ? (len / 1048576).toFixed(1) + " MB"
        : Math.round(len / 1024) + " KB";
    })
    .catch(() => {});
}

/* ---------- hero console animation ---------- */

const CONSOLE_LINES = [
  ['<span class="c-dim">[AG CraftNode]</span> starting server: "My Survival"'],
  ['<span class="c-dim">[AG CraftNode]</span> Java 21 runtime ready'],
  ['<span class="c-dim">[AG CraftNode]</span> paper-1.21.4.jar <span class="c-gold">downloaded</span>'],
  ['<span class="c-dim">[Server]</span> Starting minecraft server 1.21.4'],
  ['<span class="c-dim">[Server]</span> Preparing level "world"'],
  ['<span class="c-dim">[Server]</span> <span class="c-gold">Done (3.214s)!</span> For help, type "help"'],
  ['<span class="c-dim">[Tunnel]</span> <span class="c-cyan">playit.gg → best-craft-42.playit.gg</span>'],
  ['<span class="c-dim">[AG CraftNode]</span> online-mode: false — <span class="c-gold">cracked clients can join</span>'],
];

function animateConsole() {
  const body = document.getElementById("console-body");
  let i = 0;
  function next() {
    if (i < CONSOLE_LINES.length) {
      body.insertAdjacentHTML("beforeend", CONSOLE_LINES[i] + "\n");
      i++;
      setTimeout(next, 550 + Math.random() * 450);
    } else {
      body.insertAdjacentHTML("beforeend", '<span class="c-cursor"></span>');
    }
  }
  next();
}

loadReadme();
updateDownloadSize();
animateConsole();
