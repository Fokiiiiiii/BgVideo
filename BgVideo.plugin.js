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
    source: "Source",
    appearance: "Appearance",
    playback: "Playback",
    advancedDiagnostics: "Advanced / Diagnostics",
    mediaUrl: "Media URL",
    sourceMode: "Source Mode",
    localFile: "Local File",
    youtube: "YouTube",
    testMedia: "Test Media",
    applyReload: "Apply / Reload",
    clearLocalFile: "Clear Local File",
    resetDefaults: "Reset Defaults",
    maxLocalFileSize: "Max local file size",
    opacity: "Opacity",
    blur: "Blur",
    brightness: "Brightness",
    saturation: "Saturation",
    objectFit: "Object Fit",
    objectPosition: "Object Position",
    autoplay: "Autoplay",
    loop: "Loop",
    muted: "Muted",
    debug: "Debug",
    status: "Status",
    remoteUrl: "Remote URL",
    localRestartWarning: "This environment does not support automatic local file reload. Please reselect the file after restart.",
    fileTooLarge: "File is too large. Increase the limit or choose a smaller file.",
    invalidUrl: "Invalid URL.",
    unsupportedMedia: "Unsupported media type.",
    webpFailed: "WebP failed to load in this Discord/Electron environment. Try PNG, JPG, GIF, MP4, or WebM.",
    autoDetect: "Auto Detect",
    video: "Video",
    image: "Image",
    cover: "Cover",
    contain: "Contain",
    fill: "Fill",
    center: "Center",
    top: "Top",
    bottom: "Bottom",
    pauseVideo: "Pause Video",
    hideAnimated: "Hide Animated/Media",
    disableAllMedia: "Disable All Media",
    ignore: "Ignore",
    reducedMotionBehavior: "Reduced Motion Behavior",
    clearFileConfirm: "Local file cleared.",
  },
  ja: {
    source: "ソース",
    appearance: "表示",
    playback: "再生",
    advancedDiagnostics: "詳細設定 / 診断",
    mediaUrl: "メディアURL",
    sourceMode: "ソース種別",
    localFile: "ローカルファイル",
    youtube: "YouTube",
    testMedia: "メディアをテスト",
    applyReload: "適用 / 再読み込み",
    clearLocalFile: "ローカルファイルを解除",
    resetDefaults: "初期設定に戻す",
    maxLocalFileSize: "ローカルファイル最大サイズ",
    opacity: "不透明度",
    blur: "ぼかし",
    brightness: "明るさ",
    saturation: "彩度",
    objectFit: "表示方法",
    objectPosition: "表示位置",
    autoplay: "自動再生",
    loop: "ループ",
    muted: "ミュート",
    debug: "デバッグ",
    status: "状態",
    remoteUrl: "リモートURL",
    localRestartWarning: "この環境ではローカルファイルの自動再読み込みに対応していません。再起動後は再選択が必要です。",
    fileTooLarge: "ファイルサイズが上限を超えています。上限を上げるか、より小さいファイルを選択してください。",
    invalidUrl: "無効なURLです。",
    unsupportedMedia: "サポートされていないメディア形式です。",
    webpFailed: "このDiscord/Electron環境ではWebPの読み込みに失敗しました。PNG、JPG、GIF、MP4、またはWebMをお試しください。",
    autoDetect: "自動検出",
    video: "動画",
    image: "画像",
    cover: "カバー (Cover)",
    contain: "コンテイン (Contain)",
    fill: "フィル (Fill)",
    center: "中央",
    top: "上部",
    bottom: "下部",
    pauseVideo: "動画を一時停止",
    hideAnimated: "アニメーション/メディアを非表示",
    disableAllMedia: "すべてのメディアを無効化",
    ignore: "無視",
    reducedMotionBehavior: "視差効果を減らす際の動作",
    clearFileConfirm: "ローカルファイルを解除しました。",
  }
};

