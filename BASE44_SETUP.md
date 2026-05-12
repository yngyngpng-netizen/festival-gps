# Base44 Setup

Festival GPS is ready for Base44 hosting and backend sync.

## Files

- `base44/config.jsonc` defines the app and deploys `FestivalGPSWeb/` as the site.
- `base44/auth/config.jsonc` enables email/password accounts.
- `base44/entities/User.jsonc` stores each user's festival name, current group code, profile photo URL, and pin color.
- `base44/entities/CrewMember.jsonc` stores group members, schedules, and fresh phone GPS snapshots.
- `FestivalGPSWeb/base44-config.js` holds the Base44 app id used by the web app.

## Deploy

```sh
base44 login
base44 link --create --name "Festival GPS" --description "EDC crew schedule map"
base44 deploy -y
```

If the npm registry blocks the CLI install on this laptop, use the built-in no-dependency helper instead:

```sh
node tools/base44-lite.mjs login
node tools/base44-lite.mjs link-create
node tools/base44-lite.mjs deploy
```

After linking, copy the app id from `base44/.app.jsonc` into `FestivalGPSWeb/base44-config.js`, then deploy again so the live app uses Base44 Auth and Entities.

The `CrewMember` entity uses row-level security so signed-in users can read members whose group code matches their own `festivalGroupCode`, and can update only the member record they created. The UI is email-only, but Base44 still receives an app-managed credential behind the scenes because the current SDK requires email/password auth for user-scoped writes.
