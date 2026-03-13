/**
 * @name BgVideo
 * @author Foki
 * @description Loop an MP4 as a background video
 * @version 1.5.1
 */

module.exports = class BgVideo {
  constructor() {
    this.PLUGIN_NAME = "BgVideo";
    this.PANEL_STYLE_ID = `${this.PLUGIN_NAME}-panel`;

    this.defaults = {
      url: "https://raw.githubusercontent.com/Fokiiiiiii/disocrd-Thema/main/Grievous_Lady_2.5_.mp4",
      debug: false,
      opacity: 0.3,
      blur: 1.2,
      saturate: 1.08,
      brightness: 0.88,
      respectReducedMotion: true,
      autoRecover: true,
      stallThresholdSec: 8,
      maxBlobMB: 80,
    };

    this.settings = this.loadSettings();

    this._video = null;
    this._blobUrl = null;

    this._onVisibility = null;
    this._motionQuery = null;
    this._onMotionChange = null;

    this._healthTimer = null;
    this._lastTime = 0;
    this._lastWall = 0;
    this._stuckForMs = 0;
    this._recovering = false;
    this._saveTimer = null;

    this._stallFlag = false;
  }

  loadSettings() {
    const saved = BdApi.Data.load(this.PLUGIN_NAME, "settings");
    return { ...this.defaults, ...(saved || {}) };
  }

  saveSettings(next, opts = {}) {
    const { persist = true } = opts;
    if (!next || typeof next !== "object") return false;

    const keys = Object.keys(next);
    if (keys.length === 0) return false;

    let changed = false;
    for (const k of keys) {
      if (this.settings[k] !== next[k]) {
        changed = true;
        break;
      }
    }
    if (!changed) return false;

    this.settings = { ...this.settings, ...next };
    if (persist) {
      if (this._saveTimer) {
        clearTimeout(this._saveTimer);
        this._saveTimer = null;
      }
      BdApi.Data.save(this.PLUGIN_NAME, "settings", this.settings);
    }
    return true;
  }

  scheduleSettingsSave(delayMs = 180) {
    if (this._saveTimer) clearTimeout(this._saveTimer);
    this._saveTimer = setTimeout(() => {
      this._saveTimer = null;
      BdApi.Data.save(this.PLUGIN_NAME, "settings", this.settings);
    }, Math.max(0, Number(delayMs) || 0));
  }

  flushSettingsSave() {
    if (!this._saveTimer) return;
    clearTimeout(this._saveTimer);
    this._saveTimer = null;
    BdApi.Data.save(this.PLUGIN_NAME, "settings", this.settings);
  }

  log(...args) {
    if (!this.settings.debug) return;
    console.log(`[${this.PLUGIN_NAME}]`, ...args);
  }

  toast(msg, type = "info") {
    if (!this.settings.debug) return;
    BdApi.UI.showToast(`${this.PLUGIN_NAME}: ${msg}`, { type });
  }

  isValidUrl(u) {
    try {
      const url = new URL(u);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }

  isMp4Likely(u) {
    return /\.mp4(\?|#|$)/i.test(u);
  }

  revokeBlob() {
    if (this._blobUrl) {
      try {
        URL.revokeObjectURL(this._blobUrl);
      } catch {}
      this._blobUrl = null;
    }
  }

  shouldReduceMotion() {
    if (!this.settings.respectReducedMotion) return false;
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
        const v = this._video;
        if (!v) return;
        if (this.shouldReduceMotion()) {
          try {
            v.pause();
          } catch {}
          this.toast("reduced motion: paused", "info");
        } else {
          v.play().catch(() => {});
          this.toast("reduced motion: resumed", "info");
        }
      };

      if (typeof this._motionQuery.addEventListener === "function") {
        this._motionQuery.addEventListener("change", this._onMotionChange);
      } else if (typeof this._motionQuery.addListener === "function") {
        this._motionQuery.addListener(this._onMotionChange);
      }
    } catch (e) {
      this.log("Reduced motion handler init failed:", e);
      this._motionQuery = null;
      this._onMotionChange = null;
    }
  }

  detachReducedMotionHandler() {
    try {
      if (this._motionQuery && this._onMotionChange) {
        if (typeof this._motionQuery.removeEventListener === "function") {
          this._motionQuery.removeEventListener("change", this._onMotionChange);
        } else if (typeof this._motionQuery.removeListener === "function") {
          this._motionQuery.removeListener(this._onMotionChange);
        }
      }
    } catch {}
    this._motionQuery = null;
    this._onMotionChange = null;
  }

  startHealthMonitor() {
    if (this._healthTimer) return;

    this._lastTime = 0;
    this._lastWall = performance.now();
    this._stuckForMs = 0;

    const intervalMs = 2000;

    this._healthTimer = setInterval(() => {
      const v = this._video;
      if (!v) return;
      if (!this.settings.autoRecover) return;
      if (document.hidden) return;
      if (this.shouldReduceMotion()) return;

      const now = performance.now();
      const wallDelta = Math.max(0, now - (this._lastWall || now));
      this._lastWall = now;

      const shouldBePlaying = true;

      if (shouldBePlaying && v.paused) {
        v.play().catch(() => {});
        return;
      }

      const t = Number(v.currentTime) || 0;

      const prev = Number(this._lastTime) || 0;
      const looped = (t + 0.5) < prev;
      const advanced = looped || (t > (prev + 0.05));
      this._lastTime = t;

      const looksStuck =
        !advanced &&
        !v.paused &&
        (
          this._stallFlag ||
          v.readyState < 2 ||
          v.networkState === v.NETWORK_LOADING ||
          v.seeking === true
        );

      if (looksStuck) {
        this._stuckForMs += wallDelta;
      } else {
        this._stuckForMs = 0;
      }

      const thresholdMs = Math.max(1, Number(this.settings.stallThresholdSec) || 8) * 1000;

      if (this._stuckForMs >= thresholdMs) {
        this._stuckForMs = 0;
        this.recoverPlayback().catch(() => {});
      }
    }, intervalMs);
  }

  stopHealthMonitor() {
    if (this._healthTimer) {
      clearInterval(this._healthTimer);
      this._healthTimer = null;
    }
  }

  async recoverPlayback() {
    const v = this._video;
    if (!v || this._recovering) return;
    this._recovering = true;

    try {
      this.toast("recover: attempting", "warning");
      this.log("Recovery attempt start");

      try {
        v.load();
        await v.play();
        this.toast("recover: ok(load/play)", "success");
        this.log("Recovery ok via load/play");
        return;
      } catch (e1) {
        this.log("Recovery load/play failed:", e1);
      }

      await this.applyVideoSettings({ forceReload: true });
      this.toast("recover: ok(reapply)", "success");
      this.log("Recovery ok via reapply");
    } catch (e) {
      this.toast(`recover: failed (${String(e?.message || e)})`, "error");
      this.log("Recovery failed:", e);
    } finally {
      this._recovering = false;
    }
  }

  start() {
    BdApi.DOM.addStyle(this.PLUGIN_NAME, this.buildCss());

    const existing = document.getElementById("bgVideo");
    if (existing) {
      this._video = existing;
      this.applyVideoSettings();
      this.attachVisibilityHandler();
      this.attachReducedMotionHandler();
      this.startHealthMonitor();
      return;
    }

    const mount = document.getElementById("app-mount") || document.body;
    const v = document.createElement("video");
    this._video = v;

    v.id = "bgVideo";
    v.autoplay = true;
    v.loop = true;
    v.muted = true;
    v.playsInline = true;
    v.preload = "auto";
    v.controls = false;
    v.disablePictureInPicture = true;
    v.setAttribute("disableRemotePlayback", "true");
    v.crossOrigin = "anonymous";
    v.setAttribute("aria-hidden", "true");

    const setStall = (on) => { this._stallFlag = !!on; };

    v.addEventListener("error", () => {
      setStall(true);
      this.toast(`video error(code=${v.error?.code})`, "error");
    });

    v.addEventListener("stalled", () => {
      setStall(true);
      this.toast("stalled", "warning");
    });

    v.addEventListener("waiting", () => {
      setStall(true);
      this.toast("waiting", "warning");
    });

    v.addEventListener("canplay", () => {
      setStall(false);
      this.toast("canplay", "success");
    });

    v.addEventListener("playing", () => {
      setStall(false);
      this.toast("playing", "success");
    });

    v.addEventListener("seeked", () => {
      setStall(false);
    });

    mount.prepend(v);

    this.applyVideoSettings();
    this.attachVisibilityHandler();
    this.attachReducedMotionHandler();
    this.startHealthMonitor();
  }

  stop() {
    this.flushSettingsSave();

    if (this._onVisibility) {
      document.removeEventListener("visibilitychange", this._onVisibility);
      window.removeEventListener("focus", this._onVisibility);
      window.removeEventListener("blur", this._onVisibility);
      this._onVisibility = null;
    }

    this.detachReducedMotionHandler();
    this.stopHealthMonitor();

    BdApi.DOM.removeStyle(this.PLUGIN_NAME);
    BdApi.DOM.removeStyle(this.PANEL_STYLE_ID);

    const v = document.getElementById("bgVideo");
    if (v) {
      try {
        v.pause();
      } catch {}
      v.remove();
    }

    this._video = null;
    this._stallFlag = false;
    this.revokeBlob();
  }

  buildCss() {
    const s = this.settings;
    return `
      #bgVideo{
        position: fixed;
        inset: 0;
        width: 100vw;
        height: 100vh;
        object-fit: cover;
        pointer-events: none;
        z-index: 0;
        opacity: ${s.opacity};
        filter: blur(${s.blur}px) saturate(${s.saturate}) brightness(${s.brightness});
      }
      #app-mount{ position: relative; }
    `;
  }

  refreshCss() {
    BdApi.DOM.removeStyle(this.PLUGIN_NAME);
    BdApi.DOM.addStyle(this.PLUGIN_NAME, this.buildCss());
  }

  attachVisibilityHandler() {
    if (this._onVisibility) return;

    this._onVisibility = async () => {
      const vid = this._video;
      if (!vid) return;

      const hasFocus = typeof document.hasFocus === "function" ? document.hasFocus() : true;
      const inactive = document.hidden || !hasFocus;

      if (inactive || this.shouldReduceMotion()) {
        if (!vid.paused) vid.pause();
        return;
      }

      try {
        await vid.play();
      } catch {}

      const needsReload =
        vid.readyState < 2 ||
        vid.networkState === vid.NETWORK_NO_SOURCE ||
        (vid.videoWidth === 0 && vid.videoHeight === 0) ||
        vid.paused;

      if (needsReload) {
        await this.applyVideoSettings({ forceReload: true });
      }
    };

    document.addEventListener("visibilitychange", this._onVisibility);
    window.addEventListener("focus", this._onVisibility);
    window.addEventListener("blur", this._onVisibility);
    this._onVisibility();
  }

  async applyVideoSettings(opts = {}) {
    const v = this._video;
    if (!v) return;

    const url = this.settings.url?.trim();
    if (!url || !this.isValidUrl(url)) {
      this.toast("invalid URL", "error");
      this.log("Invalid URL:", url);
      return;
    }

    const reduce = this.shouldReduceMotion();
    const maxBlobBytes = Math.max(1, Number(this.settings.maxBlobMB) || 80) * 1024 * 1024;
    const srcAttr = String(v.getAttribute("src") || "");
    const usingBlobSrc = !!this._blobUrl && srcAttr === this._blobUrl;
    const usingDirectSrc = srcAttr === url;

    if (this._blobUrl && !usingBlobSrc) {
      this.revokeBlob();
    }

    if (!opts.forceReload && (usingDirectSrc || usingBlobSrc)) {
      this._stallFlag = false;

      if (reduce) {
        try {
          v.pause();
        } catch {}
        return;
      }

      try {
        await v.play();
      } catch {}
      return;
    }

    this.revokeBlob();

    const fallbackToBlob = async () => {
      try {
        this.toast("fallback(blob) try", "warning");
        this.log("Fallback to blob fetch:", url);

        try {
          const head = await BdApi.Net.fetch(url, { method: "HEAD", timeout: 15000 });
          if (head?.ok) {
            const len = Number(head.headers?.get?.("content-length") || 0);
            if (len && len > maxBlobBytes) {
              throw new Error(`file too large (${Math.round(len / (1024 * 1024))}MB > ${this.settings.maxBlobMB}MB)`);
            }
          }
        } catch (e) {
          this.log("HEAD size check skipped/failed:", e);
        }

        const res = await BdApi.Net.fetch(url, { timeout: 60000 });
        if (!res?.ok) throw new Error(`fetch failed: ${res?.status}`);

        const buf = await res.arrayBuffer();
        if (buf?.byteLength > maxBlobBytes) {
          throw new Error(`download too large (${Math.round(buf.byteLength / (1024 * 1024))}MB > ${this.settings.maxBlobMB}MB)`);
        }

        const ct = res.headers?.get?.("content-type") || "video/mp4";
        const blob = new Blob([buf], { type: ct });
        this._blobUrl = URL.createObjectURL(blob);

        v.src = this._blobUrl;
        v.load();

        if (!reduce) {
          await v.play();
          this.toast("playing(blob)", "success");
          this.log("Playing via blob.");
        } else {
          this.toast("loaded(blob) (reduced motion)", "info");
          this.log("Loaded via blob; paused due to reduced motion.");
          try {
            v.pause();
          } catch {}
        }
      } catch (e) {
        this.toast(`failed (${String(e?.message || e)})`, "error");
        this.log("Blob fallback failed:", e);
      }
    };

    if (opts.forceReload) {
      try {
        v.pause();
      } catch {}
      v.removeAttribute("src");
      v.load();
    }

    this._stallFlag = false;

    v.src = url;
    v.load();

    if (reduce) {
      this.toast("loaded (reduced motion)", "info");
      this.log("Loaded direct; paused due to reduced motion:", url);
      try {
        v.pause();
      } catch {}
      return;
    }

    try {
      await v.play();
      this.toast("playing", "success");
      this.log("Playing direct:", url);
    } catch (e) {
      this.log("Direct play failed, trying blob fallback:", e);
      await fallbackToBlob();
    }
  }

  getSettingsPanel() {
    BdApi.DOM.removeStyle(this.PANEL_STYLE_ID);
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
      overflow:hidden
      }
      .bgv-label{
      font-size:12px;
      font-weight:700;
      opacity:0.9;
      margin-bottom:6px;
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:10px
      }
      .bgv-label>:first-child{flex:1;min-width:0}
      .bgv-label>:last-child{flex:0 0 auto;text-align:right}
      .bgv-input{
      width:100%;
      box-sizing:border-box;
      padding:10px 10px;
      border-radius:10px;
      border:1px solid rgba(255,255,255,0.14);
      background:rgba(0,0,0,0.25);
      color:var(--text-normal);
      outline:none
      }
      .bgv-input:focus{border-color:rgba(255,255,255,0.28)}
      .bgv-urlline{display:flex;gap:10px}
      .bgv-pill{
      font-size:11px;
      padding:4px 8px;
      border-radius:999px;
      border:1px solid rgba(255,255,255,0.14);
      background:rgba(0,0,0,0.22);
      opacity:0.85;
      white-space:nowrap
      }
      .bgv-ok{border-color:rgba(66,245,141,0.35)}
      .bgv-bad{border-color:rgba(245,66,66,0.35)}
      .bgv-controls{display:flex;gap:10px;align-items:center}
      .bgv-toggle{display:flex;gap:10px;align-items:center}
      .bgv-toggle input{transform:scale(1.05)}
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
    title.textContent = "BgVideo";
    headLeft.appendChild(title);

    const sub = document.createElement("div");
    sub.className = "bgv-sub";
    sub.textContent = "Background MP4 loop";
    headLeft.appendChild(sub);

    const right = document.createElement("div");
    right.className = "bgv-controls";
    head.appendChild(right);

    const mkToggle = (labelText, initial) => {
      const box = document.createElement("label");
      box.className = "bgv-toggle";

      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = !!initial;

      const t = document.createElement("span");
      t.textContent = labelText;
      t.style.fontSize = "12px";
      t.style.opacity = "0.9";

      box.appendChild(cb);
      box.appendChild(t);
      return { box, cb };
    };

    const debugT = mkToggle("Debug", this.settings.debug);
    right.appendChild(debugT.box);

    const liveT = mkToggle("Live", true);
    right.appendChild(liveT.box);

    let cssRaf = 0;
    const scheduleCssRefresh = () => {
      if (cssRaf) return;
      cssRaf = requestAnimationFrame(() => {
        cssRaf = 0;
        this.refreshCss();
      });
    };

    const grid = document.createElement("div");
    grid.className = "bgv-grid";
    card.appendChild(grid);

    const mkRow = (labelText, rightNode = null) => {
      const row = document.createElement("div");
      row.className = "bgv-row";

      const label = document.createElement("div");
      label.className = "bgv-label";

      const l = document.createElement("span");
      l.textContent = labelText;
      l.style.flex = "1";
      l.style.minWidth = "0";
      label.appendChild(l);

      if (rightNode) label.appendChild(rightNode);

      row.appendChild(label);
      return { row, label };
    };

    const setStatusPill = (pill, ok, text) => {
      pill.classList.toggle("bgv-ok", !!ok);
      pill.classList.toggle("bgv-bad", !ok);
      pill.textContent = text;
    };

    const pill = document.createElement("div");
    pill.className = "bgv-pill";
    const urlRow = mkRow("Video URL", pill);
    grid.appendChild(urlRow.row);

    const urlLine = document.createElement("div");
    urlLine.className = "bgv-urlline";
    urlRow.row.appendChild(urlLine);

    const urlInput = document.createElement("input");
    urlInput.className = "bgv-input";
    urlInput.type = "text";
    urlInput.placeholder = "https://.../video";
    urlInput.value = this.settings.url || "";
    urlLine.appendChild(urlInput);

    const updateUrlPill = () => {
      const u = urlInput.value.trim();
      const ok = u && this.isValidUrl(u);
      const hint = u && this.isMp4Likely(u) ? "URL OK (mp4?)" : "URL OK";
      setStatusPill(pill, ok, ok ? hint : "Check URL");
    };
    updateUrlPill();
    urlInput.addEventListener("input", updateUrlPill);

    const mkSlider = (labelText, key, opts) => {
      const { min, max, step, decimals = 2 } = opts;

      const valText = document.createElement("span");
      valText.style.fontSize = "12px";
      valText.style.opacity = "0.8";

      const r = mkRow(labelText, valText);

      const line = document.createElement("div");
      line.className = "bgv-sliderline";
      r.row.appendChild(line);

      const range = document.createElement("input");
      range.className = "bgv-range";
      range.type = "range";
      range.min = String(min);
      range.max = String(max);
      range.step = String(step);

      const num = document.createElement("input");
      num.className = "bgv-num";
      num.type = "number";
      num.min = String(min);
      num.max = String(max);
      num.step = String(step);

      const start = Number(this.settings[key]);
      const safe = Number.isFinite(start) ? start : min;
      range.value = String(safe);
      num.value = String(safe);

      const fmt = (v) => Number(v).toFixed(decimals);
      const paint = () => {
        valText.textContent = fmt(range.value);
      };

      const clamp = (v) => Math.min(max, Math.max(min, Number(v)));

      const syncFromRange = () => {
        num.value = String(range.value);
        paint();
        if (liveT.cb.checked) {
          apply({ reloadVideo: false, persistImmediate: false }).catch(() => {});
        }
      };

      const syncFromNum = () => {
        const v = clamp(num.value);
        range.value = String(v);
        num.value = String(v);
        paint();
        if (liveT.cb.checked) {
          apply({ reloadVideo: false, persistImmediate: false }).catch(() => {});
        }
      };

      range.addEventListener("input", syncFromRange);
      num.addEventListener("change", syncFromNum);

      line.appendChild(range);
      line.appendChild(num);

      paint();
      return { row: r.row, range, num };
    };

    const mkCheckRow = (labelText, key) => {
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = !!this.settings[key];

      const r = mkRow(labelText);
      r.row.appendChild(cb);

      cb.addEventListener("change", () => {
        apply({
          reloadVideo: liveT.cb.checked,
          persistImmediate: true,
        }).catch(() => {});
      });

      return { row: r.row, cb };
    };

    const mkNumRow = (labelText, key, opts) => {
      const { min, max, step } = opts;
      const r = mkRow(labelText);

      const num = document.createElement("input");
      num.className = "bgv-num";
      num.type = "number";
      num.min = String(min);
      num.max = String(max);
      num.step = String(step);
      num.value = String(Number(this.settings[key]) ?? min);

      num.addEventListener("change", () => {
        const v = Math.min(max, Math.max(min, Number(num.value)));
        num.value = String(v);
        apply({
          reloadVideo: liveT.cb.checked,
          persistImmediate: true,
        }).catch(() => {});
      });

      r.row.appendChild(num);
      return { row: r.row, num };
    };

    const sOpacity = mkSlider("Opacity", "opacity", { min: 0, max: 1, step: 0.01, decimals: 2 });
    const sBlur = mkSlider("Blur (px)", "blur", { min: 0, max: 20, step: 0.1, decimals: 1 });
    const sSat = mkSlider("Saturate", "saturate", { min: 0, max: 3, step: 0.01, decimals: 2 });
    const sBri = mkSlider("Brightness", "brightness", { min: 0, max: 2, step: 0.01, decimals: 2 });

    grid.appendChild(sOpacity.row);
    grid.appendChild(sBlur.row);
    grid.appendChild(sSat.row);
    grid.appendChild(sBri.row);

    const reduceRow = mkCheckRow("Respect reduced motion", "respectReducedMotion");
    const recoverRow = mkCheckRow("Auto recover playback", "autoRecover");
    const stallRow = mkNumRow("Stall threshold (sec)", "stallThresholdSec", { min: 3, max: 60, step: 1 });
    const blobRow = mkNumRow("Max blob size (MB)", "maxBlobMB", { min: 10, max: 500, step: 5 });

    grid.appendChild(reduceRow.row);
    grid.appendChild(recoverRow.row);
    grid.appendChild(stallRow.row);
    grid.appendChild(blobRow.row);

    const foot = document.createElement("div");
    foot.className = "bgv-footnote";
    foot.textContent = "Live: changes apply immediately";
    card.appendChild(foot);

    const btns = document.createElement("div");
    btns.className = "bgv-btns";
    wrap.appendChild(btns);

    const mkBtn = (text, cls = "") => {
      const b = document.createElement("button");
      b.className = `bgv-btn ${cls}`.trim();
      b.textContent = text;
      return b;
    };

    const applyBtn = mkBtn("Apply", "primary");
    const testBtn = mkBtn("Test");
    const resetBtn = mkBtn("Reset", "danger");

    btns.appendChild(applyBtn);
    btns.appendChild(testBtn);
    btns.appendChild(resetBtn);

    const apply = async ({
      reloadVideo = true,
      forceReload = false,
      persistImmediate = true,
    } = {}) => {
      const next = {
        url: urlInput.value.trim(),
        debug: debugT.cb.checked,
        opacity: Number(sOpacity.range.value),
        blur: Number(sBlur.range.value),
        saturate: Number(sSat.range.value),
        brightness: Number(sBri.range.value),
        respectReducedMotion: !!reduceRow.cb.checked,
        autoRecover: !!recoverRow.cb.checked,
        stallThresholdSec: Number(stallRow.num.value),
        maxBlobMB: Number(blobRow.num.value),
      };

      const changed = this.saveSettings(next, { persist: persistImmediate });
      if (changed) {
        if (persistImmediate) {
          this.refreshCss();
        } else {
          scheduleCssRefresh();
          this.scheduleSettingsSave();
        }
      }

      if (reloadVideo && this._video) {
        await this.applyVideoSettings({ forceReload });
      }
    };

    applyBtn.onclick = () => {
      apply({ reloadVideo: true, persistImmediate: true }).catch(() => {});
    };

    testBtn.onclick = async () => {
      const tempUrl = urlInput.value.trim();
      if (!tempUrl || !this.isValidUrl(tempUrl)) {
        BdApi.UI.showToast("BgVideo: invalid URL", { type: "error" });
        return;
      }
      await apply({ reloadVideo: true, forceReload: true, persistImmediate: true });
    };

    resetBtn.onclick = async () => {
      this.saveSettings({ ...this.defaults });

      urlInput.value = this.settings.url || "";
      debugT.cb.checked = !!this.settings.debug;

      sOpacity.range.value = String(this.settings.opacity);
      sOpacity.num.value = String(this.settings.opacity);

      sBlur.range.value = String(this.settings.blur);
      sBlur.num.value = String(this.settings.blur);

      sSat.range.value = String(this.settings.saturate);
      sSat.num.value = String(this.settings.saturate);

      sBri.range.value = String(this.settings.brightness);
      sBri.num.value = String(this.settings.brightness);

      reduceRow.cb.checked = !!this.settings.respectReducedMotion;
      recoverRow.cb.checked = !!this.settings.autoRecover;
      stallRow.num.value = String(this.settings.stallThresholdSec);
      blobRow.num.value = String(this.settings.maxBlobMB);

      updateUrlPill();
      this.refreshCss();

      if (this._video) await this.applyVideoSettings();
      if (this.settings.debug) this.toast("reset", "info");
    };

    urlInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        apply({ reloadVideo: true, persistImmediate: true }).catch(() => {});
      }
    });

    return wrap;
  }
};
