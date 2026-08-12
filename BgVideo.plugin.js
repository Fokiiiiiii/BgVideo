/**
 * @name BgVideo
 * @author Fokiiiiiii
 * @authorLink https://github.com/Fokiiiiiii
 * @description Loop an MP4/WebM/Image/YouTube as a background media
 * @version 1.1.4
 * @source https://github.com/Fokiiiiiii/BgVideo
 * @updateUrl https://raw.githubusercontent.com/Fokiiiiiii/BgVideo/main/BgVideo.plugin.js
 */

const STRINGS = {
  en: {
    source: "Source",
    mediaUrl: "Media URL / YouTube URL",
    mediaUrlHint: "HTTP(S) media URL. YouTube share, watch, shorts, live, and playlist URLs are supported.",
    appearance: "Appearance",
    appearanceHint: "Tune readability without reloading the media.",
    playback: "Playback",
    playbackHint: "These controls apply to direct video and YouTube media.",
    behavior: "Behavior",
    behaviorHint: "Control motion preferences, background lifecycle, and recovery.",
    diagnostics: "Diagnostics",
    diagnosticsHint: "Troubleshooting information and safe reset actions.",
    opacity: "Opacity",
    opacityHint: "0.00 = invisible, 1.00 = fully visible.",
    blur: "Blur",
    blurHint: "GPU cost increases with larger values.",
    brightness: "Brightness",
    brightnessHint: "1.00 is the original brightness.",
    saturate: "Saturation",
    saturateHint: "1.00 is the original saturation.",
    autoplay: "Autoplay",
    loop: "Loop",
    muted: "Muted",
    apply: "Apply",
    test: "Test",
    reset: "Reset Defaults",
    debug: "Debug",
    reducedMotion: "Reduced Motion",
    reducedMotionHint: "Respect the operating system prefers-reduced-motion setting.",
    pauseVideo: "Pause video / hide animated media",
    hideMedia: "Hide all background media",
    ignoreMotion: "Ignore reduced motion",
    autoRecover: "Auto Recover Playback",
    autoRecoverHint: "Retry direct video playback after a stalled stream.",
    stallThreshold: "Stall Threshold",
    stallThresholdHint: "Seconds before a stalled direct video is retried.",
    pauseWhenHidden: "Pause when Discord is hidden",
    pauseWhenHiddenHint: "Save CPU and GPU while Discord is not visible.",
    status: "Status",
    statusIdle: "Idle",
    statusLoading: "Loading",
    statusReady: "Ready",
    statusError: "Error",
    statusPreview: "Preview",
    video: "Video",
    image: "Image",
    youtubeMedia: "YouTube",
    webpFailed: "WebP failed to load in this Discord/Electron environment.",
    invalidUrl: "Invalid or unsupported URL.",
    noSource: "No background source configured.",
    videoError: "Video failed to load.",
    imageError: "Image failed to load.",
    recoveryFailed: "Playback recovery limit reached.",
    selectedPreview: "Testing the current source without saving it.",
    applied: "Settings applied.",
    resetDone: "Settings reset to defaults.",
    liveChanges: "Appearance sliders update immediately; Apply saves the source.",
    onboardingTitle: "First setup",
    onboardingHint: "First, enter a media URL, use Test, then Apply. If a theme hides the video, add only the required CSS to BetterDiscord Custom CSS. No external download is required.",
    dismissOnboarding: "Later",
    title: "BgVideo",
    subtitle: "Lightweight background media",
  },
  ja: {
    source: "ソース",
    mediaUrl: "メディアURL / YouTube URL",
    mediaUrlHint: "HTTP(S)のメディアURL。YouTubeの共有・再生・Shorts・Live・プレイリストに対応します。",
    appearance: "表示",
    appearanceHint: "メディアを再読み込みせず、見やすさを調整します。",
    playback: "再生",
    playbackHint: "直接動画とYouTubeの両方に適用されます。",
    behavior: "動作",
    behaviorHint: "視差効果、表示状態、再生復旧を設定します。",
    diagnostics: "診断",
    diagnosticsHint: "トラブルシューティングと安全な初期化を行います。",
    opacity: "不透明度",
    opacityHint: "0.00は透明、1.00は完全表示です。",
    blur: "ぼかし",
    blurHint: "値が大きいほどGPU負荷が増えます。",
    brightness: "明るさ",
    brightnessHint: "1.00が元の明るさです。",
    saturate: "彩度",
    saturateHint: "1.00が元の彩度です。",
    autoplay: "自動再生",
    loop: "ループ",
    muted: "ミュート",
    apply: "適用",
    test: "テスト",
    reset: "初期設定に戻す",
    debug: "デバッグ",
    reducedMotion: "視差効果を減らす",
    reducedMotionHint: "OSのprefers-reduced-motion設定を尊重します。",
    pauseVideo: "動画を停止 / アニメーションを非表示",
    hideMedia: "背景メディアをすべて非表示",
    ignoreMotion: "視差効果の設定を無視",
    autoRecover: "再生停止時に自動復旧",
    autoRecoverHint: "直接動画の停止時に再生を再試行します。",
    stallThreshold: "停止判定までの秒数",
    stallThresholdHint: "停止した直接動画を再試行するまでの待機時間です。",
    pauseWhenHidden: "Discord非表示時に停止",
    pauseWhenHiddenHint: "Discordが見えない間のCPU・GPU使用量を抑えます。",
    status: "状態",
    statusIdle: "待機中",
    statusLoading: "読み込み中",
    statusReady: "再生準備完了",
    statusError: "エラー",
    statusPreview: "プレビュー",
    video: "動画",
    image: "画像",
    youtubeMedia: "YouTube",
    webpFailed: "このDiscord/Electron環境ではWebPを読み込めません。",
    invalidUrl: "URLが無効か、未対応の形式です。",
    noSource: "背景ソースが設定されていません。",
    videoError: "動画の読み込みに失敗しました。",
    imageError: "画像の読み込みに失敗しました。",
    recoveryFailed: "再生復旧の上限に達しました。",
    selectedPreview: "保存せずに現在のソースをテストしています。",
    applied: "設定を適用しました。",
    resetDone: "設定を初期化しました。",
    liveChanges: "表示スライダーは即時反映され、ソースは適用時に保存されます。",
    onboardingTitle: "初回設定",
    onboardingHint: "最初にメディアURLを入力し、テスト後に適用してください。テーマが動画を隠す場合だけ、BetterDiscordのCustom CSSに必要なCSSを追加します。外部ダウンロードは不要です。",
    dismissOnboarding: "あとで",
    title: "BgVideo",
    subtitle: "軽量な背景メディア",
  }
};

