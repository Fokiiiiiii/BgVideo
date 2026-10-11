# BgVideo

BetterDiscord plugin that plays a looping video, image, or YouTube embed behind the Discord interface.

## Features

- MP4, WebM, OGV, OGG, PNG, JPG, GIF, WebP, AVIF, and BMP media
- Local videos and images, selected with **Browse** or entered as absolute paths / `file://` URLs
- Reuses the current local media in memory and caches the latest direct download on disk
- Makes Discord's main backgrounds transparent without editing your theme
- YouTube watch, share, Shorts, Live, and playlist URLs
- Opacity, blur, brightness, and saturation that update while you drag
- Autoplay, loop, and mute
- Pauses while Discord is hidden and follows the system's reduce motion setting
- Restarts a stalled direct video, up to three times a minute
- Settings in English or Japanese, following Discord's language
- Single file with no dependencies and full cleanup on stop

## Install

1. Download [`BgVideo.plugin.js`](https://raw.githubusercontent.com/Fokiiiiiii/BgVideo/main/BgVideo.plugin.js).
2. Copy it to the BetterDiscord plugins folder. Keep the file name.
3. Enable **BgVideo** in **User Settings → BetterDiscord → Plugins**.

## Setup

Open the plugin settings, paste a direct media URL, YouTube URL, or absolute file path into **Background URL or file**, and press **Apply** or Enter. **Browse** opens the system file picker; select a video or image, then press **Apply**.

- **Preview** shows the URL without saving it.
- Clear the field and press **Apply** to remove the background.
- The dot under the field shows the state: green while the background is showing, yellow while it loads, blue during a preview, and red on errors.

Local files are read as binary data and played through a Blob URL, so Chromium does not need permission to navigate to `file://`. The saved path is reused after restarting Discord. Moving or deleting the file requires selecting it again.

With **Cache media** enabled (the default), reapplying the same local file reuses its Blob if its size and modification time have not changed. Direct HTTP(S) videos and images also save the latest download in `BgVideo-cache/` inside the plugins folder and reuse it on the next launch, including while offline. The cache holds one download, up to **200 MiB**. Larger remote files and failed cache downloads fall back to direct playback. YouTube embeds are not downloaded or cached.

**Clear cache** in Advanced removes only BgVideo's cache, leaves the selected source and original local files intact, and keeps the current background playing. Clear it to refresh a remote file whose contents changed at the same URL. Disabling caching stops reuse and downloads; it does not delete the existing disk cache. Blob URLs are released on source changes and when the plugin stops.

## Settings

- **Appearance**: opacity, blur, brightness, saturation, and automatic background transparency
- **Playback**: autoplay, loop, and mute
- **Advanced** (collapsed): reduced motion, pausing while hidden, stalled-video recovery, logging, caching, clear cache, and a reset button that asks before resetting settings

## Theme requirement

BgVideo places the media behind Discord. **Make Discord's background transparent** clears the main app, channel/DM/thread headers, chat, sidebar, DM list, member-list, profile-panel, and theme-background surfaces, including ClearVision's background image and the sidebar's shading pseudo-element. It leaves theme variables, text colors, inputs, message embeds, popups, and dialogs intact and removes its CSS when stopped. Turn it off to use your theme's own transparency settings. Themes that draw backgrounds on other elements may still require theme-specific CSS.

## Performance

- Blur is the most expensive effect. Keep it at 0 for the lowest GPU use.
- Neutral values (blur 0, brightness 100%, saturation 100%) are skipped and cost nothing.
- Playback pauses while Discord is hidden unless you turn that off.
- YouTube embeds are sized to just cover the window, so YouTube does not pick a larger stream than needed.
- A 1080p video is usually enough for a background; 4K files take much more decoding work.

## Limitations

- Remote URLs must use HTTP(S) and a supported media type. URLs with embedded usernames or passwords are rejected; use a signed query URL instead. Local paths must be absolute; remote-host `file://` URLs are rejected.
- Local files must be **200 MiB or smaller**. Blob creation reads the whole file and temporarily uses more memory than its file size; short 1080p clips are recommended.
- YouTube playback requires the video to allow embedding.
- Supported codecs depend on Discord's Chromium runtime and the media server's headers.

## Development checks

Run `node --check BgVideo.plugin.js`, `node --test tests/media.test.js`, and `git diff --check`. No additional dependencies are required. Browser playback and theme rendering must also be checked in Discord.
