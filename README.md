# Festival GPS

Festival GPS is a SwiftUI iOS prototype for finding friends at EDC Las Vegas 2026. It shows the festival map, places each friend as a profile-photo pin, reads an uploaded schedule screenshot with Vision OCR, and moves pins between stages as the bottom timeline is dragged.

## Web App

The Safari-installable PWA lives in `FestivalGPSWeb/`. It is designed for Base44 hosting, GitHub Pages fallback, and Firebase fallback.

Run it locally:

```sh
cd FestivalGPSWeb
python3 -m http.server 8080
```

Then open `http://localhost:8080` on the laptop. On iPhone, open the deployed GitHub Pages URL in Safari and use Share > Add to Home Screen.

The web app includes:

- PWA manifest and service worker.
- EDC map with fallback artwork.
- Timeline-driven friend pins.
- Email/password account flow.
- Profile photo upload with in-browser image compression.
- Group-code entry so friends in the same group share pins and routes.
- Schedule picture OCR through Tesseract.js for Friday, Saturday, and Sunday schedules.
- Base44 Auth + Entities sync when `FestivalGPSWeb/base44-config.js` has an app id.
- Firebase Auth + Firestore integration with `localStorage` fallback for local demos.

Base44 resources live in `base44/`: email/password auth is enabled in `base44/auth/config.jsonc`, and group sharing is stored in the `CrewMember` entity. The published GitHub Pages app runs in local demo mode until `FestivalGPSWeb/base44-config.js` or `FestivalGPSWeb/firebase-config.js` is filled.

## Open

Open `FestivalGPS.xcodeproj` in Xcode 16 or newer, choose an iPhone simulator or device, and run the `FestivalGPS` scheme.

This workspace currently has only Apple Command Line Tools installed, so local iOS simulator builds cannot be run here without full Xcode.

## What Works

- Remote official EDC map image with a built-in stylized fallback map.
- Stage directory for Kinetic Field, Cosmic Meadow, Circuit Grounds, Neon Garden, Basspod, Wasteland, Quantum Valley, Stereo Bloom, Bionic Jungle, Art Cars, and Downtown EDC.
- Profile-photo upload for the current user.
- Schedule screenshot upload with OCR and stage/time parsing.
- Generated schedule preview before applying it.
- Animated friend pins that move as the timeline is scrubbed.
- Friend selector with current or upcoming set status.

## Notes

The stage coordinates live in `FestivalGPS/Models/StageDirectory.swift`. They are normalized map positions, so updating them is a small edit after the final official map artwork and set-time screenshots are confirmed.
