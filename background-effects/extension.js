const vscode = require('vscode');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const PORT = Number(process.env.BG_EFFECTS_PORT) || 38417;
const DIR = path.join(os.homedir(), '.vscode', 'bg-effects');
const STATE_FILE = path.join(DIR, 'state.json');
const IMAGE_FILE = path.join(DIR, 'image.dat');
const MAX_BODY = 60 * 1024 * 1024;

const AREAS = ['sidebar', 'editor', 'panel', 'aux', 'bars'];
const LANGS = ['en', 'vi'];
const VIEW_TITLES = { en: 'Background & Effects', vi: 'Nền & hiệu ứng' };
const DEFAULTS = {
  opacity: 100, tint: 45, blur: 0, grain: 20, shadow: 80,
  fit: 'fit',
  areas: { sidebar: true, editor: true, panel: true, aux: true, bars: true },
  image: 'pattern', imageName: 'Pattern 5K', imageRev: 0
};

function defaultLang() {
  return String(vscode.env.language || 'en').toLowerCase().startsWith('vi') ? 'vi' : 'en';
}

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch (e) {
    return null;
  }
}

function writeState(state) {
  fs.mkdirSync(DIR, { recursive: true });
  const tmp = STATE_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(state));
  fs.renameSync(tmp, STATE_FILE);
}

function currentState() {
  const saved = readState() || {};
  const state = Object.assign({}, DEFAULTS, saved);
  state.areas = Object.assign({}, DEFAULTS.areas, saved.areas);
  state.lang = LANGS.indexOf(saved.lang) >= 0 ? saved.lang : defaultLang();
  return state;
}

function update(patch) {
  const prev = currentState();
  const next = Object.assign({}, prev, patch, { rev: (prev.rev || 0) + 1 });
  writeState(next);
  return next;
}

function clamp(v, min, max) {
  v = Math.round(Number(v));
  return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : min;
}

function startServer() {
  const server = http.createServer(function (req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'content-type');
    res.setHeader('Cache-Control', 'no-store');
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }
    if (req.method === 'GET' && req.url.startsWith('/state')) {
      const saved = readState();
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify(saved ? currentState() : { empty: true }));
    }
    if (req.method === 'GET' && req.url.startsWith('/image')) {
      res.setHeader('Content-Type', 'text/plain');
      try {
        return res.end(fs.readFileSync(IMAGE_FILE, 'utf8'));
      } catch (e) {
        res.writeHead(404);
        return res.end();
      }
    }
    if (req.method === 'POST' && req.url.startsWith('/seed')) {
      let size = 0;
      const chunks = [];
      req.on('data', function (c) {
        size += c.length;
        if (size > MAX_BODY) req.destroy();
        else chunks.push(c);
      });
      req.on('end', function () {
        try {
          if (readState()) {
            res.writeHead(204);
            return res.end();
          }
          const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
          const image = ['pattern', 'galaxy', 'custom'].indexOf(body.image) >= 0 ? body.image : 'pattern';
          if (image === 'custom' && typeof body.customImage === 'string') {
            fs.mkdirSync(DIR, { recursive: true });
            fs.writeFileSync(IMAGE_FILE, body.customImage);
          }
          writeState(Object.assign({}, DEFAULTS, {
            opacity: clamp(body.opacity, 10, 100),
            tint: clamp(body.tint, 0, 85),
            blur: clamp(body.blur, 0, 30),
            grain: clamp(body.grain, 0, 100),
            image: image,
            imageName: String(body.imageName || DEFAULTS.imageName),
            imageRev: 1,
            rev: 1
          }));
          res.writeHead(204);
        } catch (e) {
          res.writeHead(400);
        }
        res.end();
      });
      return;
    }
    res.writeHead(404);
    res.end();
  });
  server.on('error', function () {});
  server.listen(PORT, '127.0.0.1');
  return server;
}

class PanelProvider {
  constructor(context) {
    this.context = context;
    this.view = null;
  }

