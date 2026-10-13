# Hadith video — ইসলামী বিশ্বকোষ ও আল হাদিস S2

Timestamped audio → animated 1080×1920 (30 fps) vertical video. HTML/CSS/JS animation, recorded frame by frame with Playwright (Chromium), encoded with FFmpeg, rendered by GitHub Actions. Output: `hadith-video.mp4` (80 s).

## Render it (3 steps)
1. Create a GitHub repository and upload **all files** in this folder. Keep the workflow at exactly `.github/workflows/render.yml`.
2. Open the **Actions** tab → **Render hadith video** → **Run workflow**. (Optional: enter `10` in *test_seconds* to render only the first 10 seconds first.)
3. When the run is green, open it and download the **hadith-video** artifact (a zip containing the MP4).

## Change timing or text later
Edit `timestamps.txt` (`start | end | text | emotion_tag`), commit, run the workflow again. `lines.js` is regenerated from it automatically. Scene timings (when each picture appears) are in `scenes.js`; they are written as absolute seconds, so if you change line timings, adjust the matching scene times too.

## Local use (optional)
`npm install && npx playwright install chromium && node render.js` — also `--test 10`, `--still 5,20` (PNG stills), `--workers 4`. Needs `ffmpeg`, and Bengali/Arabic fonts (Noto Serif/Sans Bengali, Amiri).

## Files
`index.html` `style.css` `art.js` (SVG art) `scenes.js` (timeline + scenes + `window.renderAt(t)`) `lines.js` `render.js` `package.json` `timestamps.txt` `audio.mp3` `app-icon.jpg` `google-play-badge.jpg` `.github/workflows/render.yml`
