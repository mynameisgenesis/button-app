# 🔴 Big Red Button — React Native App

A simple Expo app with one giant button that plays a sound.

## What this app does

- Press the big red button to play audio.
- Upload a custom sound from the settings menu.
- Optionally stop playback by tapping again when "Stop on press" is enabled.
- Saves the user's stop/tap preference between launches.

## Prerequisites

- Node.js (recommended 18.x)
- npm or yarn
- Expo CLI / EAS CLI available via `npx`
- Apple Developer account and App Store Connect access for iOS publishing
- Google Play Console access for Android publishing

## Install

```bash
npm install
```

If you add a custom default sound, place it at:

```bash
assets/default-sound.mp3
```

## Run the app in development

```bash
npx expo start
```

Then open the app on a simulator or physical device using the Expo dev tools.

To run directly on a simulator/device:

```bash
npx expo run:android
npx expo run:ios
```

## Development build

Use the EAS development profile to build a development binary or dev client. This is useful for testing a production-like build while still keeping development tooling available.

### iOS development build

```bash
npx eas build --platform ios --profile development
```

### Android development build

```bash
npx eas build --platform android --profile development
```

## Production build

This project uses EAS Build for production binaries.

### iOS

```bash
npx eas build --platform ios --profile production
```

### Android

```bash
npx eas build --platform android --profile production
```

## Publish to the app stores

### 1. Preflight checks

Before publishing, run the built-in publish validation:

```bash
npm run ci:publish-check
```

This runs TypeScript and basic Expo/EAS config validation.

### 2. Submit iOS build

Once the iOS build succeeds, submit it to App Store Connect:

```bash
npx eas submit --platform ios --profile production
```

### 3. Submit Android build

Once the Android build succeeds, submit it to Google Play:

```bash
npx eas submit --platform android --profile production
```

> Note: actual publishing requires valid Apple and Google credentials, App Store Connect metadata, and Play Console configuration.

## App usage

- Tap the red button to play the sound.
- Open the settings gear (top-right) to upload a custom audio file.
- Use the "Stop on press" toggle in settings to control whether repeated taps stop playback or restart it.
- If a custom sound is active, you can revert to the default sound in settings.

## Project structure

```text
button-app/
├── App.tsx
├── app.json
├── eas.json
├── package.json
├── scripts/validate-publish.js
├── screens/HomeScreen.tsx
├── assets/
│   └── default-sound.mp3
└── types/
    └── async-storage.d.ts
```

## Helpful commands

```bash
npm install
npm run start
npm run ios
npm run android
npm run ci:publish-check
```

## Notes

- The app uses `expo-audio` to play sounds.
- `expo-document-picker` allows picking custom audio files.
- The publish preflight script does config validation but does not replace manual App Store or Play Console checks.
