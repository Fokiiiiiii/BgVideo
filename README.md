# BgVideo

A BetterDiscord plugin that plays a looping video or image background behind the Discord UI.

BgVideo lets you replace Discord's static background with an animated video, a YouTube stream, or a static image, while keeping the interface sleek, responsive, and readable.

## Features

- **Multi-Source Support**:
  - Direct Remote Video URLs (`MP4`, `WebM`).
  - YouTube Videos (plays in the background using Video ID or Share Link).
  - Local Media Files (supports dragging/dropping or selecting files via file picker).
- **Format Compatibility**:
  - Supports video formats (`MP4`, `WebM`).
  - Supports image formats (`PNG`, `JPG`, `GIF`, and `WebP` with conditional transparency).
- **Local File Persistence**:
  - Automatically attempts to restore local file paths across Discord restarts in desktop (Electron) environments using native file paths.
  - Automatically falls back to session-only blobs if native path access is restricted, with detailed diagnostic logging in settings.
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

## Settings Configuration

The settings UI is kept compact, adhering to the classic BetterDiscord control style:

### Source Settings
- **Source Type**: Select between `Remote URL`, `Local File`, or `YouTube`.
- **Video URL / YouTube ID**: Input the link or ID of the background media.
- **Local File Picker**: Select or drag a local media file. Includes a native file dialog button for path persistence.

### Appearance
- **Opacity**: Adjust background transparency.
- **Blur (px)**: Add a custom blur radius.
- **Saturate**: Increase or decrease color saturation.
- **Brightness**: Modify the background brightness.

### Playback & Behavior
- **Respect Reduced Motion**: Pauses the media if the OS or Discord prefers reduced motion.
- **Auto Recover Playback**: Restarts the media element if playback stalls.
- **Stall Threshold (sec)**: Time to wait before executing a playback recovery.

### Diagnostics (Debug Mode)
- **Debug Mode**: Toggle to show status logs and diagnostic warnings (e.g. details on why a local file path could or couldn't be persisted across restarts).

## Limitations & Troubleshooting

- **YouTube Overlay**: Best-effort YouTube iframe embedding is used. To avoid YouTube interface elements, BgVideo plays continuously and removes pointer events. Region-restricted, private, or embedding-disabled videos cannot be played.
- **Local File Autoload**: If the plugin cannot restore local files on startup, verify the logs in Debug Mode. Some environments restrict native file loading due to security rules (CSP). If restricted, you will need to re-select the file after restarting Discord.

