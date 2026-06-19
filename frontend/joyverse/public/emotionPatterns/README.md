# Emotion pattern backgrounds

`EmotionBackground` (src/components/EmotionBackground.js) tiles one image per
emotion behind the game card. Drop your 5 **seamless / tileable** pattern images
here, named exactly:

```
happy.png
sad.png
neutral.png
confused.png
angry.png
```

(PNG/JPG/WebP all work — if you use a different extension, override it via the
component's `theme` prop, e.g. `theme={{ Happy: { image: 'happy.webp' } }}`.)

Notes:
- These are served from `/emotionPatterns/<name>` at runtime (Vite copies
  everything under `public/` verbatim, no import needed).
- Use genuinely **tiling** textures — they are repeated, not stretched.
- A missing file degrades gracefully: the soft colour tint still shows, nothing
  breaks. So the app builds and runs even before you add the images.
- There is no `confused` image elsewhere in the repo yet — you must supply it.