module.exports = class BgVideo {
  constructor() {
    this.PLUGIN_NAME = "BgVideo";
    this.PANEL_STYLE_ID = this.PLUGIN_NAME + "-panel";

    this.defaults = {
      mediaUrl: "",
      objectFit: "cover",
      objectPosition: "center",
      opacity: 0.3,
      blur: 1.2,
      saturate: 1.08,
      brightness: 0.88,
      youtubeAutoplay: true,
      youtubeMuted: true,
      youtubeLoop: true,
      reducedMotionBehavior: "pauseVideo",
      autoRecoverPlayback: true,
      stallThresholdSeconds: 5,
      pauseWhenHidden: true,
      onboardingDismissed: false,
      debug: false,
    };

    this.settings = this.loadSettings();

    this._mediaNode = null;
    this._mediaSource = null;
    this._renderSettings = null;
    this._renderRequestId = 0;
    this._cssText = "";
    this._panelCssMounted = false;
    this._isWebPSupportedCache = null;
    this._webpSupportPromise = null;
    this._toastCooldowns = new Set();
    this._persistTimer = null;
    this._recoveryTimer = null;
    this._recoveryAttempts = 0;
    this._recoveryWindowStartedAt = 0;
    this._pausedForVisibility = false;
    this._motionHidden = false;
    this._visibilityHidden = false;
    this._visibilityNode = null;
    this._pausedForReducedMotion = false;
    this._status = { type: "idle", detail: "" };
    this._statusElement = null;
    this._statusDetailElement = null;
    this._started = false;
    this._motionQuery = null;
    this._onMotionChange = null;

    this._onVisibilityOrFocus = this._onVisibilityOrFocus.bind(this);
  }

  // --- I18N ---
  getLang() {
    const locale = (typeof document !== "undefined" && document.documentElement?.lang)
      || (typeof navigator !== "undefined" && navigator.language)
      || "ja";
    return String(locale).toLowerCase().startsWith("ja") ? "ja" : "en";
  }

  t(key) {
    const dict = STRINGS[this.getLang()] || STRINGS.en;
    return dict[key] || STRINGS.en[key] || key;
  }

  // --- SETTINGS ---
  loadSettings() {
    const saved = BdApi.Data.load(this.PLUGIN_NAME, "settings");
    const migrated = this.migrateSettings(saved);
    const sanitized = this.sanitizeSettings(migrated);
    BdApi.Data.save(this.PLUGIN_NAME, "settings", sanitized);
    return sanitized;
  }

  migrateSettings(saved) {
    const next = saved && typeof saved === "object" ? { ...saved } : {};

    if (next.url && !next.mediaUrl) {
      next.mediaUrl = next.url;
      delete next.url;
    }
    if (next.respectReducedMotion !== undefined && next.reducedMotionBehavior === undefined) {
      next.reducedMotionBehavior = next.respectReducedMotion ? "pauseVideo" : "ignore";
      delete next.respectReducedMotion;
    }

    // These settings belonged to the removed local-file mode. Keep migration safe without
    // reintroducing file:// access into the current dependency-free plugin.
    for (const key of ["localFilePath", "localFileMeta", "maxBlobMB"]) {
      if (Object.prototype.hasOwnProperty.call(next, key)) {
        delete next[key];
      }
    }
    return next;
  }

  sanitizeSettings(input) {
    const source = input && typeof input === "object" ? input : {};
    const result = { ...this.defaults, ...source };
    const clamp = (value, min, max, fallback) => {
      const number = Number(value);
      return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : fallback;
    };
    const boolean = (value, fallback) => typeof value === "boolean" ? value : fallback;

    result.mediaUrl = this.normalizeMediaUrl(result.mediaUrl);
    result.objectFit = ["cover", "contain", "fill"].includes(result.objectFit) ? result.objectFit : "cover";
    result.objectPosition = ["center", "top", "bottom"].includes(result.objectPosition) ? result.objectPosition : "center";
    result.opacity = clamp(result.opacity, 0, 1, this.defaults.opacity);
    result.blur = clamp(result.blur, 0, 20, this.defaults.blur);
    result.saturate = clamp(result.saturate, 0, 3, this.defaults.saturate);
    result.brightness = clamp(result.brightness, 0, 2, this.defaults.brightness);
    result.youtubeAutoplay = boolean(result.youtubeAutoplay, this.defaults.youtubeAutoplay);
    result.youtubeMuted = boolean(result.youtubeMuted, this.defaults.youtubeMuted);
    result.youtubeLoop = boolean(result.youtubeLoop, this.defaults.youtubeLoop);
    result.reducedMotionBehavior = ["pauseVideo", "hideMedia", "ignore"].includes(result.reducedMotionBehavior)
      ? result.reducedMotionBehavior
      : this.defaults.reducedMotionBehavior;
    result.autoRecoverPlayback = boolean(result.autoRecoverPlayback, this.defaults.autoRecoverPlayback);
    result.stallThresholdSeconds = clamp(result.stallThresholdSeconds, 1, 30, this.defaults.stallThresholdSeconds);
    result.pauseWhenHidden = boolean(result.pauseWhenHidden, this.defaults.pauseWhenHidden);
    delete result.sourceMode;
    delete result.forceTransparency;
    result.onboardingDismissed = boolean(result.onboardingDismissed, this.defaults.onboardingDismissed);
    result.debug = boolean(result.debug, this.defaults.debug);
    return result;
  }

  saveSettings(next) {
    if (!next || typeof next !== "object") return false;
    const candidate = this.sanitizeSettings({ ...this.settings, ...next });
    const changed = Object.keys(candidate).some((key) => candidate[key] !== this.settings[key]);
    if (!changed) return false;
    this.settings = candidate;
    this._renderSettings = null;
    BdApi.Data.save(this.PLUGIN_NAME, "settings", this.settings);
    this.applyPlaybackSettings();
    this.applyReducedMotion();
    this.applyVisibilityState();
    this.updateStatusElement();
    return true;
  }

  // --- LOGGING / STATUS ---
  log(...args) {
    if (!this.settings.debug) return;
    console.log("[" + this.PLUGIN_NAME + "]", ...args);
  }

  toast(message, type = "info") {
    if (this._toastCooldowns.has(message)) return;
    this._toastCooldowns.add(message);
    setTimeout(() => this._toastCooldowns.delete(message), 3000);
    BdApi.UI.showToast(this.PLUGIN_NAME + ": " + message, { type });
  }

  setStatus(type, detail = "") {
    this._status = { type, detail };
    this.updateStatusElement();
  }

  updateStatusElement() {
    if (!this._statusElement || !this._statusDetailElement) return;
    const type = this._status.type;
    const label = type === "loading" ? this.t("statusLoading")
      : type === "ready" ? this.t("statusReady")
        : type === "error" ? this.t("statusError")
          : type === "preview" ? this.t("statusPreview")
            : this.t("statusIdle");
    this._statusElement.textContent = label;
    this._statusElement.dataset.state = type;
    this._statusDetailElement.textContent = this._status.detail || this.t("noSource");
  }

  // --- URL / MEDIA DETECTION ---
  parseHttpUrl(input) {
    if (typeof input !== "string") return null;
    try {
      const url = new URL(input.trim());
      if (!["http:", "https:"].includes(url.protocol)) return null;
      if (url.username || url.password) return null;
      return url;
    } catch {
      return null;
    }
  }

  isYouTubeHost(hostname) {
    const host = String(hostname || "").toLowerCase().replace(/^www\./, "");
    return [
      "youtube.com",
      "m.youtube.com",
      "music.youtube.com",
      "youtu.be",
      "youtube-nocookie.com",
    ].includes(host);
  }

  normalizeMediaUrl(input) {
    return typeof input === "string" ? input.trim() : "";
  }

  normalizeYouTubeId(value) {
    return typeof value === "string" && /^[A-Za-z0-9_-]{11}$/.test(value) ? value : null;
  }

  parseYouTubeVideoId(url) {
    if (!url || !this.isYouTubeHost(url.hostname)) return null;

    let candidate = url.searchParams.get("v");
    if (!candidate && url.hostname.replace(/^www\./, "") === "youtu.be") {
      candidate = url.pathname.split("/").filter(Boolean)[0];
    }
    if (!candidate) {
      const match = url.pathname.match(/^\/(?:embed|v|shorts|live)\/([^/]+)/i);
      candidate = match ? match[1] : null;
    }
    return this.normalizeYouTubeId(candidate);
  }

  parseYouTubePlaylistId(url) {
    if (!url || !this.isYouTubeHost(url.hostname)) return null;
    const playlistId = url.searchParams.get("list");
    return playlistId && /^[A-Za-z0-9_-]+$/.test(playlistId) ? playlistId : null;
  }

  getMediaExtension(url) {
    const match = url?.pathname?.match(/\.([a-z0-9]+)$/i);
    return match ? match[1].toLowerCase() : "";
  }

  resolveMediaSource(input) {
    const url = this.normalizeMediaUrl(input);
    if (!url) return null;

    const parsed = this.parseHttpUrl(url);
    if (!parsed) return null;

    const videoId = this.parseYouTubeVideoId(parsed);
    const playlistId = this.parseYouTubePlaylistId(parsed);
    if (this.isYouTubeHost(parsed.hostname) && (videoId || playlistId)) {
      return { type: "youtube", url, videoId, playlistId };
    }
    const extension = this.getMediaExtension(parsed);
    const videoExtensions = ["mp4", "webm", "ogv", "ogg"];
    const imageExtensions = ["png", "jpg", "jpeg", "gif", "webp", "avif", "bmp"];
    if (videoExtensions.includes(extension)) return { type: "video", url, extension };
    if (imageExtensions.includes(extension)) return { type: "image", url, extension };
    return null;
  }

  validateMediaUrl(input) {
    return !!this.resolveMediaSource(input);
  }

  checkWebPSupport() {
    if (this._isWebPSupportedCache !== null) return Promise.resolve(this._isWebPSupportedCache);
    if (this._webpSupportPromise) return this._webpSupportPromise;
    this._webpSupportPromise = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this._isWebPSupportedCache = img.width > 0 && img.height > 0;
        this._webpSupportPromise = null;
        resolve(this._isWebPSupportedCache);
      };
      img.onerror = () => {
        this._isWebPSupportedCache = false;
        this._webpSupportPromise = null;
        resolve(false);
      };
      img.src = "data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==";
    });
    return this._webpSupportPromise;
  }

  // --- REDUCED MOTION / VISIBILITY ---
  attachReducedMotionHandler() {
    if (this._motionQuery || typeof window.matchMedia !== "function") return;
    try {
      this._motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      this._onMotionChange = () => this.applyReducedMotion();
      if (this._motionQuery.addEventListener) {
        this._motionQuery.addEventListener("change", this._onMotionChange);
      } else if (this._motionQuery.addListener) {
        this._motionQuery.addListener(this._onMotionChange);
      }
    } catch (error) {
      this.log("Reduced motion listener failed", error);
    }
  }

  detachReducedMotionHandler() {
    if (!this._motionQuery || !this._onMotionChange) return;
    try {
      if (this._motionQuery.removeEventListener) {
        this._motionQuery.removeEventListener("change", this._onMotionChange);
      } else if (this._motionQuery.removeListener) {
        this._motionQuery.removeListener(this._onMotionChange);
      }
    } catch (error) {
      this.log("Reduced motion listener cleanup failed", error);
    }
    this._motionQuery = null;
    this._onMotionChange = null;
  }

  shouldReduceMotion() {
    if (this.settings.reducedMotionBehavior === "ignore") return false;
    return !!this._motionQuery?.matches;
  }

  syncNodeVisibility() {
    if (!this._mediaNode) return;
    this._mediaNode.style.display = this._motionHidden ? "none" : "";
  }

  applyReducedMotion() {
    const node = this._mediaNode;
    if (!node) return;

    const reduced = this.shouldReduceMotion();
    const behavior = this.settings.reducedMotionBehavior;
    this._motionHidden = false;

    if (reduced && behavior !== "ignore") {
      if (behavior === "hideMedia" || node.tagName !== "VIDEO") {
        this._motionHidden = true;
      }
      if (node.tagName === "VIDEO") {
        this._pausedForReducedMotion = !node.paused || node.autoplay;
        try { node.pause(); } catch {}
      }
    } else if (
      !reduced &&
      !this._visibilityHidden &&
      (this._pausedForReducedMotion || this._pausedForVisibility) &&
      node.tagName === "VIDEO" &&
      this.settings.youtubeAutoplay
    ) {
      this.resumeVideo(node);
    }
    this.syncNodeVisibility();
  }

  applyVisibilityState() {
    const hidden = !!document.hidden && this.settings.pauseWhenHidden;
    const node = this._mediaNode;
    const wasHidden = this._visibilityHidden;
    const nodeChanged = node !== this._visibilityNode;
    this._visibilityHidden = hidden;
    this._visibilityNode = node;
    if (node?.tagName === "VIDEO") {
      if (hidden) {
        if (nodeChanged || !wasHidden) {
          this._pausedForVisibility = !node.paused || node.autoplay;
        }
        this.clearRecoveryTimer();
        try { node.pause(); } catch {}
      } else if (
        (this._pausedForVisibility || this._pausedForReducedMotion) &&
        !this.shouldReduceMotion() &&
        this.settings.youtubeAutoplay
      ) {
        this.resumeVideo(node);
      }
    }
    this.syncNodeVisibility();
  }

  playVideo(node) {
    if (!node || node.tagName !== "VIDEO") return Promise.resolve(false);
    try {
      const result = node.play();
      if (typeof result?.then === "function") {
        return result.then(
          () => true,
          (error) => {
            this.log("Video play was blocked", error);
            return false;
          },
        );
      }
      return Promise.resolve(true);
    } catch (error) {
      this.log("Video play failed", error);
      return Promise.resolve(false);
    }
  }

  resumeVideo(node) {
    return this.playVideo(node).then((played) => {
      if (!played) {
        if (node === this._mediaNode && !this._visibilityHidden && !this.shouldReduceMotion()) {
          this.scheduleVideoRecovery(node, true);
        }
        return false;
      }
      if (node !== this._mediaNode) return false;
      if (!this._visibilityHidden && !this.shouldReduceMotion()) {
        this._pausedForVisibility = false;
        this._pausedForReducedMotion = false;
      }
      return true;
    });
  }

  // --- RENDERERS ---
  clearRecoveryTimer() {
    if (this._recoveryTimer) clearTimeout(this._recoveryTimer);
    this._recoveryTimer = null;
  }

  destroyRenderer() {
    this.clearRecoveryTimer();
    this._recoveryAttempts = 0;
    this._recoveryWindowStartedAt = 0;
    this._pausedForVisibility = false;
    this._pausedForReducedMotion = false;
    this._motionHidden = false;
    this._visibilityNode = null;
    const node = this._mediaNode;
    this._mediaNode = null;
    this._mediaSource = null;
    if (!node) return;
    if (node.tagName === "VIDEO") {
      try { node.pause(); } catch {}
      node.removeAttribute("src");
      try { node.load(); } catch {}
    }
    node.remove?.();
  }

  createMediaContainer() {
    const mount = document.body || document.documentElement;
    let wrapper = document.getElementById("bgVideo-wrapper");
    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.id = "bgVideo-wrapper";
      wrapper.setAttribute("data-bgv-owned", "true");
    }
    if (wrapper.parentElement !== mount) mount.prepend(wrapper);
    return wrapper;
  }

  async updateMediaSource(options = {}) {
    const settings = this.sanitizeSettings(options.settings || this.settings);
    const sourceUrl = settings.mediaUrl;
    const requestId = ++this._renderRequestId;

    if (!sourceUrl) {
      this.destroyRenderer();
      this._renderSettings = settings;
      this.setStatus("idle", this.t("noSource"));
      return false;
    }

    const source = this.resolveMediaSource(sourceUrl);
    if (!source) {
      this.setStatus("error", this.t("invalidUrl"));
      if (options.notify !== false) this.toast(this.t("invalidUrl"), "error");
      return false;
    }

    if (source.type === "image" && source.extension === "webp") {
      const supported = await this.checkWebPSupport();
      if (requestId !== this._renderRequestId) return false;
      if (!supported) {
        this.setStatus("error", this.t("webpFailed"));
        if (options.notify !== false) this.toast(this.t("webpFailed"), "error");
        return false;
      }
    }

    if (requestId !== this._renderRequestId) return false;
    this.destroyRenderer();
    this._renderSettings = settings;
    this.setStatus("loading", this.mediaTypeLabel(source.type));
    const wrapper = this.createMediaContainer();
    let node;

    if (source.type === "youtube") {
      node = this.createYouTubeRenderer(source, settings);
    } else if (source.type === "video") {
      node = this.createVideoRenderer(source.url, settings);
    } else {
      node = this.createImageRenderer(source.url);
    }

    this._mediaNode = node;
    this._mediaSource = source;
    wrapper.appendChild(node);
    this.applyVisualSettings(settings);
    this.applyPlaybackSettings();
    this.applyReducedMotion();
    this.applyVisibilityState();
    this._reassertNoControls();

    if (source.type === "image") {
      this.setStatus("ready", this.mediaTypeLabel(source.type));
    }
    if (options.preview) this.setStatus("preview", this.t("selectedPreview"));
    this.log("Loaded " + source.type + " source");
    return true;
  }

  mediaTypeLabel(type) {
    return type === "youtube" ? this.t("youtubeMedia") : type === "image" ? this.t("image") : this.t("video");
  }

  createVideoRenderer(src, settings) {
    const video = document.createElement("video");
    video.id = "bgVideo-media";
    video.autoplay = !!settings.youtubeAutoplay;
    video.loop = !!settings.youtubeLoop;
    video.muted = !!settings.youtubeMuted;
    video.playsInline = true;
    video.preload = "metadata";
    video.controls = false;
    video.removeAttribute("controls");
    video.disablePictureInPicture = true;
    video.setAttribute("controlsList", "nodownload nofullscreen noremoteplayback");
    video.tabIndex = -1;
    video.setAttribute("aria-hidden", "true");
    video.src = src;

    video.addEventListener("loadeddata", () => {
      this.clearRecoveryTimer();
      this.setStatus("ready", this.mediaTypeLabel("video"));
    });
    video.addEventListener("playing", () => {
      this.clearRecoveryTimer();
      this._recoveryAttempts = 0;
      this._recoveryWindowStartedAt = 0;
      this.setStatus("ready", this.mediaTypeLabel("video"));
    });
    video.addEventListener("pause", () => {
      if (
        video !== this._mediaNode ||
        !video.autoplay ||
        this._visibilityHidden ||
        this._pausedForVisibility ||
        this._pausedForReducedMotion ||
        this.shouldReduceMotion()
      ) return;
      this.scheduleVideoRecovery(video, true);
    });
    video.addEventListener("waiting", () => this.scheduleVideoRecovery(video));
    video.addEventListener("stalled", () => this.scheduleVideoRecovery(video));
    video.addEventListener("error", () => {
      this.setStatus("error", this.t("videoError"));
      this.scheduleVideoRecovery(video, true);
    });
    return video;
  }

  createImageRenderer(src) {
    const image = document.createElement("img");
    image.id = "bgVideo-media";
    image.src = src;
    image.decoding = "async";
    image.draggable = false;
    image.tabIndex = -1;
    image.setAttribute("aria-hidden", "true");
    image.addEventListener("load", () => this.setStatus("ready", this.mediaTypeLabel("image")));
    image.addEventListener("error", () => {
      this.setStatus("error", this.t("imageError"));
      this.toast(this.t("imageError"), "error");
    });
    return image;
  }

  createYouTubeRenderer(source, settings) {
    const iframe = document.createElement("iframe");
    iframe.id = "bgVideo-media";
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allow", "autoplay; encrypted-media");
    iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
    iframe.tabIndex = -1;
    iframe.setAttribute("aria-hidden", "true");
    iframe.style.pointerEvents = "none";

    const params = new URLSearchParams();
    params.set("autoplay", settings.youtubeAutoplay ? "1" : "0");
    params.set("mute", settings.youtubeMuted ? "1" : "0");
    params.set("loop", settings.youtubeLoop ? "1" : "0");
    params.set("controls", "0");
    params.set("playsinline", "1");
    params.set("rel", "0");
    params.set("iv_load_policy", "3");
    params.set("disablekb", "1");
    params.set("fs", "0");

    let path = source.playlistId ? "videoseries" : (source.videoId ? source.videoId : "videoseries");
    if (source.playlistId) {
      params.set("list", source.playlistId);
    } else if (settings.youtubeLoop && source.videoId) {
      params.set("playlist", source.videoId);
    }
    iframe.src = "https://www.youtube.com/embed/" + path + "?" + params.toString();
    iframe.addEventListener("load", () => this.setStatus("ready", this.mediaTypeLabel("youtube")));
    return iframe;
  }

  scheduleVideoRecovery(video, force = false) {
    if (
      !this.settings.autoRecoverPlayback ||
      this._visibilityHidden ||
      this.shouldReduceMotion() ||
      video !== this._mediaNode ||
      (!force && video.paused)
    ) return;
    if (this._recoveryTimer) {
      if (!force) return;
      clearTimeout(this._recoveryTimer);
    }
    this._recoveryTimer = setTimeout(() => {
      this._recoveryTimer = null;
      this.recoverVideo(video, force);
    }, this.settings.stallThresholdSeconds * 1000);
  }

  recoverVideo(video, force = false) {
    if (
      !this.settings.autoRecoverPlayback ||
      this._visibilityHidden ||
      this.shouldReduceMotion() ||
      video !== this._mediaNode ||
      (!force && video.paused)
    ) return;
    const now = Date.now();
    if (!this._recoveryWindowStartedAt || now - this._recoveryWindowStartedAt > 60000) {
      this._recoveryWindowStartedAt = now;
      this._recoveryAttempts = 0;
    }
    if (this._recoveryAttempts >= 3) {
      this.setStatus("error", this.t("recoveryFailed"));
      this.toast(this.t("recoveryFailed"), "error");
      return;
    }

    this._recoveryAttempts += 1;
    const position = Number.isFinite(video.currentTime) ? video.currentTime : 0;
    this.log("Recovering stalled video, attempt " + this._recoveryAttempts);
    if (video.autoplay && !this.shouldReduceMotion()) this._pausedForVisibility = true;
    const restore = () => {
      if (video !== this._mediaNode || this._visibilityHidden || this.shouldReduceMotion()) return;
      try { video.currentTime = position; } catch {}
      this.resumeVideo(video);
    };
    video.addEventListener("loadedmetadata", restore, { once: true });
    try { video.load(); } catch {}
  }

  applyPlaybackSettings() {
    const node = this._mediaNode;
    const settings = this._renderSettings || this.settings;
    if (!node) return;
    if (node.tagName === "VIDEO") {
      node.autoplay = !!settings.youtubeAutoplay;
      node.loop = !!settings.youtubeLoop;
      node.muted = !!settings.youtubeMuted;
      if (node.autoplay && !this.shouldReduceMotion() && !this._visibilityHidden) this.resumeVideo(node);
    } else if (node.tagName === "IFRAME" && this._mediaSource?.type === "youtube") {
      // YouTube playback parameters live in the iframe URL, so reload only when a
      // playback toggle actually changes instead of rebuilding during slider drags.
      const desired = this.createYouTubeRenderer(this._mediaSource, settings);
      if (node.src !== desired.src) node.src = desired.src;
    }
  }

  // --- STYLING ---
  buildCss(settings = this._renderSettings || this.settings) {
    const iframeCover = settings.objectFit === "cover"
      ? "width:150vw;height:150vh;left:-25vw;top:-25vh;position:absolute;"
      : "";
    return [
      "#bgVideo-wrapper{position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none!important;z-index:1!important;opacity:var(--bgv-opacity," + settings.opacity + ");filter:blur(var(--bgv-blur," + settings.blur + "px)) saturate(var(--bgv-saturate," + settings.saturate + ")) brightness(var(--bgv-brightness," + settings.brightness + "));overflow:hidden;}",
      "#bgVideo-media{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:" + settings.objectFit + ";object-position:" + settings.objectPosition + ";pointer-events:none!important;visibility:visible!important;}",
      "iframe#bgVideo-media{" + iframeCover + "}",
      "video#bgVideo-media::-webkit-media-controls,video#bgVideo-media::-webkit-media-controls-enclosure,video#bgVideo-media::-webkit-media-controls-panel,video#bgVideo-media::-webkit-media-controls-play-button,video#bgVideo-media::-webkit-media-controls-start-playback-button{display:none!important;opacity:0!important;pointer-events:none!important;-webkit-appearance:none!important;}",
      "html,body{background:transparent!important;background-image:none!important;}",
      "#app-mount{position:relative!important;z-index:2!important;background:transparent!important;background-image:none!important;}",
    ].join("");
  }

  applyVisualSettings(settings = this._renderSettings || this.settings) {
    const css = this.buildCss(settings);
    if (css !== this._cssText) {
      BdApi.DOM.removeStyle(this.PLUGIN_NAME);
      BdApi.DOM.addStyle(this.PLUGIN_NAME, css);
      this._cssText = css;
    }
    if (this._mediaNode) {
      this._mediaNode.style.objectFit = settings.objectFit;
      this._mediaNode.style.objectPosition = settings.objectPosition;
    }
    this.applyLiveVars(settings);
  }

  applyLiveVars(settings = this.settings) {
    const wrapper = document.getElementById("bgVideo-wrapper");
    if (!wrapper) return;
    wrapper.style.setProperty("--bgv-opacity", settings.opacity);
    wrapper.style.setProperty("--bgv-blur", settings.blur + "px");
    wrapper.style.setProperty("--bgv-saturate", settings.saturate);
    wrapper.style.setProperty("--bgv-brightness", settings.brightness);
  }

  _debouncedPersist() {
    if (this._persistTimer) clearTimeout(this._persistTimer);
    this._persistTimer = setTimeout(() => {
      this._persistTimer = null;
      BdApi.Data.save(this.PLUGIN_NAME, "settings", this.settings);
    }, 250);
  }

  flushPersist() {
    if (this._persistTimer) clearTimeout(this._persistTimer);
    this._persistTimer = null;
    BdApi.Data.save(this.PLUGIN_NAME, "settings", this.settings);
  }

  _onVisibilityOrFocus() {
    this.applyVisibilityState();
    this._reassertNoControls();
  }

  _reassertNoControls() {
    const node = this._mediaNode;
    if (!node) return;
    if (node.tagName === "VIDEO") {
      node.controls = false;
      node.removeAttribute("controls");
    }
    if (node.tagName === "IFRAME") node.style.pointerEvents = "none";
    const wrapper = document.getElementById("bgVideo-wrapper");
    if (wrapper) wrapper.style.pointerEvents = "none";
  }

  // --- LIFECYCLE ---
  start() {
    if (this._started) return;
    this._started = true;
    this.attachReducedMotionHandler();
    document.addEventListener("visibilitychange", this._onVisibilityOrFocus);
    window.addEventListener("focus", this._onVisibilityOrFocus);
    this.updateMediaSource();
  }

  stop() {
    this._started = false;
    this._renderRequestId += 1;
    document.removeEventListener("visibilitychange", this._onVisibilityOrFocus);
    window.removeEventListener("focus", this._onVisibilityOrFocus);
    this.detachReducedMotionHandler();
    this.flushPersist();
    this.destroyRenderer();
    const wrapper = document.getElementById("bgVideo-wrapper");
    if (wrapper?.getAttribute("data-bgv-owned") === "true") wrapper.remove();
    BdApi.DOM.removeStyle(this.PLUGIN_NAME);
    BdApi.DOM.removeStyle(this.PANEL_STYLE_ID);
    this._cssText = "";
    this._panelCssMounted = false;
    this._statusElement = null;
    this._statusDetailElement = null;
  }

  // --- SETTINGS UI ---
  getSettingsPanel() {
    if (!this._panelCssMounted) {
      const css = [
        ".bgv-wrap{padding:14px;color:var(--text-normal)}",
        ".bgv-card{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.10);border-radius:14px;padding:14px;box-shadow:0 10px 30px rgba(0,0,0,0.25);backdrop-filter:blur(10px);max-height:80vh;overflow-y:auto;}",
        ".bgv-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}",
        ".bgv-title{font-size:16px;font-weight:800;letter-spacing:0.2px;color:var(--header-primary)}",
        ".bgv-sub,.bgv-desc,.bgv-hint,.bgv-footnote{font-size:12px;opacity:0.7;margin-top:2px;line-height:1.4}",
        ".bgv-section{margin-top:14px}.bgv-section:first-of-type{margin-top:0}",
        ".bgv-section-title{font-size:13px;font-weight:800;letter-spacing:0.2px;opacity:0.9;margin:0 0 8px;padding:0 2px}",
        ".bgv-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.bgv-grid>.bgv-full{grid-column:1/-1}",
        ".bgv-row{padding:10px;border-radius:12px;background:rgba(0,0,0,0.18);border:1px solid rgba(255,255,255,0.08);overflow:hidden;display:flex;flex-direction:column;gap:8px}",
        ".bgv-label{font-size:12px;font-weight:700;opacity:0.9;color:var(--header-primary)}",
        ".bgv-input,.bgv-select{width:100%;box-sizing:border-box;padding:10px;border-radius:10px;border:1px solid rgba(255,255,255,0.14);background:rgba(0,0,0,0.25);color:var(--text-normal);outline:none}",
        ".bgv-input:focus,.bgv-select:focus,.bgv-num:focus{border-color:rgba(88,101,242,0.8);box-shadow:0 0 0 2px rgba(88,101,242,0.16)}",
        ".bgv-input.bgv-invalid{border-color:rgba(245,66,66,0.8);box-shadow:0 0 0 2px rgba(245,66,66,0.2)}.bgv-error{font-size:12px;color:var(--text-danger);min-height:16px}",
        ".bgv-toggle{display:flex;gap:10px;align-items:flex-start;color:var(--text-normal)}.bgv-toggle span{font-size:12px;opacity:0.9}.bgv-toggle input{transform:scale(1.05);cursor:pointer;accent-color:#5865f2}",
        ".bgv-sliderline{display:flex;align-items:center;gap:10px;min-width:0}.bgv-range{flex:1;min-width:0;accent-color:#5865f2}",
        ".bgv-num{width:70px;text-align:right;font-family:monospace;padding:8px 10px;border-radius:10px;border:1px solid rgba(255,255,255,0.14);background:rgba(0,0,0,0.25);color:var(--text-normal);outline:none}",
        ".bgv-status{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px;margin-bottom:12px;border-radius:10px;background:rgba(0,0,0,0.18);border:1px solid rgba(255,255,255,0.08)}.bgv-status-label{font-weight:800}.bgv-status-label[data-state=error]{color:var(--text-danger)}.bgv-status-label[data-state=ready]{color:var(--text-positive)}.bgv-status-detail{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-muted);font-size:12px}",
        ".bgv-onboarding{padding:12px;margin-bottom:12px;border-radius:12px;background:rgba(88,101,242,0.12);border:1px solid rgba(88,101,242,0.35)}.bgv-onboarding-title{font-weight:800;color:var(--header-primary)}.bgv-onboarding-text{font-size:12px;line-height:1.45;margin-top:4px;color:var(--text-normal)}.bgv-onboarding .bgv-btn{margin-top:10px}",
        ".bgv-btns{position:sticky;bottom:0;z-index:5;display:flex;gap:10px;flex-wrap:wrap;width:fit-content;margin-top:12px;padding:10px 12px;background:rgba(0,0,0,0.35);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.12);border-radius:12px;box-shadow:0 10px 20px rgba(0,0,0,0.35)}",
        ".bgv-btn{padding:10px 14px;border-radius:10px;border:1px solid rgba(255,255,255,0.16);background:rgba(255,255,255,0.07);color:var(--text-normal);cursor:pointer;font-weight:700}.bgv-btn:hover{background:rgba(255,255,255,0.10)}.bgv-btn.primary{background:rgba(88,101,242,0.25);border-color:rgba(88,101,242,0.45)}.bgv-btn.danger{background:rgba(245,66,66,0.2);border-color:rgba(245,66,66,0.6)}",
        "@media (max-width:900px){.bgv-grid{grid-template-columns:1fr}.bgv-grid>.bgv-full{grid-column:auto}}",
      ].join("");
      BdApi.DOM.addStyle(this.PANEL_STYLE_ID, css);
      this._panelCssMounted = true;
    }

    const wrap = document.createElement("div");
    wrap.className = "bgv-wrap";
    const card = document.createElement("div");
    card.className = "bgv-card";
    wrap.appendChild(card);

    const header = document.createElement("div");
    header.className = "bgv-head";
    const headerText = document.createElement("div");
    const title = document.createElement("div");
    title.className = "bgv-title";
    title.textContent = this.t("title");
    const subtitle = document.createElement("div");
    subtitle.className = "bgv-sub";
    subtitle.textContent = this.t("subtitle");
    headerText.appendChild(title);
    headerText.appendChild(subtitle);
    header.appendChild(headerText);
    card.appendChild(header);

    if (!this.settings.onboardingDismissed) {
      const onboarding = document.createElement("div");
      onboarding.className = "bgv-onboarding";
      const onboardingTitle = document.createElement("div");
      onboardingTitle.className = "bgv-onboarding-title";
      onboardingTitle.textContent = this.t("onboardingTitle");
      const onboardingText = document.createElement("div");
      onboardingText.className = "bgv-onboarding-text";
      onboardingText.textContent = this.t("onboardingHint");
      const onboardingActions = document.createElement("div");
      const dismiss = document.createElement("button");
      dismiss.type = "button";
      dismiss.className = "bgv-btn";
      dismiss.textContent = this.t("dismissOnboarding");
      dismiss.addEventListener("click", () => {
        this.saveSettings({ onboardingDismissed: true });
        onboarding.remove();
      });
      onboardingActions.appendChild(dismiss);
      onboarding.appendChild(onboardingTitle);
      onboarding.appendChild(onboardingText);
      onboarding.appendChild(onboardingActions);
      card.appendChild(onboarding);
    }

    const statusRow = document.createElement("div");
    statusRow.className = "bgv-status";
    const statusLabel = document.createElement("span");
    statusLabel.className = "bgv-status-label";
    const statusDetail = document.createElement("span");
    statusDetail.className = "bgv-status-detail";
    statusRow.appendChild(statusLabel);
    statusRow.appendChild(statusDetail);
    card.appendChild(statusRow);
    this._statusElement = statusLabel;
    this._statusDetailElement = statusDetail;
    this.updateStatusElement();

    const draft = { mediaUrl: this.settings.mediaUrl };

    const section = (name, hint) => {
      const block = document.createElement("section");
      block.className = "bgv-section";
      const sectionTitle = document.createElement("div");
      sectionTitle.className = "bgv-section-title";
      sectionTitle.textContent = name;
      block.appendChild(sectionTitle);
      if (hint) {
        const hintNode = document.createElement("div");
        hintNode.className = "bgv-hint";
        hintNode.textContent = hint;
        block.appendChild(hintNode);
      }
      return block;
    };
    const row = (label, description, control, full = false) => {
      const block = document.createElement("div");
      block.className = "bgv-row" + (full ? " bgv-full" : "");
      const labelNode = document.createElement("div");
      labelNode.className = "bgv-label";
      labelNode.textContent = label;
      block.appendChild(labelNode);
      if (description) {
        const descriptionNode = document.createElement("div");
        descriptionNode.className = "bgv-desc";
        descriptionNode.textContent = description;
        block.appendChild(descriptionNode);
      }
      if (control) block.appendChild(control);
      const fields = control?.matches?.("input,select")
        ? [control]
        : Array.from(control?.querySelectorAll?.("input,select") || []);
      fields.forEach((field) => field.setAttribute("aria-label", label));
      return block;
    };
    const select = (options, value, onChange) => {
      const element = document.createElement("select");
      element.className = "bgv-select";
      options.forEach((optionData) => {
        const option = document.createElement("option");
        option.value = optionData.value;
        option.textContent = optionData.label;
        option.selected = optionData.value === value;
        element.appendChild(option);
      });
      element.addEventListener("change", (event) => onChange(event.target.value));
      return element;
    };

    const sourceSection = section(this.t("source"), this.t("mediaUrlHint"));
    const mediaRow = document.createElement("div");
    mediaRow.className = "bgv-row";
    sourceSection.appendChild(mediaRow);
    card.appendChild(sourceSection);

    const renderSourceFields = () => {
      mediaRow.replaceChildren();
      const labelNode = document.createElement("div");
      labelNode.className = "bgv-label";
      labelNode.textContent = this.t("mediaUrl");
      mediaRow.appendChild(labelNode);
      const input = document.createElement("input");
      input.className = "bgv-input";
      input.type = "url";
      input.setAttribute("aria-label", this.t("mediaUrl"));
      input.spellcheck = false;
      input.value = draft.mediaUrl || "";
      const error = document.createElement("div");
      error.className = "bgv-error";
      const updateError = () => {
        const value = this.normalizeMediaUrl(input.value);
        const valid = !value || this.validateMediaUrl(value);
        input.classList.toggle("bgv-invalid", !valid);
        error.textContent = valid ? "" : this.t("invalidUrl");
      };
      input.addEventListener("input", () => {
        draft.mediaUrl = input.value.trim();
        updateError();
      });
      input.addEventListener("change", () => {
        draft.mediaUrl = input.value.trim();
        input.value = draft.mediaUrl;
        updateError();
      });
      updateError();
      mediaRow.appendChild(input);
      mediaRow.appendChild(error);
    };
    renderSourceFields();

    const appearanceSection = section(this.t("appearance"), this.t("appearanceHint"));
    const appearanceGrid = document.createElement("div");
    appearanceGrid.className = "bgv-grid";
    const makeSlider = (label, description, key, min, max, step, unit) => {
      const line = document.createElement("div");
      line.className = "bgv-sliderline";
      const range = document.createElement("input");
      range.className = "bgv-range";
      range.type = "range";
      range.min = min;
      range.max = max;
      range.step = step;
      range.value = this.settings[key];
      const number = document.createElement("input");
      number.className = "bgv-num";
      number.type = "number";
      number.min = min;
      number.max = max;
      number.step = step;
      number.value = this.settings[key];
      const sync = (value, commit) => {
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) return;
        const next = Math.max(min, Math.min(max, parsed));
        range.value = next;
        number.value = next;
        this.settings = this.sanitizeSettings({ ...this.settings, [key]: next });
        this.applyLiveVars();
        if (commit) BdApi.Data.save(this.PLUGIN_NAME, "settings", this.settings);
        else this._debouncedPersist();
      };
      range.addEventListener("input", (event) => sync(event.target.value, false));
      number.addEventListener("change", (event) => sync(event.target.value, true));
      line.appendChild(range);
      line.appendChild(number);
      if (unit) {
        const unitNode = document.createElement("span");
        unitNode.className = "bgv-desc";
        unitNode.textContent = unit;
        line.appendChild(unitNode);
      }
      return row(label, description, line);
    };
    appearanceGrid.appendChild(makeSlider(this.t("opacity"), this.t("opacityHint"), "opacity", 0, 1, 0.01, ""));
    appearanceGrid.appendChild(makeSlider(this.t("blur"), this.t("blurHint"), "blur", 0, 20, 0.1, "px"));
    appearanceGrid.appendChild(makeSlider(this.t("brightness"), this.t("brightnessHint"), "brightness", 0, 2, 0.01, ""));
    appearanceGrid.appendChild(makeSlider(this.t("saturate"), this.t("saturateHint"), "saturate", 0, 3, 0.01, ""));
    appearanceSection.appendChild(appearanceGrid);
    card.appendChild(appearanceSection);

    const playbackSection = section(this.t("playback"), this.t("playbackHint"));
    const playbackGrid = document.createElement("div");
    playbackGrid.className = "bgv-grid";
    playbackGrid.appendChild(row(this.t("autoplay"), "", this.makeToggle("", this.settings.youtubeAutoplay, (value) => {
      this.saveSettings({ youtubeAutoplay: value });
    })));
    playbackGrid.appendChild(row(this.t("loop"), "", this.makeToggle("", this.settings.youtubeLoop, (value) => {
      this.saveSettings({ youtubeLoop: value });
    })));
    playbackGrid.appendChild(row(this.t("muted"), "", this.makeToggle("", this.settings.youtubeMuted, (value) => {
      this.saveSettings({ youtubeMuted: value });
    })));
    playbackSection.appendChild(playbackGrid);
    card.appendChild(playbackSection);

    const behaviorSection = section(this.t("behavior"), this.t("behaviorHint"));
    const behaviorGrid = document.createElement("div");
    behaviorGrid.className = "bgv-grid";
    behaviorGrid.appendChild(row(this.t("reducedMotion"), this.t("reducedMotionHint"), select([
      { label: this.t("pauseVideo"), value: "pauseVideo" },
      { label: this.t("hideMedia"), value: "hideMedia" },
      { label: this.t("ignoreMotion"), value: "ignore" },
    ], this.settings.reducedMotionBehavior, (value) => {
      this.saveSettings({ reducedMotionBehavior: value });
    }), true));
    behaviorGrid.appendChild(row(this.t("autoRecover"), this.t("autoRecoverHint"), this.makeToggle("", this.settings.autoRecoverPlayback, (value) => {
      this.saveSettings({ autoRecoverPlayback: value });
    })));
    behaviorGrid.appendChild(row(this.t("pauseWhenHidden"), this.t("pauseWhenHiddenHint"), this.makeToggle("", this.settings.pauseWhenHidden, (value) => {
      this.saveSettings({ pauseWhenHidden: value });
    })));
    behaviorGrid.appendChild((() => {
      const line = document.createElement("div");
      line.className = "bgv-sliderline";
      const range = document.createElement("input");
      range.className = "bgv-range";
      range.type = "range";
      range.min = "1";
      range.max = "30";
      range.step = "1";
      range.value = this.settings.stallThresholdSeconds;
      const number = document.createElement("input");
      number.className = "bgv-num";
      number.type = "number";
      number.min = "1";
      number.max = "30";
      number.step = "1";
      number.value = this.settings.stallThresholdSeconds;
      const sync = (value) => {
        const next = Math.max(1, Math.min(30, Number(value) || this.defaults.stallThresholdSeconds));
        range.value = next;
        number.value = next;
        this.saveSettings({ stallThresholdSeconds: next });
      };
      range.addEventListener("input", (event) => sync(event.target.value));
      number.addEventListener("change", (event) => sync(event.target.value));
      line.appendChild(range);
      line.appendChild(number);
      line.appendChild(Object.assign(document.createElement("span"), { className: "bgv-desc", textContent: "sec" }));
      return row(this.t("stallThreshold"), this.t("stallThresholdHint"), line);
    })());
    behaviorSection.appendChild(behaviorGrid);
    card.appendChild(behaviorSection);

    const diagnosticsSection = section(this.t("diagnostics"), this.t("diagnosticsHint"));
    const diagnosticsGrid = document.createElement("div");
    diagnosticsGrid.className = "bgv-grid";
    diagnosticsGrid.appendChild(row(this.t("debug"), "", this.makeToggle("", this.settings.debug, (value) => this.saveSettings({ debug: value }))));
    diagnosticsSection.appendChild(diagnosticsGrid);
    card.appendChild(diagnosticsSection);

    const footnote = document.createElement("div");
    footnote.className = "bgv-footnote";
    footnote.textContent = this.t("liveChanges");
    card.appendChild(footnote);

    const buttons = document.createElement("div");
    buttons.className = "bgv-btns";
    const makeButton = (label, className, handler) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "bgv-btn" + (className ? " " + className : "");
      button.textContent = label;
      button.addEventListener("click", handler);
      return button;
    };
    const validateDraft = () => {
      const source = this.resolveMediaSource(draft.mediaUrl);
      if (!source) {
        this.toast(this.t("invalidUrl"), "error");
        return null;
      }
      return source;
    };
    buttons.appendChild(makeButton(this.t("apply"), "primary", () => {
      const source = validateDraft();
      if (!source) return;
      draft.mediaUrl = this.normalizeMediaUrl(draft.mediaUrl);
      this.saveSettings({ mediaUrl: draft.mediaUrl });
      this._renderSettings = null;
      this.updateMediaSource({ notify: true }).then((loaded) => {
        if (loaded) this.toast(this.t("applied"), "success");
      });
    }));
    buttons.appendChild(makeButton(this.t("test"), "", () => {
      if (!validateDraft()) return;
      this.updateMediaSource({
        settings: { ...this.settings, mediaUrl: draft.mediaUrl },
        preview: true,
        notify: true,
      });
    }));
    buttons.appendChild(makeButton(this.t("reset"), "danger", () => {
      this.settings = this.sanitizeSettings(this.defaults);
      BdApi.Data.save(this.PLUGIN_NAME, "settings", this.settings);
      this._renderSettings = null;
      this.updateMediaSource();
      const replacement = this.getSettingsPanel();
      wrap.replaceWith(replacement);
      this.toast(this.t("resetDone"), "success");
    }));
    wrap.appendChild(buttons);

    return wrap;
  }

  makeToggle(labelText, initial, onChange) {
    const label = document.createElement("label");
    label.className = "bgv-toggle";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = !!initial;
    checkbox.addEventListener("change", (event) => onChange(event.target.checked));
    if (labelText) {
      const text = document.createElement("span");
      text.textContent = labelText;
      label.appendChild(text);
    }
    label.insertBefore(checkbox, label.firstChild);
    return label;
  }
};
