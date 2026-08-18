# FleetSync Mobile Driver App

Expo SDK 57 implementation of the 79-page FleetSync driver-app specification. The app registers all 122 artboards from section 9.12 and implements the scheduled, unscheduled, compliance, job, proof-of-delivery, records, messaging, wallet, profile, and offline-sync flows.

## Run

```sh
npm install
npm start
```

Camera, barcode scanning, and foreground location can run in Expo Go. Production background tracking and full native permission behavior require a development build.

## Verification

```sh
npm run check
npx expo export --platform ios --output-dir /tmp/fleetsync-export
```

`check:spec` verifies the 122 unique screen IDs and the presence of all primary IDs A1–A36.

## Structure

- `app/` contains Expo Router route boundaries.
- `src/screens/registry.ts` is the canonical document-screen register.
- `src/screens/DynamicScreen.tsx` implements feature and state rendering.
- `src/design/` contains literal FleetSync tokens.
- `src/data/` contains seed data, SQLite migrations, and queue persistence.
- `src/services/` contains device/service boundaries.
- `src/state/` holds persisted driver-session state.

## Integration boundary

The included repository is a functional offline-first prototype. Writes are persisted to SQLite with original occurrence times and available GPS fixes. Authentication, operator configuration, allocation, heavy-vehicle routing, telematics, real-time messaging, document storage, push delivery, and compliance calculations are represented by local seed data or service boundaries because the PDF does not provide production endpoints or credentials.

