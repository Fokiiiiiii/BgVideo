# BgVideo

A BetterDiscord plugin that plays a looping video, image, or YouTube embed behind Discord. Settings support English and Japanese, following Discord's language.

## Install

1. Download **BgVideo.plugin.js** from the [latest release](https://github.com/Fokiiiiiii/BgVideo/releases/latest).
2. Copy it to your BetterDiscord plugins folder and enable **BgVideo**.
3. Open the plugin settings, enter a URL or select a local file, then press **Apply**.

## Use

Use a direct video/image URL, a YouTube link, or a local file. Local files can also be entered as absolute paths or `file://` URLs.

- **Preview** tries the background without saving it.
- **Apply** saves the background and adds it to your recent history.
- **Recent backgrounds** lets you choose from the last 5 applied URLs/files. Select one, then press **Apply**. History survives restarts.
- Clear the source field and press **Apply** to remove the background.

## Settings

| Section | Controls |
| --- | --- |
| **Appearance** | Opacity, blur, brightness, saturation, and background transparency on/off. |
| **Playback** | Autoplay, loop, and mute. |
| **Advanced** | Reduced motion, pause while hidden, stalled-video recovery, caching, and reset. |

Transparency covers channels, DMs, threads, and sidebars. Text colors, profile decoration, inputs, cards, and dialogs are preserved.

## Cache and limits

- Caching reuses loaded media in memory and saves the latest direct download for the next launch. YouTube embeds are not cached.
- **Clear cache** keeps the current background playing and preserves your original files.
- Local files and cached downloads are limited to **200 MiB**. Larger remote media plays directly.
- Short 1080p clips and low blur reduce GPU use. Large local files temporarily use extra memory.
- Codec support depends on Discord. YouTube videos must allow embedding.
