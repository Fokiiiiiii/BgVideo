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
    mediaTest: "Media Test",
    appearance: "Appearance",
    playback: "Playback",
    limitsSafety: "Limits & Safety",
    diagnostics: "Diagnostics",
    mediaUrl: "Media URL",
    sourceMode: "Source Mode",
    localFile: "Local File",
    youtube: "YouTube",
    testMedia: "Test Media",
    applyReload: "Apply / Reload Media",
    clearLocalFile: "Clear Local File",
    resetDefaults: "Reset to Defaults",
    maxLocalFileSize: "Maximum local file size",
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
    descSource: "Select where your media comes from.",
    descTest: "Apply changes immediately.",
    descAppearance: "Adjust visual settings.",
    descPlayback: "Options sent to YouTube iframe.",
    descLimits: "Reduced motion and local bounds.",
    descDiag: "Status reporting.",
    remoteUrl: "Remote URL",
    youtubeWarning: "YouTube playback is a best-effort iframe renderer. Autoplay, loops, and embeds depend entirely on YouTube policies. Some videos cannot be embedded.",
    localRestartWarning: "Local files are loaded directly from disk. You MUST re-select the file after restarting Discord/BetterDiscord.",
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
    showControls: "Show Controls",
    pauseVideo: "Pause Video",
    hideAnimated: "Hide Animated/Media",
    disableAllMedia: "Disable All Media",
    ignore: "Ignore",
    mediaTypeOverride: "Media Type Override",
    reducedMotionBehavior: "Reduced Motion Behavior",
    language: "Language",
    languageDesc: "UI Language",
    fileSelectWarning: "Supported: mp4, webm, png, jpg, gif, webp."
  },
  ja: {
    source: "ソース",
    mediaTest: "メディアテスト",
    appearance: "表示",
    playback: "再生",
    limitsSafety: "上限と安全性",
    diagnostics: "診断",
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
    descSource: "メディアの取得元を選択します。",
    descTest: "変更を直ちに適用します。",
    descAppearance: "視覚的な設定を調整します。",
    descPlayback: "YouTubeのiframeへ送信するオプション。",
    descLimits: "視差効果の低減とローカルファイルの上限。",
    descDiag: "状態のレポート。",
    remoteUrl: "リモートURL",
    youtubeWarning: "YouTubeの再生はベストエフォートなiframeレンダリングです。自動再生、ループ、埋め込み機能はYouTubeのポリシーに依存します。一部の動画は埋め込みできません。",
    localRestartWarning: "ローカルファイルは直接ディスクから読み込まれます。Discord/BetterDiscordを再起動した後は再選択が必須です。",
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
    showControls: "コントロールを表示",
    pauseVideo: "動画を一時停止",
    hideAnimated: "アニメーション/メディアを非表示",
    disableAllMedia: "すべてのメディアを無効化",
    ignore: "無視",
    mediaTypeOverride: "メディア種別オーバーライド",
    reducedMotionBehavior: "視差効果を減らす際の動作",
    language: "言語",
    languageDesc: "UI言語設定",
    fileSelectWarning: "対応形式: mp4, webm, png, jpg, gif, webp"
  }
};