module.exports = class BgVideo {
  constructor() {
    this.PLUGIN_NAME = "BgVideo";
    this.PANEL_STYLE_ID = `${this.PLUGIN_NAME}-panel`;

    this.defaults = {
      sourceMode: "url", // url, localFile, youtube
      mediaType: "auto", // auto, video, image, youtube
      mediaUrl: "https://raw.githubusercontent.com/Fokiiiiiii/disocrd-Thema/main/Grievous_Lady_2.5_.mp4",
      localFileMeta: null,
      localFilePath: null,
      objectFit: "cover",
      objectPosition: "center",
      opacity: 0.3,
      blur: 1.2,
      saturate: 1.08,
      brightness: 0.88,
      reducedMotionBehavior: "pauseVideo", // pauseVideo, hideAnimated, disableAllMedia, ignore
      maxBlobMB: 80,
      youtubeAutoplay: true,
      youtubeMuted: true,
      youtubeLoop: true,
      youtubeControls: false,
      youtubeStartSeconds: 0,
      debug: false,
    };

    this.settings = this.loadSettings();

    // State
    this._mediaNode = null; // Can be video, img, or iframe
    this._localFileBlobUrl = null;
    this._cssText = "";
    this._panelCssMounted = false;
    this._motionQuery = null;
    this._onMotionChange = null;
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

  // --- SETTINGS MANAGEMENT ---
  
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
    if (saved.respectReducedMotion !== undefined) {
      saved.reducedMotionBehavior = saved.respectReducedMotion ? "pauseVideo" : "ignore";
      delete saved.respectReducedMotion;
      changed = true;
    }
    // Remove unused language setting if it somehow got persisted
    if (saved.language !== undefined) {
      delete saved.language;
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

  // --- LOGGING / STATUS ---

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

  // --- MEDIA DETECTION ---

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

  buildYouTubeEmbedUrl({ videoId, playlistId, start, loop, mute, autoplay, controls }) {
    const params = new URLSearchParams();
    if (autoplay) params.append("autoplay", "1");
    if (mute) params.append("mute", "1");
    if (loop) {
      params.append("loop", "1");
      params.append("playlist", playlistId || videoId);
    }
    params.append("controls", "0");
    if (start > 0) params.append("start", Math.floor(start).toString());
    params.append("playsinline", "1");
    params.append("rel", "0");
    params.append("modestbranding", "1");
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }

  checkWebPSupport() {
    return new Promise((resolve) => {
      if (this._isWebPSupportedCache !== null) {
        return resolve(this._isWebPSupportedCache);
      }
      const img = new Image();
      img.onload = () => {
        this._isWebPSupportedCache = img.width > 0 && img.height > 0;
        resolve(this._isWebPSupportedCache);
      };
      img.onerror = () => {
        this._isWebPSupportedCache = false;
        resolve(false);
      };
      img.src = "data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==";
    });
  }

  guessMediaType(url) {
    if (this.isYouTubeUrl(url)) return "youtube";
    const extMatch = String(url || "").match(/\.([a-z0-9]+)(?:[\?#]|$)/i);
    const ext = extMatch ? extMatch[1].toLowerCase() : "";
    if (["mp4", "webm", "ogv"].includes(ext)) return "video";
    if (["png", "jpg", "jpeg", "gif", "avif", "bmp", "webp"].includes(ext)) return "image";
    return "unknown";
  }

  // --- REDUCED MOTION ---

  shouldReduceMotion() {
    if (this.settings.reducedMotionBehavior === "ignore") return false;
    try {
      const q = this._motionQuery || window.matchMedia?.("(prefers-reduced-motion: reduce)");
      return !!q?.matches;
    } catch {
      return false;
    }
  }

  attachReducedMotionHandler() {
    if (this._motionQuery || this._onMotionChange) return;
    try {
      this._motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      this._onMotionChange = () => {
        this.applyReducedMotion();
      };
      this._motionQuery.addEventListener("change", this._onMotionChange);
    } catch (e) {}
  }

  detachReducedMotionHandler() {
    if (this._motionQuery && this._onMotionChange) {
      try {
        this._motionQuery.removeEventListener("change", this._onMotionChange);
      } catch {}
    }
    this._motionQuery = null;
    this._onMotionChange = null;
  }

  applyReducedMotion() {
    const isReduced = this.shouldReduceMotion();
    const node = this._mediaNode;
    if (!node) return;

    const behavior = this.settings.reducedMotionBehavior;
    if (behavior === "ignore") return;

    if (isReduced) {
      if (behavior === "disableAllMedia" || behavior === "hideAnimated") {
        node.style.display = "none";
      }
      if ((behavior === "pauseVideo" || behavior === "hideAnimated") && node.tagName === "VIDEO") {
        try { node.pause(); } catch {}
      }
    } else {
      node.style.display = "";
      if (node.tagName === "VIDEO") {
        try { node.play(); } catch {}
        this._reassertNoControls();
      }
    }
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
    let mediaType = this.settings.mediaType;

    if (this.settings.sourceMode === "url" || this.settings.sourceMode === "youtube") {
      sourceUrl = this.settings.mediaUrl?.trim();
    } else if (this.settings.sourceMode === "localFile") {
      if (this.settings.localFilePath) {
        sourceUrl = `file://${this.settings.localFilePath}`;
      } else if (this._localFileBlobUrl) {
        sourceUrl = this._localFileBlobUrl;
      } else {
        this.toast(this.t("localRestartWarning"), "error");
        return;
      }
    }

    if (!sourceUrl) return;

    if (mediaType === "auto") {
      mediaType = this.guessMediaType(sourceUrl);
    }

    if (mediaType === "youtube" || this.settings.sourceMode === "youtube") {
      const videoId = this.parseYouTubeVideoId(sourceUrl);
      if (!videoId) {
        this.toast(this.t("invalidUrl"), "error");
        return;
      }
      this._mediaNode = this.createYouTubeRenderer(videoId, sourceUrl);
    } else if (mediaType === "video") {
      this._mediaNode = this.createVideoRenderer(sourceUrl);
    } else if (mediaType === "image") {
      if (sourceUrl.toLowerCase().endsWith(".webp")) {
        const supported = await this.checkWebPSupport();
        if (!supported) {
          this.toast(this.t("webpFailed"), "error");
          return;
        }
      }
      this._mediaNode = this.createImageRenderer(sourceUrl);
    } else {
      this.toast(this.t("unsupportedMedia"), "error");
      return;
    }

    wrapper.appendChild(this._mediaNode);
    this.applyVisualSettings();
    this.applyReducedMotion();
    this._reassertNoControls();
  }

  createVideoRenderer(src) {
    const v = document.createElement("video");
    v.id = "bgVideo-media";
    v.autoplay = true;
    v.loop = true;
    v.muted = true;
    v.playsInline = true;
    v.controls = false;
    v.removeAttribute("controls");
    v.crossOrigin = "anonymous";
    v.tabIndex = -1;
    v.setAttribute("aria-hidden", "true");
    v.src = src;

    v.addEventListener("error", () => {
      this.toast(`Video load error.`, "error");
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
    
    img.addEventListener("error", () => {
      this.toast(`Image load error.`, "error");
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
    
    iframe.src = this.buildYouTubeEmbedUrl({
      videoId,
      playlistId,
      start: this.settings.youtubeStartSeconds,
      loop: this.settings.youtubeLoop,
      mute: this.settings.youtubeMuted,
      autoplay: this.settings.youtubeAutoplay,
      controls: false
    });

    return iframe;
  }

  // --- VISUAL STYLING ---

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

  // --- FOCUS & VISIBILITY HANDLERS ---

  _onVisibilityOrFocus() {
    // Only re-assert non-interactivity. Do not force pause/play.
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
    if (wrapper) {
      wrapper.style.pointerEvents = "none";
    }
  }

  // --- LIFECYCLE ---

  start() {
    this.attachReducedMotionHandler();
    this.updateMediaSource();
    document.addEventListener("visibilitychange", this._onVisibilityOrFocus);
    window.addEventListener("focus", this._onVisibilityOrFocus);
  }

  stop() {
    this.detachReducedMotionHandler();
    document.removeEventListener("visibilitychange", this._onVisibilityOrFocus);
    window.removeEventListener("focus", this._onVisibilityOrFocus);
    this.destroyRenderer();
    const wrapper = document.getElementById("bgVideo-wrapper");
    if (wrapper) wrapper.remove();
    BdApi.DOM.removeStyle(this.PLUGIN_NAME);
    BdApi.DOM.removeStyle(this.PANEL_STYLE_ID);
    if (this._localFileBlobUrl) {
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
        .bgv-wrap { padding: 10px; color: var(--text-normal); font-family: var(--font-primary); font-size: 14px; }
        .bgv-section-title { font-weight: 700; color: var(--header-primary); margin: 20px 0 10px 0; padding-bottom: 4px; border-bottom: 1px solid var(--background-modifier-accent); }
        .bgv-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--background-modifier-accent); }
        .bgv-row-col { flex-direction: column; align-items: flex-start; }
        .bgv-row-col > div { margin-bottom: 6px; }
        .bgv-label { font-weight: 600; color: var(--header-primary); }
        .bgv-desc { font-size: 12px; color: var(--header-secondary); margin-top: 2px; }
        .bgv-input, .bgv-select { width: 100%; max-width: 400px; padding: 8px; background: var(--input-background); border: 1px solid var(--background-tertiary); border-radius: 4px; color: var(--text-normal); margin-top: 4px; }
        .bgv-slider-container { display: flex; align-items: center; gap: 10px; width: 100%; max-width: 400px; }
        .bgv-slider { flex: 1; accent-color: var(--brand-experiment); }
        .bgv-slider-val { width: 60px; padding: 4px; text-align: center; background: var(--input-background); border: 1px solid var(--background-tertiary); border-radius: 4px; color: var(--text-normal); }
        .bgv-btn { padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 500; border: none; background: var(--brand-experiment); color: #fff; transition: opacity 0.2s; }
        .bgv-btn:hover { opacity: 0.8; }
        .bgv-btn-danger { background: var(--button-danger-background); }
        .bgv-flex-btns { display: flex; gap: 10px; margin-top: 10px; }
        .bgv-help-text { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
        `
      );
      this._panelCssMounted = true;
    }

    const wrap = document.createElement("div");
    wrap.className = "bgv-wrap";

    // --- UI HELPERS ---
    const createSectionTitle = (text) => {
      const el = document.createElement("div");
      el.className = "bgv-section-title";
      el.textContent = text;
      wrap.appendChild(el);
    };

    const createRow = (labelText, descText, rightElement, isCol = false) => {
      const row = document.createElement("div");
      row.className = isCol ? "bgv-row bgv-row-col" : "bgv-row";
      
      const left = document.createElement("div");
      const lbl = document.createElement("div");
      lbl.className = "bgv-label";
      lbl.textContent = labelText;
      left.appendChild(lbl);
      if (descText) {
        const desc = document.createElement("div");
        desc.className = "bgv-desc";
        desc.textContent = descText;
        left.appendChild(desc);
      }
      row.appendChild(left);
      
      if (rightElement) {
        row.appendChild(rightElement);
      }
      wrap.appendChild(row);
      return row;
    };

    const updateRender = () => {
      wrap.innerHTML = "";

      // 1. Source
      createSectionTitle(this.t("source"));
      
      const sourceSel = document.createElement("select");
      sourceSel.className = "bgv-select";
      [
        { label: this.t("remoteUrl"), value: "url" },
        { label: this.t("localFile"), value: "localFile" },
        { label: this.t("youtube"), value: "youtube" }
      ].forEach(opt => {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.label;
        if (opt.value === this.settings.sourceMode) option.selected = true;
        sourceSel.appendChild(option);
      });
      sourceSel.addEventListener("change", (e) => {
        this.saveSettings({ sourceMode: e.target.value });
        updateRender();
      });
      createRow(this.t("sourceMode"), "", sourceSel);

      if (this.settings.sourceMode === "url" || this.settings.sourceMode === "youtube") {
        const inp = document.createElement("input");
        inp.className = "bgv-input";
        inp.type = "text";
        inp.value = this.settings.mediaUrl || "";
        inp.addEventListener("input", (e) => this.saveSettings({ mediaUrl: e.target.value }));
        createRow(this.t("mediaUrl"), "", inp, true);
      } else if (this.settings.sourceMode === "localFile") {
        const fileDiv = document.createElement("div");
        fileDiv.style.width = "100%";
        fileDiv.style.maxWidth = "400px";
        
        const fileInp = document.createElement("input");
        fileInp.type = "file";
        fileInp.accept = "video/mp4,video/webm,image/png,image/jpeg,image/gif,image/webp,image/avif";
        fileInp.style.display = "block";
        fileInp.addEventListener("change", (e) => {
          const file = e.target.files[0];
          if (!file) return;
          if (file.size > this.settings.maxBlobMB * 1024 * 1024) {
            BdApi.UI.showToast(this.t("fileTooLarge"), { type: "error" });
            return;
          }
          if (this._localFileBlobUrl) URL.revokeObjectURL(this._localFileBlobUrl);
          this._localFileBlobUrl = URL.createObjectURL(file);
          
          let localPath = file.path; // Electron persistence
          const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
          
          this.saveSettings({ 
             localFilePath: localPath || null, 
             localFileMeta: `${file.name} (${sizeMB} MB)` 
          });
          BdApi.UI.showToast(`Selected ${file.name}`, { type: "success" });
          updateRender();
        });
        fileDiv.appendChild(fileInp);

        if (this.settings.localFileMeta) {
          const metaText = document.createElement("div");
          metaText.className = "bgv-help-text";
          metaText.textContent = `Selected: ${this.settings.localFileMeta}`;
          fileDiv.appendChild(metaText);
        }
        createRow(this.t("localFile"), "", fileDiv, true);
      }

      const btnDiv = document.createElement("div");
      btnDiv.className = "bgv-flex-btns";
      
      const btnApply = document.createElement("button");
      btnApply.className = "bgv-btn";
      btnApply.textContent = this.t("applyReload");
      btnApply.onclick = () => this.updateMediaSource();
      btnDiv.appendChild(btnApply);
      
      if (this.settings.sourceMode === "localFile" && (this.settings.localFilePath || this._localFileBlobUrl)) {
        const btnClearFile = document.createElement("button");
        btnClearFile.className = "bgv-btn bgv-btn-danger";
        btnClearFile.textContent = this.t("clearLocalFile");
        btnClearFile.onclick = () => {
           if (this._localFileBlobUrl) URL.revokeObjectURL(this._localFileBlobUrl);
           this._localFileBlobUrl = null;
           this.saveSettings({ localFilePath: null, localFileMeta: null });
           BdApi.UI.showToast(this.t("clearFileConfirm"), { type: "success" });
           updateRender();
        };
        btnDiv.appendChild(btnClearFile);
      }
      createRow("", "", btnDiv);

      // 2. Appearance
      createSectionTitle(this.t("appearance"));
      
      const buildSlider = (min, max, step, val, onChange, unit = "") => {
        const cont = document.createElement("div");
        cont.className = "bgv-slider-container";
        const sl = document.createElement("input");
        sl.className = "bgv-slider";
        sl.type = "range"; sl.min = min; sl.max = max; sl.step = step; sl.value = val;
        const nu = document.createElement("input");
        nu.className = "bgv-slider-val";
        nu.type = "number"; nu.min = min; nu.max = max; nu.step = step; nu.value = val;
        
        const sync = (vStr) => {
          let v = parseFloat(vStr);
          if (isNaN(v)) return;
          v = Math.max(min, Math.min(max, v));
          sl.value = v; nu.value = v; onChange(v);
        };
        sl.addEventListener("input", e => sync(e.target.value));
        nu.addEventListener("change", e => sync(e.target.value));
        
        cont.appendChild(sl);
        cont.appendChild(nu);
        if (unit) {
           const u = document.createElement("span");
           u.textContent = unit;
           u.style.fontSize = "12px";
           cont.appendChild(u);
        }
        return cont;
      };

      createRow(this.t("opacity"), "", buildSlider(0, 1, 0.01, this.settings.opacity, v => { this.saveSettings({ opacity: v }); this.applyVisualSettings(); }));
      createRow(this.t("blur"), "", buildSlider(0, 20, 0.1, this.settings.blur, v => { this.saveSettings({ blur: v }); this.applyVisualSettings(); }, "px"));
      createRow(this.t("brightness"), "", buildSlider(0, 2, 0.01, this.settings.brightness, v => { this.saveSettings({ brightness: v }); this.applyVisualSettings(); }));
      createRow(this.t("saturation"), "", buildSlider(0, 3, 0.01, this.settings.saturate, v => { this.saveSettings({ saturate: v }); this.applyVisualSettings(); }));

      const objFitSel = document.createElement("select");
      objFitSel.className = "bgv-select";
      [{label: this.t("cover"), value: "cover"}, {label: this.t("contain"), value: "contain"}, {label: this.t("fill"), value: "fill"}].forEach(o => {
        const opt = document.createElement("option"); opt.value = o.value; opt.textContent = o.label;
        if (o.value === this.settings.objectFit) opt.selected = true;
        objFitSel.appendChild(opt);
      });
      objFitSel.addEventListener("change", e => { this.saveSettings({ objectFit: e.target.value }); this.applyVisualSettings(); });
      createRow(this.t("objectFit"), "", objFitSel);

      const objPosSel = document.createElement("select");
      objPosSel.className = "bgv-select";
      [{label: this.t("center"), value: "center"}, {label: this.t("top"), value: "top"}, {label: this.t("bottom"), value: "bottom"}].forEach(o => {
        const opt = document.createElement("option"); opt.value = o.value; opt.textContent = o.label;
        if (o.value === this.settings.objectPosition) opt.selected = true;
        objPosSel.appendChild(opt);
      });
      objPosSel.addEventListener("change", e => { this.saveSettings({ objectPosition: e.target.value }); this.applyVisualSettings(); });
      createRow(this.t("objectPosition"), "", objPosSel);

      // 3. Playback
      createSectionTitle(this.t("playback"));
      
      const buildSwitch = (val, onChange) => {
        const cb = document.createElement("input");
        cb.type = "checkbox"; cb.checked = val; cb.style.transform = "scale(1.2)"; cb.style.cursor = "pointer";
        cb.addEventListener("change", e => onChange(e.target.checked));
        return cb;
      };

      createRow(this.t("autoplay"), "", buildSwitch(this.settings.youtubeAutoplay, v => this.saveSettings({ youtubeAutoplay: v })));
      createRow(this.t("loop"), "", buildSwitch(this.settings.youtubeLoop, v => this.saveSettings({ youtubeLoop: v })));
      createRow(this.t("muted"), "", buildSwitch(this.settings.youtubeMuted, v => this.saveSettings({ youtubeMuted: v })));

      // 4. Advanced / Diagnostics
      createSectionTitle(this.t("advancedDiagnostics"));
      createRow(this.t("maxLocalFileSize"), "", buildSlider(5, 500, 5, this.settings.maxBlobMB, v => this.saveSettings({ maxBlobMB: v }), "MB"));
      
      const rmSel = document.createElement("select");
      rmSel.className = "bgv-select";
      [{label: this.t("pauseVideo"), value: "pauseVideo"}, {label: this.t("hideAnimated"), value: "hideAnimated"}, {label: this.t("disableAllMedia"), value: "disableAllMedia"}, {label: this.t("ignore"), value: "ignore"}].forEach(o => {
        const opt = document.createElement("option"); opt.value = o.value; opt.textContent = o.label;
        if (o.value === this.settings.reducedMotionBehavior) opt.selected = true;
        rmSel.appendChild(opt);
      });
      rmSel.addEventListener("change", e => { this.saveSettings({ reducedMotionBehavior: e.target.value }); this.applyReducedMotion(); });
      createRow(this.t("reducedMotionBehavior"), "", rmSel);

      createRow(this.t("debug"), "", buildSwitch(this.settings.debug, v => this.saveSettings({ debug: v })));

      const btnReset = document.createElement("button");
      btnReset.className = "bgv-btn bgv-btn-danger";
      btnReset.textContent = this.t("resetDefaults");
      btnReset.onclick = () => {
        this.settings = { ...this.defaults };
        BdApi.Data.save(this.PLUGIN_NAME, "settings", this.settings);
        this.updateMediaSource();
        updateRender();
      };
      createRow("", "", btnReset);
    };

    updateRender();
    return wrap;
  }
};
