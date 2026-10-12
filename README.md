# Hadith Video - Niyyah (ইসলামী বিশ্বকোষ ও আল হাদিস S2) - Professional Render

## Deliverables
This repo renders the same hadith video in all 6 ratios × 3 qualities = 18 MP4 files, synchronized to your audio.

- `index.html` + `style.css` + `config.js` + `layout.js` + `scenes.js` = deterministic animation
- `render.js` = Playwright capture + FFmpeg encode (one capture per ratio, all qualities from same frames)
- `.github/workflows/render.yml` = GitHub Actions workflow that publishes a Release
- `timestamps.txt`, `logo.png` (app-icon), `google-play-badge.png`, `audio.mp3` (attach your voice-over)

## How to render (3 steps)
1. **Create GitHub repo and upload all files** keeping `.github/workflows/render.yml` at that exact path. Upload `audio.mp3` if you have it (if missing, workflow generates silent audio for preview).
2. **Actions tab → "Render video (all ratios) and publish Release" → Run workflow**  
   First time: try `test_seconds=10` and `ratios=9x16,16x9` to preview quickly.  
   Full run: leave `test_seconds` empty.
3. **When green, open Releases** (right side of repo main page) and download the ratio/quality you need. Artifacts also kept 30 days.

## Output files (18)
- `hadith-video-9x16-4k.mp4` / `-fhd.mp4` / `-hd.mp4` → 1080×1920 / 2160×3840 / 720×1280 → **TikTok, Reels, Shorts**
- `hadith-video-16x9-4k.mp4` / `-fhd.mp4` / `-hd.mp4` → 1920×1080 / 3840×2160 / 1280×720 → **YouTube long, website**
- `hadith-video-1x1-4k.mp4` / `-fhd.mp4` / `-hd.mp4` → 1080×1080 / 2160×2160 / 720×720 → **Feed square**
- `hadith-video-4x5-4k.mp4` / `-fhd.mp4` / `-hd.mp4` → 1080×1350 / 2160×2700 / 720×900 → **FB/IG feed (most space)**
- `hadith-video-3x4-4k.mp4` / `-fhd.mp4` / `-hd.mp4` → 1080×1440 / 2160×2880 / 720×960 → **Portrait feed**
- `hadith-video-4x3-4k.mp4` / `-fhd.mp4` / `-hd.mp4` → 1440×1080 / 2880×2160 / 960×720 → **Classic / decks**

Quality guide: `4k` = archive / best, `fhd` = normal upload, `hd` = small file / slow net.

## Changing text/timing later
- Edit `timestamps.txt` (format `start | end | text | emotion_tag`), commit, run workflow again.
- New version? Set `release_tag=hadith-niyyah-v2` to publish as new Release, or reuse same tag to update.

## Troubleshooting
- **No Release created?** Check repo Settings → Actions → General → Workflow permissions → **Allow Read and write permissions**. Then re-run.
- **One ratio failed?** Re-run workflow with `ratios=` only the failed one + same `release_tag` → it will `--clobber` upload into same Release.
- **Audio shorter than timestamps?** Workflow auto pads with silence (`apad`). Keep audio length = last timestamp (82s).
- **Fonts?** Workflow installs Noto Bengali, Noto Naskh Arabic, Amiri. No external CDN.

## Design notes (professional, not common)
- Deep emerald + gold palette, glassmorphism cards, Islamic star pattern, seeded gold dust, mosque skyline.
- Arabic sacred text in Arabic script with full tashkeel, honorifics as full Arabic.
- No faces of Prophets/Companions; presence shown via minbar, dome, book, light.
- Deterministic `window.renderAt(t)` - no setTimeout/CSS animation/random.
- App icon displayed as white rounded tile with gold ring + glow, cropped 1.04× to hide grey border.
