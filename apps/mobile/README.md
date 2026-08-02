# Yze mobile

Expo Router application based on Ignite 11.5.0 and upgraded to Expo SDK 57. The current UI
foundation supports adaptive light/dark themes, native platform navigation, and the complete first
Places/Items experience backed by the Yze API.

Use the root `README.md` for setup and run commands. Application code lives under `src`, while
native projects are generated through Expo Continuous Native Generation and are not committed.
The `pnpm ios*` and `pnpm android*` launchers fingerprint the resolved Expo config, native dependency
lockfile, and referenced assets. They cleanly regenerate only the selected platform after a native
input changes, so launcher names, icons, splash screens, and config plugins cannot silently remain
stale.
