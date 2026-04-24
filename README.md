# 🔴 Big Red Button — React Native App

A big red button that plays a sound. That's it. That's the app.

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add a default sound

Drop an audio file into the `assets/` folder and name it **`default-sound.mp3`**.

Any MP3 will work — airhorn, fart, rimshot, whatever chaos you're after.

**Free sound sources:**
- https://freesound.org
- https://www.soundbible.com
- https://mixkit.co/free-sound-effects/

### 3. Run the app

```bash
# Start Expo dev server
npx expo start

# Or run directly on a device/simulator
npx expo run:android
npx expo run:ios
```

---

## Features

- **Big red button** in the center of the screen — press it, it makes noise
- **Animated press** — the button squishes down when tapped (satisfying!)
- **Glow effect** — red glow pulses while audio plays
- **Settings menu** (⚙️ top right) — upload your own sound file from your device
- **Custom sound** — supports MP3, WAV, AAC, and other common formats
- **Revert option** — one tap to go back to the default sound

---

## Project Structure

```
SoundButton/
├── App.tsx              ← All the app logic and UI
├── app.json             ← Expo config
├── package.json         ← Dependencies
└── assets/
    └── default-sound.mp3   ← ADD THIS FILE
```

---

## Dependencies

| Package | What it does |
|---|---|
| `expo-av` | Plays audio files |
| `expo-document-picker` | Opens the device file picker to choose a custom sound |

---

## Customization Ideas

- Change `backgroundColor: '#0d0d0d'` in styles to change the app background
- Change `backgroundColor: '#cc0000'` on the button style to make it a different color
- Add haptic feedback with `expo-haptics` for extra button satisfaction
- Add a volume slider in the settings menu
