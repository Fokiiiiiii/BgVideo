/**
 * @name BgVideo
 * @author Foki (Refactored)
 * @description Loop an MP4/WebM/Image/YouTube as a background media
 * @version 2.0.0
 * @source https://github.com/Fokiiiiiii/BgVideo
 * @updateUrl https://raw.githubusercontent.com/Fokiiiiiii/BgVideo/main/BgVideo.plugin.js
 */

const STRINGS = {
  en: {
    sourceMode: "Source Mode",
    remoteUrl: "Remote URL",
    localFile: "Local File",
    youtube: "YouTube",
    mediaUrl: "Media URL / YouTube URL",
    objectFit: "Object Fit",
    objectPosition: "Object Position",
    opacity: "Opacity",
    blur: "Blur",
    brightness: "Brightness",
    saturate: "Saturation",
    autoplay: "Autoplay",
    loop: "Loop",
    muted: "Muted",
    maxBlobMB: "Max local file size (MB)",
    clearLocalFile: "Clear Local File",
    apply: "Apply",
    test: "Test",
    reset: "Reset",
    debug: "Debug",
    cover: "Cover",
    contain: "Contain",
    fill: "Fill",
    center: "Center",
    top: "Top",
    bottom: "Bottom",
    localRestartWarning: "Local file playback works, but this environment does not expose a file path for automatic reload after restart.",
    webpFailed: "WebP failed to load.",
    invalidUrl: "Invalid URL",
    fileTooLarge: "File is too large",
    unsupportedMedia: "Unsupported Media",
    liveChanges: "Live: changes apply immediately",
    title: "BgVideo",
    subtitle: "Background media loop",
    openPersistentPicker: "Select Persistent File"
  },
  ja: {
    sourceMode: "ソース種別",
    remoteUrl: "リモートURL",
    localFile: "ローカルファイル",
    youtube: "YouTube",
    mediaUrl: "メディアURL / YouTube URL",
    objectFit: "表示方法",
    objectPosition: "表示位置",
    opacity: "不透明度",
    blur: "ぼかし",
    brightness: "明るさ",
    saturate: "彩度",
    autoplay: "自動再生",
    loop: "ループ",
    muted: "ミュート",
    maxBlobMB: "ローカルファイル最大サイズ (MB)",
    clearLocalFile: "ローカルファイルを解除",
    apply: "適用",
    test: "テスト",
    reset: "リセット",
    debug: "デバッグ",
    cover: "カバー",
    contain: "コンテイン",
    fill: "フィル",
    center: "中央",
    top: "上部",
    bottom: "下部",
    localRestartWarning: "ローカルファイルの再生は可能ですが、この環境では再起動後の自動再読み込みに必要なファイルパスを取得できません。",
    webpFailed: "WebPの読み込みに失敗しました。",
    invalidUrl: "無効なURLです。",
    fileTooLarge: "ファイルサイズが上限を超えています",
    unsupportedMedia: "未対応のメディア形式です",
    liveChanges: "Live: 変更は直ちに適用されます",
    title: "BgVideo",
    subtitle: "背景メディアをループ",
    openPersistentPicker: "再起動可能なファイルを選択"
  }
};