  resolveWebviewView(view) {
    this.view = view;
    const media = vscode.Uri.joinPath(this.context.extensionUri, 'media');
    view.webview.options = { enableScripts: true, localResourceRoots: [media] };
    view.webview.html = this.html(view.webview, media);
    this.syncTitle();

    view.webview.onDidReceiveMessage((msg) => {
      switch (msg.type) {
        case 'ready':
          return this.push();
        case 'set': {
          const patch = {};
          const limits = { opacity: [10, 100], tint: [0, 85], blur: [0, 30], grain: [0, 100], shadow: [0, 100] };
          const p = msg.patch || {};
          for (const key of Object.keys(limits)) {
            if (key in p) patch[key] = clamp(p[key], limits[key][0], limits[key][1]);
          }
          if (p.fit === 'fit' || p.fit === 'original') patch.fit = p.fit;
          if (LANGS.indexOf(p.lang) >= 0) patch.lang = p.lang;
          if (p.areas && typeof p.areas === 'object') {
            const areas = Object.assign({}, currentState().areas);
            for (const a of AREAS) if (a in p.areas) areas[a] = !!p.areas[a];
            patch.areas = areas;
          }
          update(patch);
          if (patch.lang) this.syncTitle();
          return;
        }
        case 'upload': {
          if (typeof msg.data !== 'string' || !msg.data.startsWith('data:image/')) return;
          fs.mkdirSync(DIR, { recursive: true });
          fs.writeFileSync(IMAGE_FILE, msg.data);
          update({ image: 'custom', imageName: String(msg.name || 'Custom image'), imageRev: (currentState().imageRev || 0) + 1 });
          return this.push();
        }
      }
    });
  }

  syncTitle() {
    if (this.view) this.view.title = VIEW_TITLES[currentState().lang];
  }

  push() {
    if (this.view) this.view.webview.postMessage({ type: 'state', state: currentState() });
  }

  reset() {
    update({
      opacity: DEFAULTS.opacity,
      tint: DEFAULTS.tint,
      blur: DEFAULTS.blur,
      grain: DEFAULTS.grain,
      shadow: DEFAULTS.shadow,
      fit: DEFAULTS.fit,
      areas: Object.assign({}, DEFAULTS.areas),
      image: 'pattern',
      imageName: 'Pattern 5K'
    });
    this.push();
  }

  html(webview, media) {
    const uri = (f) => webview.asWebviewUri(vscode.Uri.joinPath(media, f));
    const nonce = crypto.randomBytes(16).toString('hex');
    const csp = [
      "default-src 'none'",
      `style-src ${webview.cspSource}`,
      `script-src 'nonce-${nonce}'`,
      'img-src data:'
    ].join('; ');
    const slider = (id, key, min, max) =>
      `<div class="row"><div class="row-head"><label for="s-${id}" data-i18n="${key}"></label><span class="value" id="v-${id}"></span></div><input type="range" class="range" id="s-${id}" min="${min}" max="${max}"></div>`;
    const area = (id, key) =>
      `<label class="check"><input type="checkbox" data-area="${id}"><span data-i18n="${key}"></span></label>`;
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="${csp}">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="${uri('panel.css')}">
</head>
<body>
  ${slider('opacity', 'opacity', 10, 100)}
  ${slider('tint', 'tint', 0, 85)}
  ${slider('blur', 'blur', 0, 30)}
  ${slider('grain', 'grain', 0, 100)}
  ${slider('shadow', 'shadow', 0, 100)}

  <div class="section" data-i18n="presets"></div>
  <div class="grid">
    <button class="btn preset" data-opacity="100" data-tint="45" data-blur="0" data-grain="20" data-i18n="presetDefault"></button>
    <button class="btn preset" data-opacity="100" data-tint="20" data-blur="0" data-grain="10" data-i18n="presetBright"></button>
    <button class="btn preset" data-opacity="95" data-tint="40" data-blur="4" data-grain="45" data-i18n="presetFilm"></button>
    <button class="btn preset" data-opacity="45" data-tint="30" data-blur="12" data-grain="15" data-i18n="presetFrosted"></button>
  </div>

  <div class="section split"><span data-i18n="wallpaper"></span><span class="muted" id="image-name"></span></div>
  <input type="file" id="file" accept="image/*" hidden>
  <button class="btn wide" id="upload" data-i18n="chooseImage"></button>

  <div class="section" data-i18n="display"></div>
  <div class="grid">
    <button class="btn" id="fit-fit" data-i18n="fitWindow" data-i18n-title="fitWindowHint"></button>
    <button class="btn" id="fit-original" data-i18n="fixedSize" data-i18n-title="fixedSizeHint"></button>
  </div>

  <div class="section" data-i18n="areas"></div>
  ${area('sidebar', 'areaSidebar')}
  ${area('editor', 'areaEditor')}
  ${area('panel', 'areaPanel')}
  ${area('aux', 'areaAux')}
  ${area('bars', 'areaBars')}

  <div class="section" data-i18n="language"></div>
  <div class="grid">
    <button class="btn" id="lang-en">English</button>
    <button class="btn" id="lang-vi">Tiếng Việt</button>
  </div>
  <script nonce="${nonce}" src="${uri('panel.js')}"></script>
</body>
</html>`;
  }
}

function activate(context) {
  const server = startServer();
  context.subscriptions.push({ dispose: () => server.close() });

  const provider = new PanelProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('bgEffects.panel', provider),
    vscode.commands.registerCommand('bgEffects.reset', () => provider.reset())
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
