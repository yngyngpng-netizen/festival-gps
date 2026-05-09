# Firebase Setup

Festival GPS can run as a local demo with `localStorage`, but real friend sync needs Firebase.

1. Create a Firebase project.
2. Enable Authentication > Email/Password.
3. Create a Firestore database.
4. Copy your web app config into `FestivalGPSWeb/firebase-config.js`.
5. Publish the rules in `firestore.rules`.
6. Push the updated config or deploy with Firebase Hosting.

The web app stores each group at:

```text
groups/{GROUP_CODE}/members/{USER_ID}
```

Firebase Authentication stores passwords. Firestore stores display name, email, profile thumbnail, group code, and schedule events. Profile photos are compressed in-browser before upload so they fit inside member documents.
