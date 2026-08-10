# BgVideo

BetterDiscord plugin for displaying remote video, images, or YouTube behind the Discord interface.

## Features

- MP4, WebM, OGV, OGG, PNG, JPG, GIF, WebP, AVIF, and BMP media
- YouTube watch, share, Shorts, Live, and playlist URLs
- Opacity, blur, saturation, and brightness controls
- Autoplay, loop, and muted playback
- Reduced-motion support: pause, hide, or ignore
- Pause while Discord is hidden
- Bounded recovery for stalled or failed direct video playback
- Lightweight single-file plugin with full cleanup on stop

## Install

1. Download [`BgVideo.plugin.js`](https://raw.githubusercontent.com/Fokiiiiiii/BgVideo/main/BgVideo.plugin.js).
2. Copy it to the BetterDiscord plugins folder.
3. Open **User Settings → BetterDiscord → Plugins**.
4. Enable **BgVideo** and open its settings.

On the first settings screen, complete the setup in this order:

1. Enter a direct media URL or a YouTube URL.
2. Click **Test** to preview it without saving.
3. Click **Apply** to save and start the background.
4. Use a BetterDiscord theme that lets you edit the app background and transparency. See the theme requirement below if the video is hidden.

Keep the filename as `BgVideo.plugin.js`.

## Settings

- **Source**: one URL field; direct media and YouTube are detected automatically
- **Appearance**: opacity, blur, saturation, and brightness
- **Playback**: autoplay, loop, and muted
- **Behavior**: reduced motion, hidden-window pause, and recovery limits
- **Diagnostics**: current media state and optional debug logging

**Test** previews a source without saving it. **Apply** validates, saves, and loads it.

## Theme requirement

BgVideo does not include or select a specific theme. To display the video behind Discord, use a BetterDiscord theme that provides controls for:

- App background image or background source
- Background opacity or shading
- Transparent app layers
- Theme Custom CSS or equivalent background variables

If the active theme keeps the app background opaque and provides no way to change it, the media can load and play while remaining invisible behind the Discord interface.

## Updates

The plugin includes BetterDiscord updater metadata. Automatic detection depends on the BetterDiscord Store being available and the plugin being accepted there. Until then, replace the file manually with the latest version from the fixed Raw URL above.

## Limitations

- URLs must use HTTP(S) and a supported media type.
- URLs containing embedded usernames or passwords are rejected; use a signed query URL instead.
- YouTube playback requires embedding to be allowed.
- Supported codecs depend on Discord's Chromium runtime and the media server's headers.
