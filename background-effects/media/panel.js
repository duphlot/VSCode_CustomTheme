(function () {
  const vscode = acquireVsCodeApi();
  const $ = (id) => document.getElementById(id);
  const sliders = [
    ['opacity', '%'],
    ['tint', '%'],
    ['blur', 'px'],
    ['grain', '%'],
    ['shadow', '%']
  ];
  const PRESET_KEYS = ['opacity', 'tint', 'blur', 'grain'];

  const I18N = {
    en: {
      opacity: 'Background opacity',
      tint: 'Dark overlay',
      blur: 'Blur',
      grain: 'Film grain',
      shadow: 'Text shadow',
      presets: 'Presets',
      presetDefault: 'Default',
      presetBright: 'Bright',
      presetFilm: 'Film grain',
      presetFrosted: 'Frosted glass',
      wallpaper: 'Wallpaper',
      chooseImage: 'Choose image from computer…',
      display: 'Image display',
      fitWindow: 'Fit window',
      fitWindowHint: 'The image scales with the window',
      fixedSize: 'Fixed size',
      fixedSizeHint: 'The image fits the full screen; shrinking the window crops it instead of scaling it',
      areas: 'Wallpaper areas',
      areaSidebar: 'Sidebar and icon bar',
      areaEditor: 'Editor',
      areaPanel: 'Bottom panel',
      areaAux: 'Secondary side bar',
      areaBars: 'Title and status bars',
      language: 'Language'
    },
    vi: {
      opacity: 'Độ rõ nền',
      tint: 'Độ tối phủ',
      blur: 'Làm mờ',
      grain: 'Hạt phim',
      shadow: 'Độ đổ bóng của chữ',
      presets: 'Cài đặt sẵn',
      presetDefault: 'Chuẩn',
      presetBright: 'Sáng nét',
      presetFilm: 'Phim hạt',
      presetFrosted: 'Kính mờ',
      wallpaper: 'Hình nền',
      chooseImage: 'Chọn ảnh từ máy tính…',
      display: 'Cách hiển thị ảnh',
      fitWindow: 'Vừa cửa sổ',
      fitWindowHint: 'Ảnh co giãn theo cửa sổ',
      fixedSize: 'Kích thước gốc',
      fixedSizeHint: 'Ảnh vừa khít khi cửa sổ full màn hình; thu nhỏ cửa sổ thì ảnh giữ nguyên và bị cắt bớt',
      areas: 'Vùng nhận hình nền',
      areaSidebar: 'Thanh bên và thanh icon',
      areaEditor: 'Trình soạn thảo',
      areaPanel: 'Panel phía dưới',
      areaAux: 'Khung phụ bên phải',
      areaBars: 'Thanh tiêu đề và trạng thái',
      language: 'Ngôn ngữ'
    }
  };

  let state = {
    opacity: 100, tint: 45, blur: 0, grain: 20, shadow: 80,
    fit: 'fit', areas: {}, lang: 'en', image: 'pattern', imageName: 'Pattern 5K'
  };

  function paint(el) {
    const min = parseFloat(el.min);
    const max = parseFloat(el.max);
    el.style.setProperty('--fill', ((el.value - min) / (max - min)) * 100 + '%');
  }

  function translate() {
    const dict = I18N[state.lang] || I18N.en;
    document.documentElement.lang = state.lang;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = dict[el.dataset.i18n];
    });
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      el.title = dict[el.dataset.i18nTitle];
    });
  }

  function render() {
    translate();
    sliders.forEach(function (s) {
      const el = $('s-' + s[0]);
      el.value = state[s[0]];
      paint(el);
      $('v-' + s[0]).textContent = state[s[0]] + s[1];
    });
    document.querySelectorAll('.preset').forEach(function (b) {
      b.classList.toggle('active', PRESET_KEYS.every(function (k) {
        return state[k] === parseInt(b.dataset[k], 10);
      }));
    });
    $('image-name').textContent = state.imageName;
    $('image-name').title = state.imageName;
    $('fit-fit').classList.toggle('active', state.fit !== 'original');
    $('fit-original').classList.toggle('active', state.fit === 'original');
    $('lang-en').classList.toggle('active', state.lang === 'en');
    $('lang-vi').classList.toggle('active', state.lang === 'vi');
    document.querySelectorAll('[data-area]').forEach(function (c) {
      c.checked = state.areas[c.dataset.area] !== false;
    });
  }

  function send(patch) {
    vscode.postMessage({ type: 'set', patch: patch });
  }

  sliders.forEach(function (s) {
    $('s-' + s[0]).addEventListener('input', function (e) {
      state[s[0]] = parseInt(e.target.value, 10);
      render();
      const patch = {};
      patch[s[0]] = state[s[0]];
      send(patch);
    });
  });

  document.querySelectorAll('.preset').forEach(function (b) {
    b.addEventListener('click', function () {
      const patch = {};
      PRESET_KEYS.forEach(function (k) {
        patch[k] = parseInt(b.dataset[k], 10);
        state[k] = patch[k];
      });
      render();
      send(patch);
    });
  });

  ['fit', 'original'].forEach(function (mode) {
    $('fit-' + mode).addEventListener('click', function () {
      state.fit = mode;
      render();
      send({ fit: mode });
    });
  });

  ['en', 'vi'].forEach(function (lang) {
    $('lang-' + lang).addEventListener('click', function () {
      state.lang = lang;
      render();
      send({ lang: lang });
    });
  });

  document.querySelectorAll('[data-area]').forEach(function (c) {
    c.addEventListener('change', function () {
      state.areas[c.dataset.area] = c.checked;
      const areas = {};
      areas[c.dataset.area] = c.checked;
      send({ areas: areas });
    });
  });

  $('upload').addEventListener('click', function () { $('file').click(); });

  $('file').addEventListener('change', function (e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (evt) {
      const img = new Image();
      img.onload = function () {
        const maxW = 3024;
        const maxH = 1964;
        let w = img.width;
        let h = img.height;
        if (w > maxW || h > maxH) {
          const ratio = Math.min(maxW / w, maxH / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        vscode.postMessage({ type: 'upload', name: file.name, data: canvas.toDataURL('image/jpeg', 0.88) });
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  });

  window.addEventListener('message', function (e) {
    if (e.data && e.data.type === 'state') {
      state = e.data.state;
      render();
    }
  });

  render();
  vscode.postMessage({ type: 'ready' });
})();
