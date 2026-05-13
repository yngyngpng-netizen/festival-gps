# Festival Buddy

Festival Buddy is a SwiftUI iOS prototype and Safari-installable web app for finding friends at EDC Las Vegas 2026. It shows the festival map, places each friend as a profile-photo pin, reads uploaded schedule screenshots with OCR, and moves pins between stages as the bottom timeline is dragged.

## Web App

The Safari-installable PWA lives in `FestivalGPSWeb/`. It is designed for Base44 hosting with a local demo fallback.

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
- Group-code entry with user name plus a 4-6 digit PIN for returning users.
- Profile photo upload with in-browser crop and compression.
- Create-group and join-code flow so each crew can start with a unique group code.
- Multi-picture schedule OCR through Tesseract.js for Friday, Saturday, and Sunday schedules. New uploads replace the saved schedule.
- Optional live phone location sharing with schedule fallback when GPS is unavailable or the phone is offline.
- Optional Apple Maps MapKit JS layer for the live festival map. Add a MapKit JS token to `FestivalGPSWeb/base44-config.js` to replace the built-in fallback map with interactive Apple Maps.
- Base44 Entities sync when `FestivalGPSWeb/base44-config.js` has an app id.
- `localStorage` fallback for local demos.

Base44 resources live in `base44/`: the UI uses group code, user name, and a client-side hashed 4-6 digit PIN instead of email login. Group sharing, parsed schedules, profile photos, and live location snapshots are stored in the `CrewMember` entity. The app uses local demo mode if Base44 is not configured.

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
