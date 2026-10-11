const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const vm = require("node:vm");

function setup(t, options = {}) {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), "bgvideo-test-"));
  t.after(() => fs.rmSync(folder, { recursive: true, force: true }));
  const module = { exports: {} };
  let reads = 0;
  let fetches = 0;
  const bdFs = {
    ...fs,
    // BetterDiscord defaults to UTF-8, unlike Node's fs.
    readFileSync(file, encoding = "utf8") {
      reads++;
      return fs.readFileSync(file, encoding);
    },
  };
  const BdApi = {
    Data: { load() {}, save() {} },
    Plugins: { folder },
    Net: { async fetch() { fetches++; return new Response(Uint8Array.from([0, 128, 255, 2])); } },
    UI: { showToast() {} }, DOM: { removeStyle() {}, addStyle() {} },
  };
  const context = {
    module, require: (name) => name === "fs" ? bdFs : name === "path" ? options.pathModule || path : name === "electron" && options.electron ? options.electron : require(name), BdApi,
    URL, Blob, AbortController, Uint8Array, setTimeout, clearTimeout, console,
    document: { documentElement: { lang: "en" }, getElementById() { return null; } },
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../BgVideo.plugin.js"), "utf8"), context);
  const plugin = new module.exports();
  return { plugin, folder, BdApi, reads: () => reads, fetches: () => fetches };
}

test("absolute paths and file URLs resolve without allowing arbitrary schemes", (t) => {
  const { plugin, folder } = setup(t);
  const file = path.join(folder, "日本語 #1.mp4");
  assert.equal(plugin.resolveMediaSource(file)?.path, file);
  assert.equal(plugin.resolveMediaSource(require("node:url").pathToFileURL(file).href)?.path, file);
  assert.equal(plugin.resolveMediaSource(path.join(folder, "photo.png"))?.type, "image");
  for (const value of ["relative.mp4", "file://other-host/video.mp4", "file:///a.mp4?x=1", "javascript:a.mp4", "https://user:password@example.com/a.mp4", "file:///a.txt", "file:///a.constructor", "https://example.com/a.constructor"]) {
    assert.equal(plugin.resolveMediaSource(value), null, value);
  }
  assert.equal(plugin.resolveMediaSource("https://youtu.be/abcdefghijk")?.type, "youtube");
});

test("Windows drive paths and encoded file URLs resolve on Windows", (t) => {
  const { plugin } = setup(t, { pathModule: path.win32 });
  assert.equal(plugin.resolveMediaSource("C:\\Videos\\背景 #1.mp4")?.path, "C:\\Videos\\背景 #1.mp4");
  assert.equal(plugin.resolveMediaSource("file:///C:/Videos/%E8%83%8C%E6%99%AF%20%231.mp4")?.path, "C:\\Videos\\背景 #1.mp4");
  assert.equal(plugin.resolveMediaSource("C:relative.mp4"), null);
});

test("file selection changes only the draft; cancelling keeps the selected source", (t) => {
  const { plugin, folder, BdApi } = setup(t, { electron: { webUtils: { getPathForFile: (file) => file.path } } });
  const selected = path.join(folder, "chosen.mp4");
  let draft = "";
  BdApi.React = {
    createElement: (type, props, ...children) => ({ type, props, children }),
    useState: (initial) => [initial, (value) => { draft = value; }],
    useRef: () => ({ current: null }),
  };
  BdApi.Components = { Button: { Looks: {}, Colors: {}, Sizes: {} } };
  plugin.useStatus = () => ({ type: "idle", detail: "" });
  const editor = plugin.renderSourceEditor();
  const picker = editor.children.find((child) => child.props?.type === "file");
  picker.props.onChange({ currentTarget: { files: [{ path: selected }], value: "chosen.mp4" } });
  assert.equal(draft, selected);
  assert.equal(plugin.settings.mediaUrl, "");
  picker.props.onChange({ currentTarget: { files: [], value: "" } });
  assert.equal(draft, selected);
});

test("local files preserve binary bytes and detect file changes", async (t) => {
  const { plugin, folder } = setup(t);
  const file = path.join(folder, "video.mp4");
  const bytes = Uint8Array.from([0, 128, 255, 2]);
  fs.writeFileSync(file, bytes);
  const source = plugin.resolveMediaSource(file);
  const media = await plugin.loadMedia(source, new AbortController().signal);
  assert.deepEqual(new Uint8Array(await media.blob.arrayBuffer()), bytes);
  plugin._mediaBlob = { key: media.key, url: "blob:existing" };
  assert.equal((await plugin.loadMedia(source, new AbortController().signal)).url, "blob:existing");
  fs.writeFileSync(file, Uint8Array.from([3, 4, 5, 6, 7]));
  const changed = await plugin.loadMedia(source, new AbortController().signal);
  assert.notEqual(changed.key, media.key);
  assert.deepEqual(new Uint8Array(await changed.blob.arrayBuffer()), Uint8Array.from([3, 4, 5, 6, 7]));
});

