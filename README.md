# BgVideo

A BetterDiscord plugin that plays a looping video behind the Discord UI.

BgVideo lets you replace a static background with an animated scene while keeping the interface usable.

## Features

- Looping background video playback (`MP4 / WebM`)
- URL sources via `http://` / `https://`
- Visual tuning controls:
  - Opacity
  - Blur
  - Saturate
  - Brightness
- Respects `prefers-reduced-motion`
- Auto-recovery when playback stalls
- Blob fallback when direct playback fails
- Built-in settings panel with Live apply / Test / Reset

## Installation

1. Place `BgVideo.plugin.js` in your BetterDiscord plugins folder.
2. Open Discord and go to `BetterDiscord -> Plugins`.
3. Enable `BgVideo`.
4. Open plugin settings and set your video URL.

## Settings

- `Video URL`  
  Background video URL (`https://...(.mp4/.webm)` recommended)
- `Debug`  
  Enables debug toasts/logs
- `Live`  
  Applies slider changes immediately
- `Opacity`  
  Video transparency
- `Blur (px)`  
  Blur amount
- `Saturate`  
  Color saturation
- `Brightness`  
  Brightness level
- `Respect reduced motion`  
  Honors OS/browser reduced-motion preference
- `Auto recover playback`  
  Attempts recovery when playback gets stuck
- `Stall threshold (sec)`  
  Time before a stall is considered recoverable
- `Max blob size (MB)`  
  Maximum allowed size for blob fallback

## Notes

- Local file URLs (`file://`) are not supported.
- Playback can fail depending on server `Content-Type` and codec compatibility.
- For long sessions, use stable direct video URLs.

## Troubleshooting

- `video error(code=4)` / `no supported source was found`
  - Unsupported codec
  - Invalid or missing MIME type
  - URL does not return a playable video file
- `fallback(blob) failed`
  - Network error
  - File exceeds `Max blob size (MB)`
- Video pauses or gets stuck
  - Enable `Auto recover playback`
  - Increase `Stall threshold (sec)`
