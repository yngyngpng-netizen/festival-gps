# Festival Buddy

Festival Buddy is a Safari-installable web app for finding friends at EDC Las Vegas 2026. It combines the official EDC grid map, friend profile pins, optional live location sharing, schedule screenshot parsing, and a timeline slider so a private crew can quickly answer: where is everyone, what grid are they in, and who are they seeing next?

Open the live app:

https://festival-gps-fa4c5235.base44.app/

## Why It Exists

EDC is huge, crowded, loud, and phone signal can be unreliable. Festival Buddy gives a friend group a lightweight map that works around that reality:

- If live location is available, friends appear on the EDC grid map by their current location.
- If signal is weak or GPS is missing, the app falls back to the person's uploaded schedule.
- If a friend is outside the mapped venue, their pin is placed at the gate instead of somewhere random.
- If multiple friends are at the same place, they are grouped into a bucket pin so the map stays readable.

## Main Features

- Private group codes for each crew.
- Name plus a simple 4-6 digit PIN so returning users can get back to their own profile.
- No email login required.
- Profile photo upload with in-browser crop and compression.
- Official EDC Las Vegas 2026 grid map with readable stage and grid positioning.
- Grid labels such as `A7` or `B12` for easier meetups.
- Optional live location sharing, with a clear stop-sharing confirmation.
- Schedule fallback when live location is unavailable.
- Schedule screenshot upload for Friday, Saturday, and Sunday.
- OCR schedule parsing from Insomniac-style schedule screenshots.
- Timeline slider that moves friend pins to their scheduled stages.
- Day selector for Friday, Saturday, and Sunday.
- Current and next set information for each friend.
- Stage pins that show the artist currently playing at the selected timeline time.
- Artist detail popup with set time information.
- Friend detail popup with that person's full three-day schedule.
- Bucket pins when several friends are at the same stage or grid.
- Draggable friend and bucket pins so hidden pins can be moved aside and tapped.
- Expanded map mode with a right-side crew list showing each friend's current grid.
- Group manager tools so the person who created a group can remove people.
- PWA support so the app can be saved to the iPhone home screen as Festival Buddy.
- Service worker caching for a faster installable web-app experience.

## How Friends Use It

1. Open the app in Safari: https://festival-gps-fa4c5235.base44.app/
2. Enter a user name and create a 4-6 digit PIN.
3. Start a new group or join with a friend's group code.
4. Upload a profile photo.
5. Save the app to the iPhone home screen with Share > Add to Home Screen.
6. Tap Live Location and allow location permission if you want friends to see your current grid.
7. Upload your schedule screenshots from the Insomniac app.
8. Use the map, grid labels, friend pins, and timeline to find your crew.

## Schedule Upload

The upload flow is built for screenshots exported from the Insomniac app schedule page. Friends can upload one or more screenshots, and Festival Buddy will try to detect:

- Day
- Artist name
- Start time
- End time
- Stage name

Uploading new schedule screenshots replaces the previous saved schedule for that user. Parsing is best effort, so very blurry screenshots or unusual layouts may need another upload.

## Live Location And Offline Behavior

Festival Buddy is designed to handle both live GPS and bad-signal festival conditions:

- When Live Location is on and the phone has permission plus signal, the app maps GPS coordinates to the EDC grid.
- When a user has no current signal, the app can show their last known location if it is still useful.
- When the selected timeline has moved beyond the last GPS update and the user's schedule says they should be somewhere else, the app uses the scheduled stage fallback.
- When no location or schedule is available, the pin falls back to the venue gate.
- When friends are offline and at the same scheduled stage, the app groups them together.

Important: this is a web app, not Apple's Find My network or AirTag technology. iOS Safari does not allow a PWA to continuously track location after the app is fully closed for a long time. For best live tracking, keep the app recently opened, allow location permission, and refresh when signal returns.

## Privacy Notes

- The app uses group codes instead of public discovery.
- Users log in with name, group code, and a 4-6 digit PIN.
- PINs are stored as hashes, not plain text.
- Location sharing is optional.
- Turning off live sharing asks for confirmation and clears the user's live location.
- Profile photos are cropped and compressed before upload.
- Group data is intended for friends-only use.

## Tech Stack

- Static web app in `FestivalGPSWeb/`
- Base44 hosting and data sync
- `CrewMember` entity for group members, schedules, photos, and live location snapshots
- Tesseract.js for browser OCR
- Service worker plus manifest for PWA install
- Local storage fallback for development demos
- Optional Apple MapKit JS support through `FestivalGPSWeb/base44-config.js`
- SwiftUI prototype remains in `FestivalGPS/`

## Local Development

Run the web app locally:

```sh
cd FestivalGPSWeb
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

Deploy to Base44 from the repo root:

```sh
node tools/base44-lite.mjs deploy
```

## Project Structure

```text
FestivalGPSWeb/
  index.html              Web app shell
  app.js                  App logic, schedule parsing, location, pins
  styles.css              Cyberpunk festival UI
  manifest.webmanifest    PWA home-screen metadata
  service-worker.js       Offline/cache shell
  assets/                 Map and app icons

base44/
  config.jsonc            Base44 app config
  entities/CrewMember     Shared group member storage

FestivalGPS/
  SwiftUI prototype files
```

## Message To Send Friends

Copy and paste this:

```text
Hello, it's Yang.

I made an app for EDC to help friends find each other when we get lost at the festival by combining schedule sharing and live location sharing.

https://festival-gps-fa4c5235.base44.app/

The app is tuned for EDC, where phone signal can be bad. Unlike Find My, which can turn grey or stop updating when there is no signal, this app can still help by using a friend's last live location update or their scheduled stage location when they go offline.

It also helps us form smaller groups throughout the night based on the artists and stages people plan to see together.

You can save it to your iPhone Home Screen so it feels more like a native app during the festival.

Group code: EDC-WTG-NS2

How to join:
1. Open the link in Safari.
2. Enter your user name.
3. Create a simple 4-6 digit PIN so you can log back in.
4. Join with the group code above.
5. Upload a profile picture.
6. Save it to your Home Screen: Share > Add to Home Screen.

Schedule setup:
1. Open the Insomniac app.
2. Select the artists you want to see.
3. Save your schedule list as an image using the share/save feature.
4. Open Festival Buddy and tap the picture/schedule button on the top right to upload your schedule image.

Features:
- View everyone's schedules in the group.
- See which friends are going to the same artists and stages.
- Form groups based on similar schedules.
- Drag the timeline bar to watch everyone's pins move across the map throughout the night.
- Tap Live Location to see everyone's latest shared location.
- Tap a friend's pin to view their full schedule.
- If someone loses signal, the app falls back to their last live location update or scheduled stage location.
- If a live location has not updated for over 30 minutes, the app automatically switches to scheduled stage tracking.

This is just for friends. If anything is confusing, ask Yang.
```

## Current Status

Festival Buddy is actively being tuned for EDC Las Vegas 2026 map accuracy, schedule parsing, iPhone Safari layout, and friend-group usability.
