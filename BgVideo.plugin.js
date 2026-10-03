/**
 * @name BgVideo
 * @author Fokiiiiiii
 * @authorLink https://github.com/Fokiiiiiii
 * @description Plays a looping video, image, or YouTube embed behind the Discord interface.
 * @version 1.1.6
 * @source https://github.com/Fokiiiiiii/BgVideo
 * @updateUrl https://raw.githubusercontent.com/Fokiiiiiii/BgVideo/main/BgVideo.plugin.js
 */

const STRINGS = {
  en: {
    mediaUrl: "Background URL",
    mediaUrlHint: "A direct link to an MP4, WebM, or image file, or a YouTube video or playlist. If your theme covers the background, make the theme's app background transparent.",
    mediaUrlPlaceholder: "https://example.com/background.mp4",
    apply: "Apply",
    preview: "Preview",
    appearance: "Appearance",
    opacity: "Opacity",
    blur: "Blur",
    blurHint: "Higher values use more GPU.",
    brightness: "Brightness",
    saturate: "Saturation",
    playback: "Playback",
    autoplay: "Autoplay",
    loop: "Loop",
    muted: "Muted",
    advanced: "Advanced",
    reducedMotion: "When reduced motion is on",
    reducedMotionHint: "Follows the system's reduce motion setting.",
    pauseVideo: "Pause video, hide animated images",
    hideMedia: "Hide the background",
    ignoreMotion: "Keep playing",
    pauseWhenHidden: "Pause while Discord is hidden",
    pauseWhenHiddenHint: "Saves CPU and GPU while the window is not visible.",
    autoRecover: "Restart stalled videos",
    autoRecoverHint: "Reloads a direct video that stops on its own, up to 3 times a minute.",
    stallThreshold: "Wait before restarting",
    stallThresholdHint: "How long a video can stall before it is reloaded.",
    debug: "Debug logging",
    debugHint: "Writes playback details to the console.",
    reset: "Reset settings",
    resetHint: "Restores every setting, including the background URL.",
    resetButton: "Reset",
    resetConfirm: "Reset every BgVideo setting, including the background URL?",
    cancel: "Cancel",
    statusIdle: "No background",
    statusLoading: "Loading",
    statusReady: "Showing",
    statusError: "Error",
    statusPreview: "Previewing, not saved",
    video: "Video",
    image: "Image",
    youtubeMedia: "YouTube",
    invalidUrl: "Unsupported URL. Use an http(s) link to a video, an image, or YouTube.",
    noSource: "Enter a URL and press Apply.",
    videoError: "The video failed to load.",
    imageError: "The image failed to load.",
    recoveryFailed: "Playback stalled too many times.",
    applied: "Background applied.",
    removed: "Background removed.",
    resetDone: "Settings reset.",
  },
  ja: {
    mediaUrl: "背景のURL",
    mediaUrlHint: "MP4・WebM・画像ファイルへの直接リンク、またはYouTubeの動画・再生リスト。テーマで背景が隠れる場合は、テーマ側でアプリの背景を透明にしてください。",
    mediaUrlPlaceholder: "https://example.com/background.mp4",
    apply: "適用",
    preview: "プレビュー",
    appearance: "見た目",
    opacity: "不透明度",
    blur: "ぼかし",
    blurHint: "大きいほどGPUの負荷が増えます。",
    brightness: "明るさ",
    saturate: "彩度",
    playback: "再生",
    autoplay: "自動再生",
    loop: "ループ",
    muted: "ミュート",
    advanced: "詳細",
    reducedMotion: "「視差効果を減らす」がオンのとき",
    reducedMotionHint: "OSの「視差効果を減らす」設定に従います。",
    pauseVideo: "動画を止め、動く画像は隠す",
    hideMedia: "背景を隠す",
    ignoreMotion: "そのまま再生",
    pauseWhenHidden: "Discordが見えていないときは止める",
    pauseWhenHiddenHint: "ウィンドウが見えていない間のCPU・GPU使用を抑えます。",
    autoRecover: "止まった動画を再開する",
    autoRecoverHint: "勝手に止まった動画を読み込み直します（1分に3回まで）。",
    stallThreshold: "再開までの待ち時間",
    stallThresholdHint: "動画が止まってから読み込み直すまでの秒数です。",
    debug: "デバッグログ",
    debugHint: "再生の詳細をコンソールに出力します。",
    reset: "設定をリセット",
    resetHint: "背景のURLを含むすべての設定を初期状態に戻します。",
    resetButton: "リセット",
    resetConfirm: "背景のURLを含むすべての設定を初期状態に戻しますか？",
    cancel: "キャンセル",
    statusIdle: "背景なし",
    statusLoading: "読み込み中",
    statusReady: "表示中",
    statusError: "エラー",
    statusPreview: "プレビュー中（未保存）",
    video: "動画",
    image: "画像",
    youtubeMedia: "YouTube",
    invalidUrl: "対応していないURLです。動画・画像・YouTubeのhttp(s)リンクを入力してください。",
    noSource: "URLを入力して「適用」を押してください。",
    videoError: "動画を読み込めませんでした。",
    imageError: "画像を読み込めませんでした。",
    recoveryFailed: "再生が何度も止まったため、再開をやめました。",
    applied: "背景を適用しました。",
    removed: "背景を外しました。",
    resetDone: "設定をリセットしました。",
  },
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
      debug: false,
    };

    this.settings = this.loadSettings();

    this._mediaNode = null;
    this._mediaSource = null;
    this._renderSettings = null;
    this._cssText = "";
    this._panelCssMounted = false;
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
    this._statusListeners = new Set();
    this._started = false;
    this._motionQuery = null;
    this._onMotionChange = null;

    this._onVisibilityOrFocus = this._onVisibilityOrFocus.bind(this);
    this.SourceEditor = () => this.renderSourceEditor();
  }

  getLang() {
    const locale = (typeof document !== "undefined" && document.documentElement?.lang)
      || (typeof navigator !== "undefined" && navigator.language)
      || "en";
    return String(locale).toLowerCase().startsWith("ja") ? "ja" : "en";
  }

  t(key) {
    const dict = STRINGS[this.getLang()] || STRINGS.en;
    return dict[key] || STRINGS.en[key] || key;
  }

  loadSettings() {
    const saved = BdApi.Data.load(this.PLUGIN_NAME, "settings");
    const settings = this.sanitizeSettings(this.migrateSettings(saved));
    if (JSON.stringify(saved) !== JSON.stringify(settings)) {
      BdApi.Data.save(this.PLUGIN_NAME, "settings", settings);
    }
    return settings;
  }

  migrateSettings(saved) {
    const next = saved && typeof saved === "object" ? { ...saved } : {};
    if (next.url && !next.mediaUrl) next.mediaUrl = next.url;
    if (next.respectReducedMotion !== undefined && next.reducedMotionBehavior === undefined) {
      next.reducedMotionBehavior = next.respectReducedMotion ? "pauseVideo" : "ignore";
    }
    return next;
  }

  sanitizeSettings(input) {
    const source = input && typeof input === "object" ? input : {};
    const defaults = this.defaults;
    const value = (key) => (Object.prototype.hasOwnProperty.call(source, key) ? source[key] : defaults[key]);
    const clamp = (key, min, max) => {
      const number = Number(value(key));
      return Number.isFinite(number) ? Math.max(min, Math.min(max, number)) : defaults[key];
    };
    const boolean = (key) => (typeof value(key) === "boolean" ? value(key) : defaults[key]);
    const oneOf = (key, allowed) => (allowed.includes(value(key)) ? value(key) : defaults[key]);

    return {
      mediaUrl: this.normalizeMediaUrl(value("mediaUrl")),
      objectFit: oneOf("objectFit", ["cover", "contain", "fill"]),
      objectPosition: oneOf("objectPosition", ["center", "top", "bottom"]),
      opacity: clamp("opacity", 0, 1),
      blur: clamp("blur", 0, 20),
      saturate: clamp("saturate", 0, 3),
      brightness: clamp("brightness", 0, 2),
      youtubeAutoplay: boolean("youtubeAutoplay"),
      youtubeMuted: boolean("youtubeMuted"),
      youtubeLoop: boolean("youtubeLoop"),
      reducedMotionBehavior: oneOf("reducedMotionBehavior", ["pauseVideo", "hideMedia", "ignore"]),
      autoRecoverPlayback: boolean("autoRecoverPlayback"),
      stallThresholdSeconds: clamp("stallThresholdSeconds", 1, 30),
      pauseWhenHidden: boolean("pauseWhenHidden"),
      debug: boolean("debug"),
    };
  }

  saveSettings(next) {
    if (!next || typeof next !== "object") return false;
    const candidate = this.sanitizeSettings({ ...this.settings, ...next });
    const changed = Object.keys(candidate).some((key) => candidate[key] !== this.settings[key]);
    if (!changed) return false;
    this.settings = candidate;
    this._renderSettings = null;
    this.persistSettings();
    this.applyPlaybackSettings();
    this.applyReducedMotion();
    this.applyVisibilityState();
    return true;
  }

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
    for (const listener of Array.from(this._statusListeners)) listener();
  }

  statusText(status) {
    const labels = { idle: "statusIdle", loading: "statusLoading", ready: "statusReady", error: "statusError", preview: "statusPreview" };
    const label = this.t(labels[status.type] || "statusIdle");
    return status.detail ? label + " · " + status.detail : label;
  }

  useStatus() {
    const React = BdApi.React;
    const [status, setStatusState] = React.useState(this._status);
    React.useEffect(() => {
      const listener = () => setStatusState(this._status);
      this._statusListeners.add(listener);
      listener();
      return () => {
        this._statusListeners.delete(listener);
      };
    }, []);
    return status;
  }

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
    if (videoExtensions.includes(extension)) return { type: "video", url };
    if (imageExtensions.includes(extension)) return { type: "image", url };
    return null;
  }

  validateMediaUrl(input) {
    return !!this.resolveMediaSource(input);
  }

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

  updateMediaSource(options = {}) {
    const settings = this.sanitizeSettings(options.settings || this.settings);
    const sourceUrl = settings.mediaUrl;

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
    if (options.preview) this.setStatus("preview", this.mediaTypeLabel(source.type));
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
    video.disableRemotePlayback = true;
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
      const desired = this.createYouTubeRenderer(this._mediaSource, settings);
      if (node.src !== desired.src) node.src = desired.src;
    }
  }

  buildCss(settings = this._renderSettings || this.settings) {
    const iframeCover = settings.objectFit === "cover"
      ? "inset:auto;left:50%;top:50%;width:max(100vw,177.78vh);height:max(100vh,56.25vw);transform:translate(-50%,-50%);"
      : "";
    return [
      "#bgVideo-wrapper{position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none!important;z-index:0!important;overflow:hidden;}",
      "#bgVideo-media{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:" + settings.objectFit + ";object-position:" + settings.objectPosition + ";pointer-events:none!important;visibility:visible!important;}",
      "iframe#bgVideo-media{" + iframeCover + "}",
      "video#bgVideo-media::-webkit-media-controls,video#bgVideo-media::-webkit-media-controls-enclosure,video#bgVideo-media::-webkit-media-controls-panel,video#bgVideo-media::-webkit-media-controls-play-button,video#bgVideo-media::-webkit-media-controls-start-playback-button{display:none!important;opacity:0!important;pointer-events:none!important;-webkit-appearance:none!important;}",
      "html,body{background:transparent!important;background-image:none!important;}",
      "#app-mount{position:relative!important;z-index:1!important;background:transparent!important;background-image:none!important;--background-image:none!important;--background-shading:transparent!important;--hsl-background-shading:transparent!important;--background-shading-percent:0%!important;}",
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
    this.applyFilters(settings);
  }

  buildFilter(settings) {
    const parts = [];
    if (settings.blur > 0) parts.push("blur(" + settings.blur + "px)");
    if (settings.saturate !== 1) parts.push("saturate(" + settings.saturate + ")");
    if (settings.brightness !== 1) parts.push("brightness(" + settings.brightness + ")");
    return parts.length ? parts.join(" ") : "none";
  }

  applyFilters(settings = this.settings) {
    const wrapper = document.getElementById("bgVideo-wrapper");
    if (!wrapper) return;
    wrapper.style.opacity = String(settings.opacity);
    wrapper.style.filter = this.buildFilter(settings);
  }

  _debouncedPersist() {
    if (this._persistTimer) clearTimeout(this._persistTimer);
    this._persistTimer = setTimeout(() => {
      this._persistTimer = null;
      BdApi.Data.save(this.PLUGIN_NAME, "settings", this.settings);
    }, 250);
  }

  persistSettings() {
    if (this._persistTimer) clearTimeout(this._persistTimer);
    this._persistTimer = null;
    BdApi.Data.save(this.PLUGIN_NAME, "settings", this.settings);
  }

  flushPersist() {
    if (this._persistTimer) this.persistSettings();
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
    this._statusListeners.clear();
  }

  getSettingsPanel() {
    if (!this._panelCssMounted) {
      BdApi.DOM.addStyle(this.PANEL_STYLE_ID, [
        ".bgv-source{display:flex;flex-direction:column;gap:8px;margin-top:8px}",
        ".bgv-source-row{display:flex;align-items:center;gap:8px}",
        ".bgv-btn{width:auto!important;min-width:60px!important;padding:0 14px!important;flex-shrink:0}",
        ".bgv-status{flex:1;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:13px;color:var(--text-muted)}",
        ".bgv-status::before{content:\"\";display:inline-block;width:8px;height:8px;margin-right:6px;border-radius:50%;vertical-align:middle;background:var(--text-muted)}",
        ".bgv-status[data-state=ready]::before{background:var(--status-positive,#23a55a)}",
        ".bgv-status[data-state=loading]::before{background:var(--status-warning,#f0b232)}",
        ".bgv-status[data-state=preview]::before{background:var(--brand-500,#5865f2)}",
        ".bgv-status[data-state=error]{color:var(--text-danger,#f23f43)}",
        ".bgv-status[data-state=error]::before{background:var(--status-danger,#f23f43)}",
      ].join(""));
      this._panelCssMounted = true;
    }

    const React = BdApi.React;
    const Panel = () => {
      const [revision, setRevision] = React.useState(0);
      return React.createElement(React.Fragment, { key: revision }, this.buildSettingsPanel(() => setRevision((value) => value + 1)));
    };
    return React.createElement(Panel);
  }

  buildSettingsPanel(remount) {
    const { Button } = BdApi.Components;
    const settings = this.settings;
    const t = (key) => this.t(key);
    const percent = (key) => Math.round(settings[key] * 100);
    const slider = (id, value, min, max, step, units, markers, note) => ({
      type: "slider", id, name: t(id), value, min, max, step, units, markers, ...(note ? { note: t(note) } : {}),
    });
    const toggle = (id, name, note) => ({ type: "switch", id, name: t(name), value: settings[id], ...(note ? { note: t(note) } : {}) });

    return BdApi.UI.buildSettingsPanel({
      settings: [
        { type: "custom", id: "mediaUrl", name: t("mediaUrl"), note: t("mediaUrlHint"), inline: false, children: BdApi.React.createElement(this.SourceEditor) },
        {
          type: "category", id: "appearance", name: t("appearance"), collapsible: false, settings: [
            slider("opacity", percent("opacity"), 0, 100, 1, "%", [0, 25, 50, 75, 100]),
            slider("blur", settings.blur, 0, 20, 0.1, "px", [0, 5, 10, 15, 20], "blurHint"),
            slider("brightness", percent("brightness"), 0, 200, 1, "%", [0, 50, 100, 150, 200]),
            slider("saturate", percent("saturate"), 0, 300, 1, "%", [0, 100, 200, 300]),
          ],
        },
        {
          type: "category", id: "playback", name: t("playback"), collapsible: false, settings: [
            toggle("youtubeAutoplay", "autoplay"),
            toggle("youtubeLoop", "loop"),
            toggle("youtubeMuted", "muted"),
          ],
        },
        {
          type: "category", id: "advanced", name: t("advanced"), collapsible: true, shown: false, settings: [
            {
              type: "dropdown",
              id: "reducedMotionBehavior",
              name: t("reducedMotion"),
              note: t("reducedMotionHint"),
              value: settings.reducedMotionBehavior,
              options: [
                { label: t("pauseVideo"), value: "pauseVideo" },
                { label: t("hideMedia"), value: "hideMedia" },
                { label: t("ignoreMotion"), value: "ignore" },
              ],
            },
            toggle("pauseWhenHidden", "pauseWhenHidden", "pauseWhenHiddenHint"),
            toggle("autoRecoverPlayback", "autoRecover", "autoRecoverHint"),
            { ...slider("stallThresholdSeconds", settings.stallThresholdSeconds, 1, 30, 1, "s", [1, 10, 20, 30], "stallThresholdHint"), name: t("stallThreshold") },
            toggle("debug", "debug", "debugHint"),
            {
              type: "button",
              id: "reset",
              name: t("reset"),
              note: t("resetHint"),
              className: "bgv-btn",
              children: t("resetButton"),
              color: Button.Colors.RED,
              size: Button.Sizes.SMALL,
              grow: false,
              onClick: () => this.confirmReset(remount),
            },
          ],
        },
      ],
      onChange: (category, id, value) => this.onSettingChange(id, value),
    });
  }

  onSettingChange(id, value) {
    if (id === "opacity" || id === "brightness" || id === "saturate") this.setLiveSetting(id, value / 100, true);
    else if (id === "blur") this.setLiveSetting(id, value, true);
    else if (id === "stallThresholdSeconds") this.setLiveSetting(id, value, false);
    else if (Object.prototype.hasOwnProperty.call(this.defaults, id)) this.saveSettings({ [id]: value });
  }

  setLiveSetting(key, value, visual) {
    this.settings = this.sanitizeSettings({ ...this.settings, [key]: value });
    if (visual) this.applyFilters();
    this._debouncedPersist();
  }

  renderSourceEditor() {
    const React = BdApi.React;
    const h = React.createElement;
    const { TextInput, Button } = BdApi.Components;
    const [draft, setDraft] = React.useState(this.settings.mediaUrl);
    const status = this.useStatus();
    const url = this.normalizeMediaUrl(draft);
    const source = url ? this.resolveMediaSource(url) : null;
    const invalid = !!url && !source;

    const apply = () => {
      if (invalid) {
        this.toast(this.t("invalidUrl"), "error");
        return;
      }
      this.saveSettings({ mediaUrl: url });
      this._renderSettings = null;
      if (this.updateMediaSource({ notify: true })) this.toast(this.t("applied"), "success");
      else if (!url) this.toast(this.t("removed"), "success");
    };
    const preview = () => {
      if (source) this.updateMediaSource({ settings: { ...this.settings, mediaUrl: url }, preview: true, notify: true });
    };
    const text = invalid ? this.t("invalidUrl") : this.statusText(status);

    return h("div", { className: "bgv-source" },
      h(TextInput, {
        value: draft,
        onChange: setDraft,
        placeholder: this.t("mediaUrlPlaceholder"),
        onKeyDown: (event) => {
          if (event.key !== "Enter") return;
          event.preventDefault();
          event.stopPropagation();
          apply();
        },
      }),
      h("div", { className: "bgv-source-row" },
        h("div", { className: "bgv-status", "data-state": invalid ? "error" : status.type, title: text }, text),
        h(Button, {
          className: "bgv-btn",
          look: Button.Looks.OUTLINED,
          color: Button.Colors.PRIMARY,
          size: Button.Sizes.SMALL,
          grow: false,
          disabled: !source,
          onClick: preview,
        }, this.t("preview")),
        h(Button, { className: "bgv-btn", size: Button.Sizes.SMALL, grow: false, disabled: invalid, onClick: apply }, this.t("apply")),
      ),
    );
  }

  confirmReset(remount) {
    BdApi.UI.showConfirmationModal(this.t("reset"), this.t("resetConfirm"), {
      danger: true,
      confirmText: this.t("resetButton"),
      cancelText: this.t("cancel"),
      onConfirm: () => {
        this.settings = this.sanitizeSettings(this.defaults);
        this.persistSettings();
        this._renderSettings = null;
        this.updateMediaSource();
        remount();
        this.toast(this.t("resetDone"), "success");
      },
    });
  }
};
