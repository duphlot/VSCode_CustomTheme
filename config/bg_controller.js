// VS Code Background Opacity & Tint Controller
(function () {
  if (window.__vscode_bg_ctrl_initialized) return;
  window.__vscode_bg_ctrl_initialized = true;

  let config = { opacity: 100, tint: 45, blur: 0 };
  try {
    const saved = localStorage.getItem('vscode_bg_settings');
    if (saved) config = Object.assign({}, config, JSON.parse(saved));
  } catch (e) {}

  function applyConfig() {
    document.documentElement.style.setProperty('--bg-opacity', (config.opacity / 100).toString());
    document.documentElement.style.setProperty('--bg-overlay', (config.tint / 100).toString());
    document.documentElement.style.setProperty('--bg-blur', config.blur + 'px');
    try {
      localStorage.setItem('vscode_bg_settings', JSON.stringify(config));
    } catch (e) {}
  }
  applyConfig();

  function findTargetContainer() {
    const containers = document.querySelectorAll('.actions-container');
    for (let i = 0; i < containers.length; i++) {
      const c = containers[i];
      if (c.querySelector('[aria-label*="Explorer"], [aria-label*="Search"], [aria-label*="Tập tin"], [aria-label*="Rìm kiếm"], .codicon-files')) {
        return c;
      }
    }
    return document.querySelector('.part.sidebar .composite-bar .actions-container') ||
           document.querySelector('.part.sidebar .monaco-action-bar .actions-container') ||
           document.querySelector('.part.activitybar .actions-container');
  }

  let panel = null;

  function createPanel() {
    if (panel) return panel;
    panel = document.createElement('div');
    panel.id = 'bg-ctrl-panel';
    panel.style.cssText = [
      'display: none',
      'position: fixed',
      'z-index: 999999',
      'width: 280px',
      'background: rgba(16, 22, 28, 0.94)',
      'backdrop-filter: blur(28px) saturate(180%)',
      '-webkit-backdrop-filter: blur(28px) saturate(180%)',
      'border: 1px solid rgba(255, 255, 255, 0.16)',
      'border-radius: 12px',
      'box-shadow: 0 16px 40px rgba(0,0,0,0.65), 0 2px 8px rgba(0,0,0,0.4)',
      'padding: 14px 16px',
      'font-family: "JetBrains Mono", -apple-system, sans-serif',
      'font-size: 12px',
      'color: #ffffff',
      'user-select: none',
      'box-sizing: border-box'
    ].join('; ');

    panel.innerHTML = '' +
      '<div style="display:flex; justify-content;space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid rgba(255,255,255,0.08); padding-bottom:8px;">' +
      '  <span style="font-weight:600; color:#59c2ff; display:flex; align-items:center; gap:6px;">' +
      '    <span class="codicon codicon-color-mode"></span> ĐỘ TRONG SUỐT NỀN' +
      '  </span>' +
      '  <span id="bg-reset-btn" style="cursor:pointer; font-size:11px; opacity:0.75; color:#9ec5e8;" title="Đặt lại mặc định">↺ Đặt lại</span>' +
      '</div>' +
      '<div style="margin-bottom:12px;">' +
      '  <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:11px;">' +
      '    <span style="color:#e0e6ed;">Độ rõ nền:</span>' +
      '    <span id="bg-op-val" style="color:#59c2ff; font-weight:600;">' + config.opacity + '%</span>' +
      '  </div>' +
      '  <input type="range" id="bg-op-slider" min="10" max="100" value="' + config.opacity + '" style="width:100%; height:4px; accent-color:#59c2ff; cursor:pointer;" />' +
      '</div>' +
      '<div style="margin-bottom:12px;">' +
      '  <div style="display:flex; justify-content;space-between; margin-bottom:4px; font-size:11px;">' +
      '    <span style="color:#e0e6ed;">Độ tối phủ (Tương phắn):</span>' +
      '    <span id="bg-tint-val" style="color:#ffd479; font-weight:600;">' + config.tint + '%</span>' +
      '  </div>' +
      '  <input type="range" id="bg-tint-slider" min="0" max="85" value="' + config.tint + '" style="width:100%; height:4px; accent-color:#ffd479; cursor:pointer;" />' +
      '</div>' +
      '<div style="margin-bottom:14px;">' +
      '  <div style="display:flex; justify-content:space-between; margin-bottom:4px; font-size:11px;">' +
      '    <span style="color:#e0e6ed;">Độ mờ kính (Blur):</span>' +
      '    <span id="bg-blur-val" style="color:#c3e88d; font-weight:600;">' + config.blur + 'px</span>' +
      '  </div>' +
      '  <input type="range" id="bg-blur-slider" min="0" max="30" value="' + config.blur + '" style="width:100%; height:4px; accent-color:#c3e88d; cursor:pointer;" />' +
      '</div>' +
      '<div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px;">' +
      '  <button class="bg-preset" data-op="100" data-tint="45" data-blur="0" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#fff; border-radius:6px; padding:5px 8px; font-size:11px; cursor:pointer;">✄ Chuẩn</button>' +
      '  <button class="bg-preset" data-op="100" data-tint="20" data-blur="0" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#fff; border-radius:6px; padding:5px 8px; font-size:11px; cursor:pointer;">🌟Sáng nét</button>' +
      '  <button class="bg-preset" data-op="90" data-tint="70" data-blur="0" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#fff; border-radius:6px; padding:5px 8px; font-size:11px; cursor:pointer;">🌑Tối sâu</button>' +
      '  <button class="bg-preset" data-op="45" data-tint="30" data-blur="12" style="background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#fff; border-radius:6px; padding:5px 8px; font-size:11px; cursor:pointer;">😭 Kính mờ</button>' +
      '</div>';
    document.body.appendChild(panel);

    const opSlider = panel.querySelector('#bg-op-slider');
    const tintSlider = panel.querySelector('#bg-tint-slider');
    const blurSlider = panel.querySelector('#bg-blur-slider');
    const opVal = panel.querySelector('#bg-op-val');
    const tintVal = panel.querySelector('#bg-tint-val');
    const blurVal = panel.querySelector('#bg-blur-val');

    function syncUI() {
      opSlider.value = config.opacity;
      tintSlider.value = config.tint;
      blurSlider.value = config.blur;
      opVal.textContent = config.opacity + '%';
      tintVal.textContent = config.tint + '%';
      blurVal.textContent = config.blur + 'px';

      const miniSlider = document.querySelector('#bg-mini-slider');
      const miniLabel = document.querySelector('#bg-mini-label');
      if (miniSlider) miniSlider.value = config.opacity;
      if (miniLabel) miniLabel.textContent = config.opacity + '%';
      applyConfig();
    }

    opSlider.addEventListener('input', function (e) {
      config.opacity = parseInt(e.target.value);
      syncUI();
    });

    tintSlider.addEventListener('input', function (e) {
      config.tint = parseInt(e.target.value);
      syncUI();
    });

    blurSlider.addEventListener('input', function (e) {
      config.blur = parseInt(e.target.value);
      syncUI();
    });

    panel.querySelector('#bg-reset-btn').addEventListener('click', function () {
      config = { opacity: 100, tint: 45, blur: 0 };
      syncUI();
    });

    const presets = panel.querySelectorAll('.bg-preset');
    for (let i = 0; i < presets.length; i++) {
      presets[i].addEventListener('click', function () {
        config.opacity = parseInt(this.getAttribute('data-op'));
        config.tint = parseInt(this.getAttribute('data-tint'));
        config.blur = parseInt(this.getAttribute('data-blur'));
        syncUI();
      });
    }
    return panel;
  }

  function mountWidget() {
    if (document.getElementById('bg-ctrl-action-item')) return;
    const container = findTargetContainer();
    if (!container) return;

    createPanel();

    const li = document.createElement('li');
    li.className = 'action-item';
    li.id = 'bg-ctrl-action-item';
    li.setAttribute('role', 'presentation');
    li.style.cssText = 'display: inline-flex; align-items: center; margin-left: 6px; padding: 0 4px; height: 100%; vertical-align: middle;';

    li.innerHTML = '' +
      '<a class="action-label codicon codicon-color-mode" id="bg-ctrl-btn" role="button" title="Tuỳ chỉnh độ mờ / độ trong suốt nền (Click để mở chi tiết)" style="font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 4px; color: #59c2ff; transition: all 0.2s;">' +
      '</a>' +
      '<div style="display: inline-flex; align-items: center; gap: 4px; margin-left: 2px;">' +
      '  <input type="range" id="bg-mini-slider" min="10" max="100" value="' + config.opacity + '" title="Kéo nhanh độ mờ/rõ nền" style="width: 50px; height: 3px; accent-color: #59c2ff; cursor: pointer; opacity: 0.85;" />' +
      '  <span id="bg-mini-label" style="font-size: 10px; font-family: \'JetBrains Mono\', monospace; color: #59c2ff; font-weight: 500; min-width: 25px;">' + config.opacity + '%</span>' +
      '</div>';
    container.appendChild(li);

    const btn = li.querySelector('#bg-ctrl-btn');
    const miniSlider = li.querySelector('#bg-mini-slider');
    const miniLabel = li.querySelector('#bg-mini-label');

    miniSlider.addEventListener('input', function (e) {
      config.opacity = parseInt(e.target.value);
      miniLabel.textContent = config.opacity + '%';
      const opSlider = document.querySelector('#bg-op-slider');
      const opVal = document.querySelector('#bg-op-val');
      if (opSlider) opSlider.value = config.opacity;
      if (opVal) opVal.textContent = config.opacity + '%';
      applyConfig();
    });

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      const isVisible = panel.style.display === 'block';
      if (isVisible) {
        panel.style.display = 'none';
      } else {
        const rect = btn.getBoundingClientRect();
        panel.style.top = (rect.bottom + 6) + 'px';
        panel.style.left = Math.max(10, Math.min(window.innerWidth - 290, rect.left - 10)) + 'px';
        panel.style.display = 'block';
      }
    });

    document.addEventListener('click', function (e) {
      if (panel && panel.style.display === 'block' && !panel.contains(e.target) && !li.contains(e.target)) {
        panel.style.display = 'none';
      }
    });
  }

  setInterval(mountWidget, 600);
})();