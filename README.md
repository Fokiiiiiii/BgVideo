# BgVideo

BetterDiscord plugin that plays a looping video, image, or YouTube embed behind the Discord interface.

## Features

- MP4, WebM, OGV, OGG, PNG, JPG, GIF, WebP, AVIF, and BMP media
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

Open the plugin settings, paste a direct media URL or a YouTube URL into **Background URL**, and press **Apply** or Enter.

- **Preview** shows the URL without saving it.
- Clear the field and press **Apply** to remove the background.
- The dot under the field shows the state: green while the background is showing, yellow while it loads, blue during a preview, and red on errors.

## Settings

- **Appearance**: opacity, blur, brightness, and saturation
- **Playback**: autoplay, loop, and mute
- **Advanced** (collapsed): what to do when reduce motion is on, pausing while Discord is hidden, restarting stalled videos, debug logging, and a reset button that asks before clearing everything

## Theme requirement

BgVideo places the media behind Discord and makes the page background transparent, but most themes paint their own opaque background on top. Use a theme that lets you change its app background, shading, or transparency, and make that background transparent. If the status says the background is showing but you cannot see it, the theme is covering it.

## Performance

- Blur is the most expensive effect. Keep it at 0 for the lowest GPU use.
- Neutral values (blur 0, brightness 100%, saturation 100%) are skipped and cost nothing.
- Playback pauses while Discord is hidden unless you turn that off.
- YouTube embeds are sized to just cover the window, so YouTube does not pick a larger stream than needed.
- A 1080p video is usually enough for a background; 4K files take much more decoding work.

## Updates

The plugin includes BetterDiscord updater metadata. Automatic detection depends on the plugin being available in the BetterDiscord Store. Until then, replace the file with the latest version from the Raw URL above.

## Limitations

- URLs must use HTTP(S) and a supported media type. URLs with embedded usernames or passwords are rejected; use a signed query URL instead.
- YouTube playback requires the video to allow embedding.
- Supported codecs depend on Discord's Chromium runtime and the media server's headers.
