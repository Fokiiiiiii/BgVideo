/**
 * @name BgVideo
 * @author Foki (Refactored)
 * @description Loop an MP4/WebM/Image/YouTube as a background media
 * @version 2.0.0
 * @source https://github.com/Fokiiiiiii/BgVideo
 * @updateUrl https://raw.githubusercontent.com/Fokiiiiiii/BgVideo/main/BgVideo.plugin.js
 */

module.exports = class BgVideo {
  constructor() {
    this.PLUGIN_NAME = "BgVideo";
    this.PANEL_STYLE_ID = `${this.PLUGIN_NAME}-panel`;

    this.defaults = {
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
    params.append("controls", controls ? "1" : "0");
    if (start > 0) params.append("start", Math.floor(start).toString());
    params.append("playsinline", "1");
    params.append("rel", "0");
    // modestbranding is largely deprecated but doesn't hurt
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
        this.toast("Local file must be reselected after restart.", "error");
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
        this.toast("Invalid YouTube URL.", "error");
        return;
      }
      this._mediaNode = this.createYouTubeRenderer(videoId, sourceUrl);
    } else if (mediaType === "video") {
      this._mediaNode = this.createVideoRenderer(sourceUrl);
    } else if (mediaType === "image") {
      if (sourceUrl.toLowerCase().endsWith(".webp")) {
        const supported = await this.checkWebPSupport();
        if (!supported) {
          this.toast("WebP failed to load in this Discord/Electron environment. Try PNG, JPG, GIF, MP4, or WebM.", "error");
          return;
        }
      }
      this._mediaNode = this.createImageRenderer(sourceUrl);
    } else {
      this.toast("Unsupported media type.", "error");
      return;
    }

    wrapper.appendChild(this._mediaNode);
    this.applyVisualSettings();
    this.applyReducedMotion();
  }

  createVideoRenderer(src) {
    const v = document.createElement("video");
    v.id = "bgVideo-media";
    v.autoplay = true;
    v.loop = true;
    v.muted = true;
    v.playsInline = true;
    v.controls = false;
    v.crossOrigin = "anonymous";
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
    
    const playlistId = this.parseYouTubePlaylistId(originalUrl);
    
    iframe.src = this.buildYouTubeEmbedUrl({
      videoId,
      playlistId,
      start: this.settings.youtubeStartSeconds,
      loop: this.settings.youtubeLoop,
      mute: this.settings.youtubeMuted,
      autoplay: this.settings.youtubeAutoplay,
      controls: this.settings.youtubeControls
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
        pointer-events: none;
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
      }
      /* Approximate object-fit for iframes since it isn't fully supported natively by iframes */
      iframe#bgVideo-media {
        ${s.objectFit === 'cover' ? 'width: 150vw; height: 150vh; left: -25vw; top: -25vh; position: absolute;' : ''}
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

  // --- LIFECYCLE ---

  start() {
    this.attachReducedMotionHandler();
    this.updateMediaSource();
  }

  stop() {
    this.detachReducedMotionHandler();
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
        .bgv-settings-wrap { padding: 10px; color: var(--text-normal); font-family: var(--font-primary); }
        .bgv-section { margin-bottom: 24px; padding: 16px; background: var(--background-secondary); border-radius: 8px; border: 1px solid var(--background-tertiary); }
        .bgv-section-title { font-size: 16px; font-weight: 700; margin-bottom: 4px; color: var(--header-primary); }
        .bgv-section-desc { font-size: 14px; margin-bottom: 16px; color: var(--header-secondary); }
        .bgv-row { margin-bottom: 16px; display: flex; align-items: center; justify-content: space-between; }
        .bgv-row-col { flex-direction: column; align-items: flex-start; }
        .bgv-label { font-size: 14px; font-weight: 600; color: var(--header-primary); margin-bottom: 8px; }
        .bgv-desc { font-size: 12px; color: var(--header-secondary); }
        .bgv-input { width: 100%; padding: 10px; background: var(--input-background); border: 1px solid var(--input-background); border-radius: 4px; color: var(--text-normal); margin-top: 8px; }
        .bgv-select { width: 100%; padding: 10px; background: var(--input-background); border: 1px solid var(--input-background); border-radius: 4px; color: var(--text-normal); margin-top: 8px; }
        .bgv-slider-container { display: flex; align-items: center; gap: 12px; width: 100%; margin-top: 8px; }
        .bgv-slider { flex: 1; }
        .bgv-btn { padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: 600; border: none; background: var(--brand-experiment); color: #fff; transition: opacity 0.2s; }
        .bgv-btn:hover { opacity: 0.8; }
        .bgv-btn-danger { background: var(--button-danger-background); }
        .bgv-btn-secondary { background: var(--background-primary); border: 1px solid var(--background-tertiary); color: var(--text-normal); }
        .bgv-box { padding: 12px; border-radius: 4px; margin-bottom: 16px; font-size: 14px; }
        .bgv-box-info { background: rgba(88, 101, 242, 0.1); border-left: 4px solid var(--brand-experiment); }
        .bgv-box-warn { background: rgba(250, 166, 26, 0.1); border-left: 4px solid var(--text-warning); }
        `
      );
      this._panelCssMounted = true;
    }

    const wrap = document.createElement("div");
    wrap.className = "bgv-settings-wrap";

    // --- HELPERS ---
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

    const createSelectRow = (parent, labelText, descText, options, value, onChange) => {
      const row = document.createElement("div");
      row.className = "bgv-row bgv-row-col";
      
      const lbl = document.createElement("div");
      lbl.className = "bgv-label";
      lbl.textContent = labelText;
      row.appendChild(lbl);

      if (descText) {
        const desc = document.createElement("div");
        desc.className = "bgv-desc";
        desc.textContent = descText;
        row.appendChild(desc);
      }

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
      
      const lbl = document.createElement("div");
      lbl.className = "bgv-label";
      lbl.textContent = labelText;
      row.appendChild(lbl);

      if (descText) {
        const desc = document.createElement("div");
        desc.className = "bgv-desc";
        desc.textContent = descText;
        row.appendChild(desc);
      }

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

    const createSliderRow = (parent, labelText, descText, min, max, step, value, onChange) => {
      const row = document.createElement("div");
      row.className = "bgv-row bgv-row-col";
      
      const lbl = document.createElement("div");
      lbl.className = "bgv-label";
      lbl.textContent = labelText;
      row.appendChild(lbl);

      if (descText) {
        const desc = document.createElement("div");
        desc.className = "bgv-desc";
        desc.textContent = descText;
        row.appendChild(desc);
      }

      const container = document.createElement("div");
      container.className = "bgv-slider-container";

      const slider = document.createElement("input");
      slider.className = "bgv-slider";
      slider.type = "range";
      slider.min = min;
      slider.max = max;
      slider.step = step;
      slider.value = value;

      const valDisp = document.createElement("span");
      valDisp.textContent = value;

      slider.addEventListener("input", (e) => {
        valDisp.textContent = e.target.value;
        onChange(parseFloat(e.target.value));
      });

      container.appendChild(slider);
      container.appendChild(valDisp);
      row.appendChild(container);

      parent.appendChild(row);
      return slider;
    };

    const createSwitchRow = (parent, labelText, descText, value, onChange) => {
      const row = document.createElement("div");
      row.className = "bgv-row";
      
      const textCol = document.createElement("div");
      const lbl = document.createElement("div");
      lbl.className = "bgv-label";
      lbl.style.marginBottom = "4px";
      lbl.textContent = labelText;
      textCol.appendChild(lbl);

      if (descText) {
        const desc = document.createElement("div");
        desc.className = "bgv-desc";
        desc.textContent = descText;
        textCol.appendChild(desc);
      }
      row.appendChild(textCol);

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = value;
      cb.style.transform = "scale(1.5)";
      cb.addEventListener("change", (e) => onChange(e.target.checked));
      row.appendChild(cb);

      parent.appendChild(row);
      return cb;
    };

    const createFilePickerRow = (parent, labelText, descText, onFileChange) => {
      const row = document.createElement("div");
      row.className = "bgv-row bgv-row-col";
      
      const lbl = document.createElement("div");
      lbl.className = "bgv-label";
      lbl.textContent = labelText;
      row.appendChild(lbl);

      if (descText) {
        const desc = document.createElement("div");
        desc.className = "bgv-desc";
        desc.textContent = descText;
        row.appendChild(desc);
      }

      const inp = document.createElement("input");
      inp.type = "file";
      inp.accept = "video/mp4,video/webm,image/png,image/jpeg,image/gif,image/webp,image/avif";
      inp.style.marginTop = "8px";
      
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
      wrap.innerHTML = ""; // Re-render logic

      // 1. Source
      const secSource = createSection("Source", "Select where your media comes from.");
      createSelectRow(secSource, "Source Mode", "", [
        { label: "Remote URL", value: "url" },
        { label: "Local File", value: "localFile" },
        { label: "YouTube", value: "youtube" }
      ], this.settings.sourceMode, (v) => {
        this.saveSettings({ sourceMode: v });
        updateRender();
      });

      if (this.settings.sourceMode === "url" || this.settings.sourceMode === "youtube") {
        createInputRow(secSource, "Media URL", "Link to video/image or YouTube video.", this.settings.mediaUrl, "https://...", (v) => {
          this.saveSettings({ mediaUrl: v });
        });
        
        if (this.settings.sourceMode === "youtube") {
          createWarningBox(secSource, "YouTube playback is a best-effort iframe renderer. Autoplay, loops, and embeds depend entirely on YouTube policies. Some videos cannot be embedded.");
        }
      } else if (this.settings.sourceMode === "localFile") {
        createWarningBox(secSource, "Local files are loaded directly from disk. You MUST re-select the file after restarting Discord/BetterDiscord.");
        createFilePickerRow(secSource, "Select Local Media", `Supported: mp4, webm, png, jpg, gif, webp. Max: ${this.settings.maxBlobMB}MB`, (file) => {
          if (file.size > this.settings.maxBlobMB * 1024 * 1024) {
            BdApi.UI.showToast(`File exceeds ${this.settings.maxBlobMB}MB limit`, { type: "error" });
            return;
          }
          if (this._localFileBlobUrl) {
            URL.revokeObjectURL(this._localFileBlobUrl);
          }
          this._localFileBlobUrl = URL.createObjectURL(file);
          this.saveSettings({ localFileMeta: file.name });
          BdApi.UI.showToast(`Selected ${file.name}`, { type: "success" });
          updateRender();
        });
        if (this.settings.localFileMeta) {
          createInfoBox(secSource, `Last selected: ${this.settings.localFileMeta}`);
        }
      }

      createSelectRow(secSource, "Media Type Override", "Force specific renderer if auto-detection fails.", [
        { label: "Auto Detect", value: "auto" },
        { label: "Video", value: "video" },
        { label: "Image", value: "image" },
        { label: "YouTube", value: "youtube" }
      ], this.settings.mediaType, (v) => {
        this.saveSettings({ mediaType: v });
      });

      // 2. Preview / Test
      const secTest = createSection("Apply & Test", "Apply changes immediately.");
      const btnRow = document.createElement("div");
      btnRow.style.display = "flex";
      btnRow.style.gap = "10px";
      
      const btnApply = document.createElement("button");
      btnApply.className = "bgv-btn";
      btnApply.textContent = "Apply & Reload Media";
      btnApply.onclick = () => {
        this.updateMediaSource();
      };
      
      const btnReset = document.createElement("button");
      btnReset.className = "bgv-btn bgv-btn-danger";
      btnReset.textContent = "Reset to Defaults";
      btnReset.onclick = () => {
        this.settings = { ...this.defaults };
        BdApi.Data.save(this.PLUGIN_NAME, "settings", this.settings);
        this.updateMediaSource();
        updateRender();
      };
      
      btnRow.appendChild(btnApply);
      btnRow.appendChild(btnReset);
      secTest.appendChild(btnRow);

      // 3. Appearance
      const secApp = createSection("Appearance", "Adjust visual settings.");
      createSelectRow(secApp, "Object Fit", "How the media scales.", [
        { label: "Cover", value: "cover" },
        { label: "Contain", value: "contain" },
        { label: "Fill", value: "fill" }
      ], this.settings.objectFit, (v) => { this.saveSettings({ objectFit: v }); this.applyVisualSettings(); });
      
      createSelectRow(secApp, "Object Position", "Alignment inside window.", [
        { label: "Center", value: "center" },
        { label: "Top", value: "top" },
        { label: "Bottom", value: "bottom" },
      ], this.settings.objectPosition, (v) => { this.saveSettings({ objectPosition: v }); this.applyVisualSettings(); });

      createSliderRow(secApp, "Opacity", "", 0, 1, 0.01, this.settings.opacity, (v) => { this.saveSettings({ opacity: v }); this.applyVisualSettings(); });
      createSliderRow(secApp, "Blur (px)", "", 0, 20, 0.1, this.settings.blur, (v) => { this.saveSettings({ blur: v }); this.applyVisualSettings(); });
      createSliderRow(secApp, "Saturate", "", 0, 3, 0.01, this.settings.saturate, (v) => { this.saveSettings({ saturate: v }); this.applyVisualSettings(); });
      createSliderRow(secApp, "Brightness", "", 0, 2, 0.01, this.settings.brightness, (v) => { this.saveSettings({ brightness: v }); this.applyVisualSettings(); });

      // 4. Playback (YouTube)
      if (this.settings.sourceMode === "youtube" || this.settings.mediaType === "youtube") {
        const secPlay = createSection("YouTube Playback", "Options sent to YouTube iframe.");
        createSwitchRow(secPlay, "Autoplay", "", this.settings.youtubeAutoplay, (v) => this.saveSettings({ youtubeAutoplay: v }));
        createSwitchRow(secPlay, "Muted", "Autoplay generally requires being muted.", this.settings.youtubeMuted, (v) => this.saveSettings({ youtubeMuted: v }));
        createSwitchRow(secPlay, "Loop", "Best effort loop.", this.settings.youtubeLoop, (v) => this.saveSettings({ youtubeLoop: v }));
        createSwitchRow(secPlay, "Show Controls", "", this.settings.youtubeControls, (v) => this.saveSettings({ youtubeControls: v }));
      }

      // 5. Advanced
      const secAdv = createSection("Advanced", "Reduced motion and bounds.");
      createSelectRow(secAdv, "Reduced Motion Behavior", "What to do when system prefers reduced motion.", [
        { label: "Pause Video", value: "pauseVideo" },
        { label: "Hide Animated/Media", value: "hideAnimated" },
        { label: "Disable All Media", value: "disableAllMedia" },
        { label: "Ignore", value: "ignore" }
      ], this.settings.reducedMotionBehavior, (v) => {
        this.saveSettings({ reducedMotionBehavior: v });
        this.applyReducedMotion();
      });

      // 6. Diagnostics
      const secDiag = createSection("Diagnostics", "Status reporting.");
      createInfoBox(secDiag, `Source Mode: ${this.settings.sourceMode}
Calculated Type: ${this.settings.mediaType === 'auto' ? this.guessMediaType(this.settings.mediaUrl) : this.settings.mediaType}
WebP Cached Check: ${this._isWebPSupportedCache !== null ? this._isWebPSupportedCache : 'Pending'}`);
      createSwitchRow(secDiag, "Debug Logging", "Enable console logs.", this.settings.debug, (v) => this.saveSettings({ debug: v }));
    };

    updateRender();
    return wrap;
  }
};