test("remote disk cache survives a new plugin instance and clear invalidates it", async (t) => {
  const { plugin, BdApi, fetches } = setup(t);
  const source = plugin.resolveMediaSource("https://example.com/video.mp4");
  const signal = new AbortController().signal;
  const media = await plugin.loadMedia(source, signal);
  assert.equal(fetches(), 1);
  const next = new plugin.constructor();
  const cached = await next.loadMedia(source, signal);
  assert.equal(fetches(), 1);
  assert.deepEqual(new Uint8Array(await cached.blob.arrayBuffer()), new Uint8Array(await media.blob.arrayBuffer()));
  next.clearMediaCache();
  await next.loadMedia(source, signal);
  assert.equal(fetches(), 2);
  next.settings.cacheMedia = false;
  assert.equal((await next.loadMedia(source, signal)).url, source.url);
  assert.equal(fetches(), 2);
  BdApi.Net.fetch = async () => { throw new Error("offline"); };
  next.settings.cacheMedia = true;
  assert.equal((await next.loadMedia(plugin.resolveMediaSource("https://example.com/other.mp4"), signal)).url, "https://example.com/other.mp4");
});

test("oversized local files fail before reading; oversized downloads use direct URLs", async (t) => {
  const { plugin, folder, BdApi, reads } = setup(t);
  const file = path.join(folder, "large.mp4");
  fs.writeFileSync(file, "");
  fs.truncateSync(file, 200 * 1024 * 1024 + 1);
  await assert.rejects(plugin.loadMedia(plugin.resolveMediaSource(file), new AbortController().signal));
  assert.equal(reads(), 0);
  BdApi.Net.fetch = async () => new Response("", { headers: { "content-length": String(200 * 1024 * 1024 + 1) } });
  const source = plugin.resolveMediaSource("https://example.com/large.mp4");
  assert.equal((await plugin.loadMedia(source, new AbortController().signal)).url, source.url);
});

test("downloads without Content-Length are bounded and the request is aborted", async (t) => {
  const { plugin, BdApi } = setup(t);
  let requestSignal;
  BdApi.Net.fetch = async (_url, options) => {
    requestSignal = options.signal;
    return new Response(new ReadableStream({
      start(controller) { controller.enqueue(new Uint8Array(200 * 1024 * 1024 + 1)); controller.close(); },
    }));
  };
  const caller = new AbortController();
  const source = plugin.resolveMediaSource("https://example.com/large.mp4");
  assert.equal((await plugin.loadMedia(source, caller.signal)).url, source.url);
  assert.equal(requestSignal.aborted, true);
  assert.equal(caller.signal.aborted, false);
  assert.equal(fs.existsSync(plugin.mediaCachePath("media.bin")), false);
});

test("changing source and stopping cancel pending loads and revoke owned Blob URLs", async (t) => {
  const { plugin } = setup(t);
  let finish;
  plugin.loadMedia = () => new Promise((resolve) => { finish = resolve; });
  const loading = plugin.updateMediaSource({ settings: { mediaUrl: "https://example.com/video.mp4" }, notify: false });
  const signal = plugin._loadController.signal;
  plugin.destroyRenderer();
  assert.equal(signal.aborted, true);
  finish({ key: "old", blob: new Blob(["old"]) });
  assert.equal(await loading, false);
  assert.equal(plugin._mediaNode, null);
  const url = URL.createObjectURL(new Blob(["test"]));
  plugin._mediaBlob = { key: "test", url };
  plugin.destroyRenderer();
  assert.equal(plugin._mediaBlob, null);
  await assert.rejects(fetch(url));
});

test("clearing during a download does not refill the cache", async (t) => {
  const { plugin, BdApi } = setup(t);
  let finish;
  BdApi.Net.fetch = () => new Promise((resolve) => { finish = resolve; });
  const loading = plugin.loadMedia(plugin.resolveMediaSource("https://example.com/a.mp4"), new AbortController().signal);
  plugin.clearMediaCache();
  finish(new Response(Uint8Array.from([1, 2, 3])));
  const result = await loading;
  assert.ok(result.blob);
  assert.equal(result.key, null);
  assert.equal(fs.existsSync(plugin.mediaCachePath("media.bin")), false);
});

test("missing and empty local files fail; interrupted disk writes fall back to network", async (t) => {
  const { plugin, folder, fetches } = setup(t);
  await assert.rejects(plugin.loadMedia(plugin.resolveMediaSource(path.join(folder, "missing.mp4")), new AbortController().signal));
  const empty = path.join(folder, "empty.mp4");
  fs.writeFileSync(empty, "");
  await assert.rejects(plugin.loadMedia(plugin.resolveMediaSource(empty), new AbortController().signal));
  fs.mkdirSync(plugin.mediaCachePath(""));
  fs.writeFileSync(plugin.mediaCachePath("source.json"), "null");
  fs.writeFileSync(plugin.mediaCachePath("media.bin"), "partial");
  const media = await plugin.loadMedia(plugin.resolveMediaSource("https://example.com/video.mp4"), new AbortController().signal);
  assert.ok(media.blob);
  assert.equal(fetches(), 1);
});

test("corrupt cached media retries direct playback once and ignores stale nodes", async (t) => {
  const { plugin } = setup(t);
  const node = { src: "blob:invalid" };
  plugin._mediaSource = plugin.resolveMediaSource("https://example.com/a.mp4");
  plugin._mediaNode = node;
  plugin._mediaBlob = { key: plugin._mediaSource.url, url: node.src };
  assert.equal(plugin.retryUncached({}), false);
  assert.equal(plugin.retryUncached(node), true);
  assert.equal(node.src, "https://example.com/a.mp4");
  assert.equal(plugin._mediaBlob, null);
  assert.equal(plugin.retryUncached(node), false);
});