module.exports = class BgVideo {
  constructor() {
    this.PLUGIN_NAME = "BgVideo";
    this.PANEL_STYLE_ID = `${this.PLUGIN_NAME}-panel`;

    this.defaults = {
      language: "auto", // auto, en, ja
      sourceMode: "url", // url, localFile, youtube
      mediaType: "auto", // auto, video, image, youtube
      mediaUrl: "https://raw.githubusercontent.com/Fokiiiiiii/disocrd-Thema/main/Grievous_Lady_2.5_.mp4",
      localFileMeta: null,
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

  t(key) {
    let lang = this.settings.language;
    if (lang === "auto") {
      const navLang = (navigator.language || navigator.userLanguage || "en").toLowerCase();
      lang = navLang.startsWith("ja") ? "ja" : "en";
    }
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
    // Migrate old .url to .mediaUrl
    if (saved.url && !saved.mediaUrl) {
      saved.mediaUrl = saved.url;
      delete saved.url;
      changed = true;
    }
    // Respect reduced motion migration
    if (saved.respectReducedMotion !== undefined) {
      saved.reducedMotionBehavior = saved.respectReducedMotion ? "pauseVideo" : "ignore";
      delete saved.respectReducedMotion;
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
    // Avoid spam
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
      // YouTube loop requires playlist param for single video
      params.append("playlist", playlistId || videoId);
    }
    params.append("controls", "0"); // Force controls off for background playback
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
    } catch (e) {
      this.log("Reduced motion init failed:", e);
    }
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

    if (this.settings.sourceMode === "url") {
      sourceUrl = this.settings.mediaUrl?.trim();
    } else if (this.settings.sourceMode === "localFile") {
      if (this._localFileBlobUrl) {
        sourceUrl = this._localFileBlobUrl;
      } else {
        this.toast(this.t("localRestartWarning"), "error");
        return;
      }
    } else if (this.settings.sourceMode === "youtube") {
      sourceUrl = this.settings.mediaUrl?.trim();
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
      this.toast(`Image failed to load.`, "error");
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
      controls: false // Enforce false for background
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
      /* Approximate object-fit for iframes since it isn't fully supported natively by iframes */
      iframe#bgVideo-media {
        ${s.objectFit === 'cover' ? 'width: 150vw; height: 150vh; left: -25vw; top: -25vh; position: absolute;' : ''}
      }
      /* Aggressively hide native video controls */
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
    this._reassertNoControls();
  }

  _reassertNoControls() {
    const node = this._mediaNode;
    if (!node) return;
    
    if (node.tagName === "VIDEO") {
      node.controls = false;
      node.removeAttribute("controls");
      if (node.paused && !this.shouldReduceMotion()) {
        try { node.play(); } catch {}
      }
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
        .bgv-settings-wrap { padding: 8px; color: var(--text-normal); font-family: var(--font-primary); }
        .bgv-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid var(--background-modifier-accent); }
        .bgv-header-title { font-size: 20px; font-weight: 800; color: var(--header-primary); }
        .bgv-header-desc { font-size: 14px; color: var(--header-secondary); margin-top: 4px; }
        .bgv-section { margin-bottom: 16px; padding: 16px; background: var(--background-secondary); border-radius: 8px; border: 1px solid var(--background-modifier-accent); box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
        .bgv-section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; color: var(--header-secondary); letter-spacing: 0.5px; }
        .bgv-section-desc { font-size: 13px; margin-bottom: 16px; color: var(--text-muted); }
        .bgv-row { margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .bgv-row-col { flex-direction: column; align-items: stretch; gap: 8px; }
        .bgv-label-container { flex: 1; min-width: 0; }
        .bgv-label { font-size: 14px; font-weight: 600; color: var(--header-primary); }
        .bgv-desc { font-size: 13px; color: var(--header-secondary); margin-top: 2px; }
        .bgv-input { width: 100%; padding: 8px 12px; background: var(--input-background); border: 1px solid var(--input-background); border-radius: 4px; color: var(--text-normal); box-sizing: border-box; }
        .bgv-select { width: 100%; padding: 8px 12px; background: var(--input-background); border: 1px solid var(--input-background); border-radius: 4px; color: var(--text-normal); cursor: pointer; box-sizing: border-box; }
        .bgv-slider-container { display: flex; align-items: center; gap: 12px; width: 100%; }
        .bgv-slider { flex: 1; cursor: pointer; accent-color: var(--brand-experiment); }
        .bgv-slider-val { font-family: var(--font-code); font-size: 13px; background: var(--background-primary); padding: 4px 8px; border-radius: 4px; min-width: 48px; text-align: center; border: 1px solid var(--background-modifier-accent); }
        .bgv-btn { padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 600; border: none; background: var(--brand-experiment); color: #fff; transition: background-color 0.2s, opacity 0.2s; font-size: 14px; }
        .bgv-btn:hover { background: var(--brand-experiment-560); }
        .bgv-btn-danger { background: var(--button-danger-background); }
        .bgv-btn-danger:hover { background: var(--button-danger-background-hover); }
        .bgv-box { padding: 12px; border-radius: 4px; margin-bottom: 14px; font-size: 13px; line-height: 1.4; }
        .bgv-box-info { background: var(--background-message-hover); border-left: 4px solid var(--brand-experiment); color: var(--text-normal); }
        .bgv-box-warn { background: rgba(250, 166, 26, 0.1); border-left: 4px solid var(--text-warning); color: var(--text-normal); }
        `
      );
      this._panelCssMounted = true;
    }

    const wrap = document.createElement("div");
    wrap.className = "bgv-settings-wrap";

    // --- UI HELPERS ---
    const createHeader = () => {
      const header = document.createElement("div");
      header.className = "bgv-header";
      
      const left = document.createElement("div");
      const title = document.createElement("div");
      title.className = "bgv-header-title";
      title.textContent = this.PLUGIN_NAME;
      const desc = document.createElement("div");
      desc.className = "bgv-header-desc";
      desc.textContent = "Background Media Loop";
      left.appendChild(title);
      left.appendChild(desc);
      header.appendChild(left);
      
      const right = document.createElement("div");
      const langSel = document.createElement("select");
      langSel.className = "bgv-select";
      langSel.style.width = "auto";
      langSel.style.padding = "4px 8px";
      
      [
        { value: "auto", label: "Language: Auto" },
        { value: "en", label: "English" },
        { value: "ja", label: "日本語" }
      ].forEach(opt => {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.label;
        if (opt.value === this.settings.language) option.selected = true;
        langSel.appendChild(option);
      });
      langSel.addEventListener("change", (e) => {
        this.saveSettings({ language: e.target.value });
        updateRender();
      });
      right.appendChild(langSel);
      header.appendChild(right);
      
      wrap.appendChild(header);
    };

    const createSection = (titleText, descText) => {
      const section = document.createElement("div");
      section.className = "bgv-section";
      if (titleText) {
        const title = document.createElement("div");
        title.className = "bgv-section-title";
        title.textContent = titleText;
        section.appendChild(title);
      }
      if (descText) {
        const desc = document.createElement("div");
        desc.className = "bgv-section-desc";
        desc.textContent = descText;
        section.appendChild(desc);
      }
      wrap.appendChild(section);
      return section;
    };

    const createWarningBox = (parent, text) => {
      const box = document.createElement("div");
      box.className = "bgv-box bgv-box-warn";
      box.textContent = text;
      parent.appendChild(box);
    };

    const createInfoBox = (parent, text) => {
      const box = document.createElement("div");
      box.className = "bgv-box bgv-box-info";
      box.textContent = text;
      parent.appendChild(box);
    };

    const createLabelContainer = (labelText, descText) => {
      const lblCont = document.createElement("div");
      lblCont.className = "bgv-label-container";
      const lbl = document.createElement("div");
      lbl.className = "bgv-label";
      lbl.textContent = labelText;
      lblCont.appendChild(lbl);
      if (descText) {
        const desc = document.createElement("div");
        desc.className = "bgv-desc";
        desc.textContent = descText;
        lblCont.appendChild(desc);
      }
      return lblCont;
    };

    const createSelectRow = (parent, labelText, descText, options, value, onChange) => {
      const row = document.createElement("div");
      row.className = "bgv-row bgv-row-col";
      row.appendChild(createLabelContainer(labelText, descText));

      const sel = document.createElement("select");
      sel.className = "bgv-select";
      options.forEach(opt => {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.label;
        if (opt.value === value) option.selected = true;
        sel.appendChild(option);
      });
      sel.addEventListener("change", (e) => onChange(e.target.value));
      row.appendChild(sel);
      
      parent.appendChild(row);
      return sel;
    };

    const createInputRow = (parent, labelText, descText, value, placeholder, onChange) => {
      const row = document.createElement("div");
      row.className = "bgv-row bgv-row-col";
      row.appendChild(createLabelContainer(labelText, descText));

      const inp = document.createElement("input");
      inp.className = "bgv-input";
      inp.type = "text";
      inp.value = value || "";
      inp.placeholder = placeholder || "";
      inp.addEventListener("input", (e) => onChange(e.target.value));
      row.appendChild(inp);

      parent.appendChild(row);
      return inp;
    };

    const createSliderRow = (parent, labelText, descText, min, max, step, value, onChange, unit = "") => {
      const row = document.createElement("div");
      row.className = "bgv-row bgv-row-col";
      row.appendChild(createLabelContainer(labelText, descText));

      const container = document.createElement("div");
      container.className = "bgv-slider-container";

      const slider = document.createElement("input");
      slider.className = "bgv-slider";
      slider.type = "range";
      slider.min = min;
      slider.max = max;
      slider.step = step;
      slider.value = value;

      const numInput = document.createElement("input");
      numInput.className = "bgv-slider-val";
      numInput.type = "number";
      numInput.min = min;
      numInput.max = max;
      numInput.step = step;
      numInput.value = value;
      numInput.style.width = "70px";

      const syncVal = (valStr) => {
        let v = parseFloat(valStr);
        if (isNaN(v)) return;
        v = Math.max(min, Math.min(max, v));
        slider.value = v;
        numInput.value = v;
        onChange(v);
      };

      slider.addEventListener("input", (e) => syncVal(e.target.value));
      numInput.addEventListener("change", (e) => syncVal(e.target.value));

      container.appendChild(slider);
      container.appendChild(numInput);
      if (unit) {
        const u = document.createElement("span");
        u.textContent = unit;
        u.style.fontSize = "13px";
        u.style.color = "var(--header-secondary)";
        container.appendChild(u);
      }
      row.appendChild(container);

      parent.appendChild(row);
      return slider;
    };

    const createSwitchRow = (parent, labelText, descText, value, onChange) => {
      const row = document.createElement("div");
      row.className = "bgv-row";
      row.appendChild(createLabelContainer(labelText, descText));

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = value;
      cb.style.transform = "scale(1.3)";
      cb.style.cursor = "pointer";
      cb.addEventListener("change", (e) => onChange(e.target.checked));
      row.appendChild(cb);

      parent.appendChild(row);
      return cb;
    };

    const createFilePickerRow = (parent, labelText, descText, onFileChange) => {
      const row = document.createElement("div");
      row.className = "bgv-row bgv-row-col";
      row.appendChild(createLabelContainer(labelText, descText));

      const inp = document.createElement("input");
      inp.type = "file";
      inp.accept = "video/mp4,video/webm,image/png,image/jpeg,image/gif,image/webp,image/avif";
      inp.className = "bgv-input";
      inp.style.padding = "6px";
      
      inp.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          onFileChange(file);
        }
      });
      row.appendChild(inp);

      parent.appendChild(row);
      return inp;
    };

    const updateRender = () => {
      wrap.innerHTML = "";
      createHeader();

      // 1. Source
      const secSource = createSection(this.t("source"), this.t("descSource"));
      createSelectRow(secSource, this.t("sourceMode"), "", [
        { label: this.t("remoteUrl"), value: "url" },
        { label: this.t("localFile"), value: "localFile" },
        { label: this.t("youtube"), value: "youtube" }
      ], this.settings.sourceMode, (v) => {
        this.saveSettings({ sourceMode: v });
        updateRender();
      });

      if (this.settings.sourceMode === "url" || this.settings.sourceMode === "youtube") {
        createInputRow(secSource, this.t("mediaUrl"), "", this.settings.mediaUrl, "https://...", (v) => {
          this.saveSettings({ mediaUrl: v });
        });
        
        if (this.settings.sourceMode === "youtube") {
          createWarningBox(secSource, this.t("youtubeWarning"));
        }
      } else if (this.settings.sourceMode === "localFile") {
        createWarningBox(secSource, this.t("localRestartWarning"));
        createFilePickerRow(secSource, this.t("localFile"), this.t("fileSelectWarning"), (file) => {
          if (file.size > this.settings.maxBlobMB * 1024 * 1024) {
            BdApi.UI.showToast(this.t("fileTooLarge"), { type: "error" });
            return;
          }
          if (this._localFileBlobUrl) {
            URL.revokeObjectURL(this._localFileBlobUrl);
          }
          this._localFileBlobUrl = URL.createObjectURL(file);
          const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
          this.saveSettings({ localFileMeta: `${file.name} (${sizeMB} MB)` });
          BdApi.UI.showToast(`Selected ${file.name}`, { type: "success" });
          updateRender();
        });
        if (this.settings.localFileMeta) {
          createInfoBox(secSource, `Selected: ${this.settings.localFileMeta}`);
        }
      }

      createSelectRow(secSource, this.t("mediaTypeOverride"), "", [
        { label: this.t("autoDetect"), value: "auto" },
        { label: this.t("video"), value: "video" },
        { label: this.t("image"), value: "image" },
        { label: this.t("youtube"), value: "youtube" }
      ], this.settings.mediaType, (v) => {
        this.saveSettings({ mediaType: v });
      });

      // 2. Preview / Test
      const secTest = createSection(this.t("mediaTest"), this.t("descTest"));
      const btnRow = document.createElement("div");
      btnRow.style.display = "flex";
      btnRow.style.gap = "12px";
      
      const btnApply = document.createElement("button");
      btnApply.className = "bgv-btn";
      btnApply.textContent = this.t("applyReload");
      btnApply.onclick = () => this.updateMediaSource();
      
      const btnReset = document.createElement("button");
      btnReset.className = "bgv-btn bgv-btn-danger";
      btnReset.textContent = this.t("resetDefaults");
      btnReset.onclick = () => {
        this.settings = { ...this.defaults, language: this.settings.language };
        BdApi.Data.save(this.PLUGIN_NAME, "settings", this.settings);
        this.updateMediaSource();
        updateRender();
      };
      
      btnRow.appendChild(btnApply);
      btnRow.appendChild(btnReset);
      secTest.appendChild(btnRow);

      // 3. Appearance
      const secApp = createSection(this.t("appearance"), this.t("descAppearance"));
      createSelectRow(secApp, this.t("objectFit"), "", [
        { label: this.t("cover"), value: "cover" },
        { label: this.t("contain"), value: "contain" },
        { label: this.t("fill"), value: "fill" }
      ], this.settings.objectFit, (v) => { this.saveSettings({ objectFit: v }); this.applyVisualSettings(); });
      
      createSelectRow(secApp, this.t("objectPosition"), "", [
        { label: this.t("center"), value: "center" },
        { label: this.t("top"), value: "top" },
        { label: this.t("bottom"), value: "bottom" },
      ], this.settings.objectPosition, (v) => { this.saveSettings({ objectPosition: v }); this.applyVisualSettings(); });

      createSliderRow(secApp, this.t("opacity"), "", 0, 1, 0.01, this.settings.opacity, (v) => { this.saveSettings({ opacity: v }); this.applyVisualSettings(); });
      createSliderRow(secApp, this.t("blur"), "", 0, 20, 0.1, this.settings.blur, (v) => { this.saveSettings({ blur: v }); this.applyVisualSettings(); }, "px");
      createSliderRow(secApp, this.t("saturation"), "", 0, 3, 0.01, this.settings.saturate, (v) => { this.saveSettings({ saturate: v }); this.applyVisualSettings(); });
      createSliderRow(secApp, this.t("brightness"), "", 0, 2, 0.01, this.settings.brightness, (v) => { this.saveSettings({ brightness: v }); this.applyVisualSettings(); });

      // 4. Playback (YouTube)
      if (this.settings.sourceMode === "youtube" || this.settings.mediaType === "youtube") {
        const secPlay = createSection(this.t("playback"), this.t("descPlayback"));
        createSwitchRow(secPlay, this.t("autoplay"), "", this.settings.youtubeAutoplay, (v) => this.saveSettings({ youtubeAutoplay: v }));
        createSwitchRow(secPlay, this.t("muted"), "", this.settings.youtubeMuted, (v) => this.saveSettings({ youtubeMuted: v }));
        createSwitchRow(secPlay, this.t("loop"), "", this.settings.youtubeLoop, (v) => this.saveSettings({ youtubeLoop: v }));
      }

      // 5. Limits & Safety
      const secAdv = createSection(this.t("limitsSafety"), this.t("descLimits"));
      createSliderRow(secAdv, this.t("maxLocalFileSize"), "", 5, 500, 5, this.settings.maxBlobMB, (v) => { this.saveSettings({ maxBlobMB: v }); }, "MB");
      
      createSelectRow(secAdv, this.t("reducedMotionBehavior"), "", [
        { label: this.t("pauseVideo"), value: "pauseVideo" },
        { label: this.t("hideAnimated"), value: "hideAnimated" },
        { label: this.t("disableAllMedia"), value: "disableAllMedia" },
        { label: this.t("ignore"), value: "ignore" }
      ], this.settings.reducedMotionBehavior, (v) => {
        this.saveSettings({ reducedMotionBehavior: v });
        this.applyReducedMotion();
      });

      // 6. Diagnostics
      const secDiag = createSection(this.t("diagnostics"), this.t("descDiag"));
      let diagInfo = `Mode: ${this.settings.sourceMode}\n`;
      let mediaType = this.settings.mediaType === 'auto' ? this.guessMediaType(this.settings.mediaUrl) : this.settings.mediaType;
      diagInfo += `Detected Type: ${mediaType}\n`;
      if (mediaType === "youtube") {
         diagInfo += `YouTube ID: ${this.parseYouTubeVideoId(this.settings.mediaUrl) || 'None'}\n`;
      }
      diagInfo += `WebP Support: ${this._isWebPSupportedCache !== null ? this._isWebPSupportedCache : 'Pending'}`;
      createInfoBox(secDiag, diagInfo);
      
      createSwitchRow(secDiag, this.t("debug"), "", this.settings.debug, (v) => this.saveSettings({ debug: v }));
    };

    updateRender();
    return wrap;
  }
};
