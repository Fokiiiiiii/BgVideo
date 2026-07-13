# BgVideo

[![Latest release](https://img.shields.io/github/v/release/Fokiiiiiii/BgVideo?sort=semver)](https://github.com/Fokiiiiiii/BgVideo/releases)
[![License](https://img.shields.io/github/license/Fokiiiiiii/BgVideo)](LICENSE)

A BetterDiscord plugin that plays a looping video or image background behind the Discord UI.

BgVideo lets you replace Discord's static background with an animated video, a YouTube stream, or a static image, while keeping the interface sleek, responsive, and readable.

The plugin is a single, dependency-free BetterDiscord file. Updates are delivered through BetterDiscord's built-in update checker.

## Features

- **Multi-Source Support**:
  - Direct Remote Video URLs (`MP4`, `WebM`).
  - YouTube Videos (plays in the background using Video ID or Share Link).
  - Local Media Files (supports dragging/dropping or selecting files via file picker).
- **Format Compatibility**:
  - Supports video formats (`MP4`, `WebM`).
  - Supports image formats (`PNG`, `JPG`, `GIF`, and `WebP` with conditional transparency).
- **Local File Persistence**:
  - Supports restart-persistent playback by entering a `file:///` URL or a raw absolute local path (e.g. `/Users/...` or `C:\Users\...`) directly in the **Media URL** field. Raw paths are automatically normalized to `file:///` URIs.
  - Selecting a file via the local file picker is session-only (temporary).
- **Visual Tuning Controls**:
  - Opacity, Blur, Saturation, and Brightness adjustments.
  - Seamlessly integrates with the Discord UI under standard Discord dark/light themes.
- **Silent Auto-Localization**:
  - Automatically switches between English and Japanese based on your Discord language settings.
- **Smart Playback Lifecycle**:
  - Respects OS and browser `prefers-reduced-motion` settings.
  - Keeps playing continuously in the background to prevent YouTube player overlays/ads from pausing or showing controls when returning to Discord from another window.

## Installation

1. Download `BgVideo.plugin.js` and place it in your BetterDiscord plugins directory:
   - **Windows**: `%appdata%\BetterDiscord\plugins`
   - **macOS**: `~/Library/Application Support/BetterDiscord/plugins`
   - **Linux**: `~/.config/BetterDiscord/plugins`
2. Open Discord and navigate to **User Settings** -> **BetterDiscord** -> **Plugins**.
3. Enable **BgVideo**.
4. Open the plugin's settings to configure your background source.

### Updating

When BetterDiscord reports an update, accept it from the Plugins page. You can also download the latest `BgVideo.plugin.js` from the [releases page](https://github.com/Fokiiiiiii/BgVideo/releases) and replace the existing file. The plugin's settings are stored by BetterDiscord and are preserved across updates.

For manual installs, verify that the file is named exactly `BgVideo.plugin.js` and that there is only one copy in the plugins directory.

## Settings Configuration

The settings UI is kept compact, adhering to the classic BetterDiscord control style:

### Source Settings
- **Source Type**: Select between `Remote URL`, `Local File`, or `YouTube`.
- **Video URL / YouTube ID**: Input the link or ID of the background media.
- **Local File Picker**: Select or drag a local media file for temporary session-only playback.

### Appearance
- **Opacity**: Adjust background transparency.
- **Blur (px)**: Add a custom blur radius.
- **Saturate**: Increase or decrease color saturation.
- **Brightness**: Modify the background brightness.

### Playback & Behavior
- **Respect Reduced Motion**: Pauses the media if the OS or Discord prefers reduced motion.
- **Auto Recover Playback**: Restarts the media element if playback stalls.
- **Stall Threshold (sec)**: Time to wait before executing a playback recovery.

### Diagnostics
- **Debug Mode**: Toggle to show status logs in the browser console.

## Limitations & Troubleshooting

- **YouTube Overlay**: Best-effort YouTube iframe embedding is used. To avoid YouTube interface elements, BgVideo plays continuously and removes pointer events. Region-restricted, private, or embedding-disabled videos cannot be played.
- **Local File Autoload**: If `file:///` URLs or absolute paths fail to load on startup, verify if Discord's Content Security Policy (CSP) restricts native file protocol loading in your client. If restricted, you may need to host the media on a remote URL.

## Compatibility

- BetterDiscord on the current stable Discord desktop client.
- Chromium media support determines which video and image codecs are available.
- YouTube playback depends on the video's embed permissions and regional availability.

If a Discord update changes internal UI behavior, disable and re-enable the plugin first, then report the Discord client version and the source type that failed in an issue.