module.exports = class BgVideo {
  constructor() {
    this.PLUGIN_NAME = "BgVideo";
    this.PANEL_STYLE_ID = `${this.PLUGIN_NAME}-panel`;

    this.defaults = {
      sourceMode: "url", // url, localFile, youtube
      mediaUrl: "https://raw.githubusercontent.com/Fokiiiiiii/disocrd-Thema/main/Grievous_Lady_2.5_.mp4",
      localFileMeta: null,
      localFilePath: null,
      objectFit: "cover",
      objectPosition: "center",
      opacity: 0.3,
      blur: 1.2,
      saturate: 1.08,
      brightness: 0.88,
      maxBlobMB: 80,
      youtubeAutoplay: true,
      youtubeMuted: true,
      youtubeLoop: true,
      debug: false,
    };

    this.settings = this.loadSettings();

    // State
    this._mediaNode = null;
    this._localFileBlobUrl = null; // Session object URL
    this._cssText = "";
    this._panelCssMounted = false;
    this._isWebPSupportedCache = null;
    this._toastCooldowns = new Set();

    this._onVisibilityOrFocus = this._onVisibilityOrFocus.bind(this);
  }

  // --- I18N ---
  getLang() {
    try {
      const docLang = document.documentElement?.lang || "";
      const navLang = navigator.language || navigator.userLanguage || "";
      const discordLang = window.DiscordNative?.app?.getLocale?.() || "";
      const langStr = (discordLang || docLang || navLang).toLowerCase();
      if (langStr.startsWith("ja")) return "ja";
    } catch (e) {}
    return "en";
  }

  t(key) {
    const lang = this.getLang();
    const dict = STRINGS[lang] || STRINGS.en;
    return dict[key] || STRINGS.en[key] || key;
  }

  // --- SETTINGS ---
  loadSettings() {
    const saved = BdApi.Data.load(this.PLUGIN_NAME, "settings");
    const migrated = this.migrateSettings(saved || {});
    return { ...this.defaults, ...migrated };
  }

  migrateSettings(saved) {
    let changed = false;
    if (saved.url && !saved.mediaUrl) {
      saved.mediaUrl = saved.url;
      delete saved.url;
      changed = true;
    }
    if (changed) {
      BdApi.Data.save(this.PLUGIN_NAME, "settings", saved);
    }
    return saved;
  }

  saveSettings(next) {
    if (!next || typeof next !== "object") return false;
    let changed = false;
    for (const k of Object.keys(next)) {
      if (this.settings[k] !== next[k]) {
        changed = true;
        break;
      }
    }
    if (!changed) return false;
    this.settings = { ...this.settings, ...next };
    BdApi.Data.save(this.PLUGIN_NAME, "settings", this.settings);
    return true;
  }

  // --- LOGGING ---
  log(...args) {
    if (!this.settings.debug) return;
    console.log(`[${this.PLUGIN_NAME}]`, ...args);
  }

  toast(msg, type = "info") {
    if (this._toastCooldowns.has(msg)) return;
    this._toastCooldowns.add(msg);
    setTimeout(() => this._toastCooldowns.delete(msg), 3000);
    BdApi.UI.showToast(`${this.PLUGIN_NAME}: ${msg}`, { type });
  }

  logFileDiagnostics(file) {
    this.log("Diagnostics: File selected.");
    if (file) {
      this.log(`- Name: ${file.name}, Size: ${file.size}, Type: ${file.type}`);
      this.log(`- file.path exists: ${!!file.path}`);
      if (file.path) {
        this.log(`- file.path typeof: ${typeof file.path}, val starts with: ${file.path.substring(0, 10)}...`);
      }
    } else {
      this.log(`- File object is null/undefined.`);
    }
    this.log(`- BdApi.openDialog exists: ${!!(window.BdApi && BdApi.openDialog)}`);
    this.log(`- DiscordNative safe dialog exists: ${!!(window.DiscordNative && window.DiscordNative.fileManager && window.DiscordNative.fileManager.showOpenDialog)}`);
    this.log(`- Stored settings.localFilePath exists: ${!!this.settings.localFilePath}`);
  }

  // --- PATH TO FILE URL ---
  pathToFileUrl(pathStr) {
    if (!pathStr || typeof pathStr !== "string") return null;
    let p = pathStr.replace(/\\/g, '/');
    if (!p.startsWith('/')) {
       p = '/' + p; // handle Windows "C:/" becoming "/C:/" for file URL standards
    }
    try {
      // Safely encode parts so things like Japanese characters or spaces don't break the URL
      const encoded = p.split('/').map(part => encodeURIComponent(part)).join('/');
      // Revert the colon encoding for Windows drive letters (e.g. /C%3A/ -> /C:/)
      const finalUrl = `file://${encoded.replace(/%3A/g, ':')}`;
      this.log(`Diagnostics: Generated file URL: ${finalUrl}`);
      return finalUrl;
    } catch (e) {
      this.log(`Diagnostics: pathToFileUrl failed`, e);
      return null;
    }
  }

  async openPersistentPicker() {
    this.log("Attempting persistent picker API...");
    const filters = [{ name: "Media Files", extensions: ["mp4", "webm", "png", "jpg", "jpeg", "gif", "webp", "avif"] }];
    try {
      if (window.BdApi && typeof BdApi.openDialog === "function") {
        this.log("Using BdApi.openDialog");
        const res = await BdApi.openDialog({ filters, properties: ["openFile"] });
        if (Array.isArray(res) && res.length > 0) return res[0];
        if (typeof res === "string") return res;
      } else if (window.DiscordNative && window.DiscordNative.fileManager && typeof window.DiscordNative.fileManager.showOpenDialog === "function") {
        this.log("Using DiscordNative.fileManager.showOpenDialog");
        const res = await window.DiscordNative.fileManager.showOpenDialog({ filters, properties: ["openFile"] });
        if (Array.isArray(res) && res.length > 0) return res[0];
      }
    } catch (e) {
      this.log("Persistent picker failed:", e);
    }
    return null;
  }

  // --- DETECTION ---
  isYouTubeUrl(input) {
    return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(input);
  }

  parseYouTubeVideoId(input) {
    const match = input.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
  }

  parseYouTubePlaylistId(input) {
    const match = input.match(/[?&]list=([^&]+)/);
    return match ? match[1] : null;
  }

  guessMediaType(url) {
    if (this.isYouTubeUrl(url)) return "youtube";
    const extMatch = String(url || "").match(/\.([a-z0-9]+)(?:[\?#]|$)/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : "";
    if (["mp4", "webm", "ogv"].includes(ext)) return "video";
    if (["png", "jpg", "jpeg", "gif", "avif", "bmp", "webp"].includes(ext)) return "image";
    return "video"; // Default fallback
  }

  checkWebPSupport() {
    return new Promise((resolve) => {
      if (this._isWebPSupportedCache !== null) return resolve(this._isWebPSupportedCache);
      const img = new Image();
      img.onload = () => { this._isWebPSupportedCache = img.width > 0 && img.height > 0; resolve(this._isWebPSupportedCache); };
      img.onerror = () => { this._isWebPSupportedCache = false; resolve(false); };
      img.src = "data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==";
    });
  }

  // --- RENDERERS ---
  destroyRenderer() {
    if (this._mediaNode) {
      if (this._mediaNode.tagName === "VIDEO") {
        try { this._mediaNode.pause(); } catch {}
        this._mediaNode.removeAttribute("src");
        this._mediaNode.load();
      }
      this._mediaNode.remove();
      this._mediaNode = null;
    }
    // Object URL is intentionally kept alive for the session.
  }

  createMediaContainer() {
    let mount = document.getElementById("app-mount") || document.body;
    let wrapper = document.getElementById("bgVideo-wrapper");
    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.id = "bgVideo-wrapper";
      mount.prepend(wrapper);
    }
    return wrapper;
  }

  async updateMediaSource() {
    this.destroyRenderer();
    const wrapper = this.createMediaContainer();
    
    let sourceUrl = "";
    let isLocalFile = false;

    if (this.settings.sourceMode === "url" || this.settings.sourceMode === "youtube") {
      sourceUrl = this.settings.mediaUrl?.trim();
    } else if (this.settings.sourceMode === "localFile") {
      isLocalFile = true;
      if (this._localFileBlobUrl) {
        // Immediate playback via object URL
        sourceUrl = this._localFileBlobUrl;
        this.log(`Diagnostics: Using immediate blob URL ${sourceUrl}`);
      } else if (this.settings.localFilePath) {
        // Restart persistent loading
        sourceUrl = this.pathToFileUrl(this.settings.localFilePath);
        this.log(`Diagnostics: Restore attempt using local file path URL: ${sourceUrl}`);
        if (!sourceUrl) {
          this.log(`Diagnostics: Restore failed - path format invalid.`);
          this.toast(this.t("localRestartWarning"), "error");
          return;
        }
      } else {
        this.log(`Diagnostics: Restore failed - no path or blob url found.`);
        this.toast(this.t("localRestartWarning"), "error");
        return;
      }
    }

    if (!sourceUrl) return;

    this.log(`Attempting to load: ${sourceUrl.substring(0, 50)}...`);

    let mediaType = this.guessMediaType(isLocalFile ? this.settings.localFileMeta : sourceUrl);
    
    if (this.settings.sourceMode === "youtube") mediaType = "youtube";

    this.log(`Diagnostics: Detected Media Type: ${mediaType}`);

    if (mediaType === "youtube") {
      const videoId = this.parseYouTubeVideoId(sourceUrl);
      if (!videoId) {
        this.toast(this.t("invalidUrl"), "error");
        return;
      }
      this.log("Diagnostics: Renderer chosen: YouTube");
      this._mediaNode = this.createYouTubeRenderer(videoId, sourceUrl);
    } else if (mediaType === "video") {
      this.log("Diagnostics: Renderer chosen: Video");
      this._mediaNode = this.createVideoRenderer(sourceUrl);
    } else if (mediaType === "image") {
      if (sourceUrl.toLowerCase().endsWith(".webp") || (this.settings.localFileMeta && this.settings.localFileMeta.toLowerCase().includes(".webp"))) {
        const supported = await this.checkWebPSupport();
        if (!supported) {
          this.toast(this.t("webpFailed"), "error");
          this.log("Diagnostics: WebP load failed.");
          return;
        }
      }
      this.log("Diagnostics: Renderer chosen: Image");
      this._mediaNode = this.createImageRenderer(sourceUrl);
    } else {
      this.toast(this.t("unsupportedMedia"), "error");
      this.log("Diagnostics: Unsupported media.");
      return;
    }

    wrapper.appendChild(this._mediaNode);
    this.applyVisualSettings();
    this._reassertNoControls();
    
    this.log("Diagnostics: Renderer appended successfully.");
  }

  createVideoRenderer(src) {
    const v = document.createElement("video");
    v.id = "bgVideo-media";
    v.autoplay = this.settings.youtubeAutoplay;
    v.loop = this.settings.youtubeLoop;
    v.muted = this.settings.youtubeMuted;
    v.playsInline = true;
    
    v.controls = false;
    v.removeAttribute("controls");
    v.disablePictureInPicture = true;
    v.setAttribute("controlsList", "nodownload nofullscreen noremoteplayback");
    
    v.crossOrigin = "anonymous";
    v.tabIndex = -1;
    v.setAttribute("aria-hidden", "true");
    v.src = src;

    v.addEventListener("error", (e) => {
      this.toast(`Video load error (code ${v.error?.code}).`, "error");
      this.log("Diagnostics: Video load error:", e, v.error);
    });

    return v;
  }

  createImageRenderer(src) {
    const img = document.createElement("img");
    img.id = "bgVideo-media";
    img.src = src;
    img.crossOrigin = "anonymous";
    img.tabIndex = -1;
    img.setAttribute("aria-hidden", "true");
    
    img.addEventListener("error", (e) => {
      this.toast(`Image load error.`, "error");
      this.log("Diagnostics: Image load error:", e);
    });
    return img;
  }

  createYouTubeRenderer(videoId, originalUrl) {
    const iframe = document.createElement("iframe");
    iframe.id = "bgVideo-media";
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allow", "autoplay; encrypted-media");
    iframe.tabIndex = -1;
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.pointerEvents = "none";
    
    const playlistId = this.parseYouTubePlaylistId(originalUrl);
    
    const params = new URLSearchParams();
    if (this.settings.youtubeAutoplay) params.append("autoplay", "1");
    if (this.settings.youtubeMuted) params.append("mute", "1");
    if (this.settings.youtubeLoop) {
      params.append("loop", "1");
      params.append("playlist", playlistId || videoId);
    }
    params.append("controls", "0");
    params.append("playsinline", "1");
    params.append("rel", "0");
    params.append("modestbranding", "1");
    
    iframe.src = `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
    return iframe;
  }

  // --- STYLING & FOCUS ---
  buildCss() {
    const s = this.settings;
    return `
      #bgVideo-wrapper {
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none !important;
        user-select: none !important;
        -webkit-user-drag: none !important;
        z-index: 0;
        opacity: ${s.opacity};
        filter: blur(${s.blur}px) saturate(${s.saturate}) brightness(${s.brightness});
        transform: translate3d(0,0,0);
        will-change: transform, opacity, filter;
        overflow: hidden;
      }
      #bgVideo-media {
        width: 100%;
        height: 100%;
        object-fit: ${s.objectFit};
        object-position: ${s.objectPosition};
        pointer-events: none !important;
      }
      iframe#bgVideo-media {
        ${s.objectFit === 'cover' ? 'width: 150vw; height: 150vh; left: -25vw; top: -25vh; position: absolute;' : ''}
      }
      video#bgVideo-media::-webkit-media-controls,
      video#bgVideo-media::-webkit-media-controls-enclosure,
      video#bgVideo-media::-webkit-media-controls-panel,
      video#bgVideo-media::-webkit-media-controls-play-button,
      video#bgVideo-media::-webkit-media-controls-start-playback-button {
        display: none !important;
        opacity: 0 !important;
        pointer-events: none !important;
        -webkit-appearance: none !important;
      }
      #app-mount { position: relative; z-index: 1; background: transparent; }
    `;
  }

  applyVisualSettings() {
    BdApi.DOM.removeStyle(this.PLUGIN_NAME);
    BdApi.DOM.addStyle(this.PLUGIN_NAME, this.buildCss());
    if (this._mediaNode) {
      this._mediaNode.style.objectFit = this.settings.objectFit;
      this._mediaNode.style.objectPosition = this.settings.objectPosition;
    }
  }

  _onVisibilityOrFocus() {
    this._reassertNoControls();
  }

  _reassertNoControls() {
    const node = this._mediaNode;
    if (!node) return;
    if (node.tagName === "VIDEO") {
      node.controls = false;
      node.removeAttribute("controls");
    }
    if (node.tagName === "IFRAME") {
      node.style.pointerEvents = "none";
    }
    const wrapper = document.getElementById("bgVideo-wrapper");
    if (wrapper) wrapper.style.pointerEvents = "none";
  }

  // --- LIFECYCLE ---
  start() {
    this.updateMediaSource();
    document.addEventListener("visibilitychange", this._onVisibilityOrFocus);
    window.addEventListener("focus", this._onVisibilityOrFocus);
  }

  stop() {
    document.removeEventListener("visibilitychange", this._onVisibilityOrFocus);
    window.removeEventListener("focus", this._onVisibilityOrFocus);
    this.destroyRenderer();
    const wrapper = document.getElementById("bgVideo-wrapper");
    if (wrapper) wrapper.remove();
    BdApi.DOM.removeStyle(this.PLUGIN_NAME);
    BdApi.DOM.removeStyle(this.PANEL_STYLE_ID);
    if (this._localFileBlobUrl) {
      this.log("Diagnostics: Revoking blob URL on plugin stop.");
      URL.revokeObjectURL(this._localFileBlobUrl);
      this._localFileBlobUrl = null;
    }
  }

  // --- SETTINGS UI ---
  getSettingsPanel() {
    if (!this._panelCssMounted) {
      BdApi.DOM.addStyle(
        this.PANEL_STYLE_ID,
        `
      .bgv-wrap{padding:14px;color:var(--text-normal)}
      .bgv-card{
      background:rgba(255,255,255,0.06);
      border:1px solid rgba(255,255,255,0.10);
      border-radius:14px;
      padding:14px;
      box-shadow:0 10px 30px rgba(0,0,0,0.25);
      backdrop-filter:blur(10px);
      max-height:80vh;
      overflow-y:auto
      }
      .bgv-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
      .bgv-title{font-size:16px;font-weight:800;letter-spacing:0.2px}
      .bgv-sub{font-size:12px;opacity:0.7;margin-top:2px}
      .bgv-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      .bgv-row{
      padding:10px;
      border-radius:12px;
      background:rgba(0,0,0,0.18);
      border:1px solid rgba(255,255,255,0.08);
      overflow:hidden;
      display:flex; flex-direction:column; gap:8px;
      }
      .bgv-label{
      font-size:12px;
      font-weight:700;
      opacity:0.9;
      }
      .bgv-input, .bgv-select{
      width:100%;
      box-sizing:border-box;
      padding:10px 10px;
      border-radius:10px;
      border:1px solid rgba(255,255,255,0.14);
      background:rgba(0,0,0,0.25);
      color:var(--text-normal);
      outline:none
      }
      .bgv-toggle{display:flex;gap:10px;align-items:center;}
      .bgv-toggle span{font-size:12px; opacity:0.9;}
      .bgv-toggle input{transform:scale(1.05); cursor:pointer;}
      .bgv-sliderline{display:flex;align-items:center;gap:10px;min-width:0}
      .bgv-range{
      flex:1;
      min-width:0;
      accent-color:#5865f2
      }
      .bgv-num{
      width:70px;
      text-align:right;
      font-family:monospace;
      padding:8px 10px;
      border-radius:10px;
      border:1px solid rgba(255,255,255,0.14);
      background:rgba(0,0,0,0.25);
      color:var(--text-normal);
      outline:none
      }
      .bgv-btns{
      position:sticky;
      bottom:0;
      z-index:5;
      display:flex;
      gap:10px;
      flex-wrap:wrap;
      width:fit-content;
      margin-top:12px;
      padding:10px 12px;
      background:rgba(0,0,0,0.35);
      backdrop-filter:blur(8px);
      border:1px solid rgba(255,255,255,0.12);
      border-radius:12px;
      box-shadow:0 10px 20px rgba(0,0,0,0.35)
      }
      .bgv-btn{
      padding:10px 14px;
      border-radius:10px;
      border:1px solid rgba(255,255,255,0.16);
      background:rgba(255,255,255,0.07);
      color:var(--text-normal);
      cursor:pointer;
      font-weight:700
      }
      .bgv-btn:hover{background:rgba(255,255,255,0.10)}
      .bgv-btn.primary{
      background:rgba(88,101,242,0.25);
      border-color:rgba(88,101,242,0.45)
      }
      .bgv-btn.danger{
      background:rgba(245,66,66,0.2);
      border-color:rgba(245,66,66,0.6)
      }
      .bgv-footnote{margin-top:10px;font-size:11px;opacity:0.65}
      @media (max-width:900px){.bgv-grid{grid-template-columns:1fr}}
        `
      );
      this._panelCssMounted = true;
    }

    const wrap = document.createElement("div");
    wrap.className = "bgv-wrap";
    const card = document.createElement("div");
    card.className = "bgv-card";
    wrap.appendChild(card);
    const head = document.createElement("div");
    head.className = "bgv-head";
    card.appendChild(head);
    const headLeft = document.createElement("div");
    head.appendChild(headLeft);

    const title = document.createElement("div");
    title.className = "bgv-title";
    title.textContent = this.t("title");
    headLeft.appendChild(title);
    const sub = document.createElement("div");
    sub.className = "bgv-sub";
    sub.textContent = this.t("subtitle");
    headLeft.appendChild(sub);

    const right = document.createElement("div");
    right.className = "bgv-controls";
    head.appendChild(right);

    const mkToggle = (labelText, initial, onChange) => {
      const box = document.createElement("label");
      box.className = "bgv-toggle";
      const cb = document.createElement("input");
      cb.type = "checkbox"; cb.checked = !!initial;
      cb.addEventListener("change", (e) => onChange(e.target.checked));
      const t = document.createElement("span");
      t.textContent = labelText;
      box.appendChild(cb); box.appendChild(t);
      return box;
    };
    right.appendChild(mkToggle(this.t("debug"), this.settings.debug, (v) => { this.saveSettings({ debug: v }); }));

    const grid = document.createElement("div");
    grid.className = "bgv-grid";
    card.appendChild(grid);

    const mkRow = (labelText) => {
      const row = document.createElement("div");
      row.className = "bgv-row";
      const lbl = document.createElement("div");
      lbl.className = "bgv-label";
      lbl.textContent = labelText;
      row.appendChild(lbl);
      return row;
    };

    // SOURCE ROW
    const sourceRow = mkRow(this.t("sourceMode"));
    const sourceSel = document.createElement("select");
    sourceSel.className = "bgv-select";
    [{label: this.t("remoteUrl"), value: "url"}, {label: this.t("localFile"), value: "localFile"}, {label: this.t("youtube"), value: "youtube"}].forEach(o => {
      const opt = document.createElement("option"); opt.value = o.value; opt.textContent = o.label;
      if (o.value === this.settings.sourceMode) opt.selected = true;
      sourceSel.appendChild(opt);
    });
    sourceSel.addEventListener("change", (e) => {
      this.saveSettings({ sourceMode: e.target.value });
      updateRender();
    });
    sourceRow.appendChild(sourceSel);
    grid.appendChild(sourceRow);

    // MEDIA ROW
    let dynamicMediaRow = document.createElement("div");
    grid.appendChild(dynamicMediaRow);

    const renderDynamicMediaRow = () => {
      dynamicMediaRow.innerHTML = "";
      dynamicMediaRow.className = "bgv-row";
      
      if (this.settings.sourceMode === "url" || this.settings.sourceMode === "youtube") {
        const lbl = document.createElement("div");
        lbl.className = "bgv-label";
        lbl.textContent = this.t("mediaUrl");
        dynamicMediaRow.appendChild(lbl);

        const inp = document.createElement("input");
        inp.className = "bgv-input";
        inp.type = "text";
        inp.value = this.settings.mediaUrl || "";
        inp.addEventListener("change", (e) => this.saveSettings({ mediaUrl: e.target.value }));
        dynamicMediaRow.appendChild(inp);
      } else {
        const lbl = document.createElement("div");
        lbl.className = "bgv-label";
        lbl.textContent = this.t("localFile");
        dynamicMediaRow.appendChild(lbl);

        // Immediate session playback input
        const fileInp = document.createElement("input");
        fileInp.type = "file";
        fileInp.accept = "video/mp4,video/webm,image/png,image/jpeg,image/gif,image/webp,image/avif";
        fileInp.className = "bgv-input";
        fileInp.style.padding = "6px";
        fileInp.addEventListener("change", (e) => {
          const file = e.target.files[0];
          this.logFileDiagnostics(file);
          if (!file) return;
          if (file.size > this.settings.maxBlobMB * 1024 * 1024) {
            BdApi.UI.showToast(this.t("fileTooLarge"), { type: "error" });
            return;
          }
          if (this._localFileBlobUrl) {
            this.log("Diagnostics: Revoking old blob URL before creating a new one.");
            URL.revokeObjectURL(this._localFileBlobUrl);
          }
          this._localFileBlobUrl = URL.createObjectURL(file);
          
          let localPath = file.path || null;
          this.saveSettings({ localFilePath: localPath, localFileMeta: file.name });
          
          this.updateMediaSource();
          renderDynamicMediaRow();
        });
        dynamicMediaRow.appendChild(fileInp);
        
        // Persistent Picker API (BdApi / Electron Native)
        const canUsePersistentAPI = !!((window.BdApi && BdApi.openDialog) || (window.DiscordNative && window.DiscordNative.fileManager && window.DiscordNative.fileManager.showOpenDialog));
        if (canUsePersistentAPI) {
          const btnPicker = document.createElement("button");
          btnPicker.className = "bgv-btn";
          btnPicker.style.marginTop = "8px";
          btnPicker.textContent = this.t("openPersistentPicker");
          btnPicker.onclick = async () => {
            const path = await this.openPersistentPicker();
            if (path) {
              const fileName = path.split('\\').pop().split('/').pop();
              this.logFileDiagnostics(null); // Just to log api state
              this.log(`Diagnostics: Picked persistent path: ${path}`);
              this.saveSettings({ localFilePath: path, localFileMeta: fileName });
              // We don't have a blob here, so clear it so updateMediaSource builds the file:// url
              if (this._localFileBlobUrl) {
                 URL.revokeObjectURL(this._localFileBlobUrl);
                 this._localFileBlobUrl = null;
              }
              this.updateMediaSource();
              renderDynamicMediaRow();
            }
          };
          dynamicMediaRow.appendChild(btnPicker);
        }

        if (this.settings.localFileMeta) {
           const sub = document.createElement("div");
           sub.style.fontSize = "11px";
           sub.style.opacity = "0.7";
           sub.style.marginTop = "4px";
           sub.textContent = `Selected: ${this.settings.localFileMeta}`;
           dynamicMediaRow.appendChild(sub);
        }
        
        const canPersist = canUsePersistentAPI || (this.settings.localFilePath !== null && this.settings.localFilePath !== undefined);
        if (!canPersist) {
           const warn = document.createElement("div");
           warn.style.fontSize = "11px";
           warn.style.color = "rgba(255, 100, 100, 0.9)";
           warn.style.marginTop = "6px";
           warn.textContent = this.t("localRestartWarning");
           dynamicMediaRow.appendChild(warn);
        }
      }
    };
    renderDynamicMediaRow();

    const updateRender = () => { renderDynamicMediaRow(); };

    // SLIDERS
    const mkSliderRow = (label, key, min, max, step) => {
      const row = mkRow(label);
      const line = document.createElement("div");
      line.className = "bgv-sliderline";
      const range = document.createElement("input");
      range.className = "bgv-range";
      range.type = "range"; range.min = min; range.max = max; range.step = step;
      range.value = this.settings[key];
      const num = document.createElement("input");
      num.className = "bgv-num";
      num.type = "number"; num.min = min; num.max = max; num.step = step;
      num.value = this.settings[key];

      const sync = (vStr) => {
        let v = parseFloat(vStr);
        if(isNaN(v)) return;
        v = Math.max(min, Math.min(max, v));
        range.value = v; num.value = v;
        this.saveSettings({ [key]: v });
        if (key !== "maxBlobMB") this.applyVisualSettings();
      };
      
      range.addEventListener("input", e => sync(e.target.value));
      num.addEventListener("change", e => sync(e.target.value));
      
      line.appendChild(range); line.appendChild(num);
      row.appendChild(line);
      return row;
    };

    grid.appendChild(mkSliderRow(this.t("opacity"), "opacity", 0, 1, 0.01));
    grid.appendChild(mkSliderRow(this.t("blur"), "blur", 0, 20, 0.1));
    grid.appendChild(mkSliderRow(this.t("brightness"), "brightness", 0, 2, 0.01));
    grid.appendChild(mkSliderRow(this.t("saturate"), "saturate", 0, 3, 0.01));

    // FIT / POS
    const fitRow = mkRow(this.t("objectFit"));
    const fitSel = document.createElement("select");
    fitSel.className = "bgv-select";
    [{label: this.t("cover"), value: "cover"}, {label: this.t("contain"), value: "contain"}, {label: this.t("fill"), value: "fill"}].forEach(o => {
      const opt = document.createElement("option"); opt.value = o.value; opt.textContent = o.label;
      if (o.value === this.settings.objectFit) opt.selected = true;
      fitSel.appendChild(opt);
    });
    fitSel.addEventListener("change", e => { this.saveSettings({ objectFit: e.target.value }); this.applyVisualSettings(); });
    fitRow.appendChild(fitSel);
    grid.appendChild(fitRow);

    const posRow = mkRow(this.t("objectPosition"));
    const posSel = document.createElement("select");
    posSel.className = "bgv-select";
    [{label: this.t("center"), value: "center"}, {label: this.t("top"), value: "top"}, {label: this.t("bottom"), value: "bottom"}].forEach(o => {
      const opt = document.createElement("option"); opt.value = o.value; opt.textContent = o.label;
      if (o.value === this.settings.objectPosition) opt.selected = true;
      posSel.appendChild(opt);
    });
    posSel.addEventListener("change", e => { this.saveSettings({ objectPosition: e.target.value }); this.applyVisualSettings(); });
    posRow.appendChild(posSel);
    grid.appendChild(posRow);

    // PLAYBACK
    const playbackRow = mkRow(this.t("autoplay") + " / " + this.t("loop") + " / " + this.t("muted"));
    playbackRow.style.flexDirection = "row";
    playbackRow.style.justifyContent = "flex-start";
    playbackRow.style.gap = "20px";
    playbackRow.appendChild(mkToggle(this.t("autoplay"), this.settings.youtubeAutoplay, v => this.saveSettings({youtubeAutoplay: v})));
    playbackRow.appendChild(mkToggle(this.t("loop"), this.settings.youtubeLoop, v => this.saveSettings({youtubeLoop: v})));
    playbackRow.appendChild(mkToggle(this.t("muted"), this.settings.youtubeMuted, v => this.saveSettings({youtubeMuted: v})));
    grid.appendChild(playbackRow);

    // MAX FILE SIZE
    grid.appendChild(mkSliderRow(this.t("maxBlobMB"), "maxBlobMB", 5, 500, 5));

    // FOOTNOTE
    const foot = document.createElement("div");
    foot.className = "bgv-footnote";
    foot.textContent = this.t("liveChanges");
    card.appendChild(foot);

    // BUTTONS
    const btns = document.createElement("div");
    btns.className = "bgv-btns";
    wrap.appendChild(btns);

    const mkBtn = (text, cls, onclick) => {
      const b = document.createElement("button");
      b.className = `bgv-btn ${cls}`.trim();
      b.textContent = text;
      b.onclick = onclick;
      return b;
    };

    btns.appendChild(mkBtn(this.t("apply"), "primary", () => this.updateMediaSource()));
    btns.appendChild(mkBtn(this.t("test"), "", () => this.updateMediaSource()));
    btns.appendChild(mkBtn(this.t("clearLocalFile"), "danger", () => {
       if (this._localFileBlobUrl) {
           this.log("Diagnostics: Revoking blob URL on explicit clear.");
           URL.revokeObjectURL(this._localFileBlobUrl);
           this._localFileBlobUrl = null;
       }
       this.saveSettings({ localFilePath: null, localFileMeta: null });
       this.toast("Cleared", "success");
       updateRender();
    }));
    btns.appendChild(mkBtn(this.t("reset"), "danger", () => {
      this.settings = { ...this.defaults };
      BdApi.Data.save(this.PLUGIN_NAME, "settings", this.settings);
      this.updateMediaSource();
      updateRender();
    }));

    return wrap;
  }
};
