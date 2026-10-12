# Hadith video — ইন্নামাল আ'মালু বিন নিয়্যাত

Animated 1080×1920 / 30 fps video, built with HTML/CSS/JS, recorded by Playwright and encoded by FFmpeg on GitHub Actions.

## Render
1. Create a GitHub repository and upload all files. Keep `.github/workflows/render.yml` at that exact path.
2. Actions tab → **Render hadith video** → **Run workflow** (optionally enter test seconds, e.g. `10`).
3. Open the finished run and download the **hadith-video** artifact (contains `hadith-video.mp4`).

## Edit later
- Text / timing of subtitles: edit `timestamps.txt` (`start | end | text | emotion_tag`) and run the workflow again. `lines.js` is regenerated automatically.
- Scene timing / visuals: `scenes.js` (each element has `track(el, start, end, {a, i, o})`).
- Local: `npm install && npx playwright install chromium && node render.js --still 5,20,80`.
