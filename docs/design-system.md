# Adaptive design system

## Decision

Gear Organizer has one shared information architecture, interaction model, and set of semantic
design tokens. Platform-native visual treatments are progressive enhancements, not separate product
themes. A feature must remain complete, legible, and intentional when an optional visual effect is
unavailable.

Liquid Glass is an iOS enhancement. It must never be required to understand navigation, discover an
action, or read content. Android and older iOS releases use their native controls or a deliberately
minimal tonal surface instead of attempting to imitate Apple's material with a custom blur.

## Implementation hierarchy

Choose the first suitable option, in this order:

1. Use a standard platform-native component. It receives the current platform appearance and
   accessibility behavior automatically.
2. Expose one semantic application component and isolate substantially different renderers with
   React Native platform files such as `Component.ios.tsx` and `Component.tsx`.
3. Put runtime capability and accessibility checks inside that component adapter only.

Screens and feature components must not inspect `Platform.OS`, an iOS version, or Liquid Glass
availability to select presentation. They consume semantic components such as `AppTabs`,
`FloatingToolbar`, or `PrimaryActionSurface`; they do not consume components named after an effect,
such as `GlassCard`.

The shared contract includes:

- content, actions, navigation state, and accessibility semantics;
- spacing, typography, shape, and semantic color roles;
- interaction states and motion intent.

Only the material, elevation, and platform-standard motion may differ.

## Where Liquid Glass belongs

Liquid Glass belongs to the functional layer that floats above content. Consider it for:

- bottom navigation and tab bars;
- top toolbars and compact navigation controls;
- search controls;
- a floating primary action or a small group of contextual actions;
- temporary overlays, including future scanner controls.

Do not apply it to the content layer, including:

- item or place cards and list rows;
- forms, input groups, and validation messages;
- full-screen backgrounds and ordinary content containers;
- every button or decorative panel.

This keeps hierarchy clear, avoids excessive compositing, and prevents the unsupported-platform
experience from feeling like a reduced version of the product.

## Fallback surface

The fallback must be designed rather than merely removing blur. It uses:

- an opaque or lightly translucent semantic surface color;
- sufficient text and icon contrast;
- a subtle border or native elevation when hierarchy requires it;
- the same geometry, spacing, content, and touch targets as the enhanced version;
- restrained motion that respects the system Reduce Motion setting.

Android should follow its native navigation behavior and tonal-surface hierarchy. Older iOS
versions should use standard UIKit materials or a simple semantic surface. Do not reproduce Liquid
Glass with a stack of blur, gradient, highlight, and shadow effects.

## Accessibility and capability rules

An iOS adapter that renders a custom glass surface must verify the runtime API before mounting it.
It must fall back when transparency is reduced and remain usable with increased contrast, dark mode,
larger text, and reduced motion. Capability detection belongs in the adapter, not in callers.

`expo-glass-effect` provides `isGlassEffectAPIAvailable()` for custom glass surfaces and falls back
to a regular view on unsupported platforms. A styled semantic fallback is still required. See the
[Expo GlassEffect documentation](https://docs.expo.dev/versions/v57.0.0/sdk/glass-effect/).

## Reference component: bottom navigation

`src/components/navigation/AppTabs.tsx` is the first reference implementation. It wraps Expo
Router's native tabs instead of drawing a custom tab bar:

- iOS 26 and newer receive the system Liquid Glass tab bar;
- older iOS versions receive the standard native tab bar;
- Android receives the native Android navigation bar and Material symbols;
- web receives Expo Router's functional fallback.

The routes and screens know only about destinations. They contain no platform or OS-version checks.
`NativeTabs` is currently an alpha Expo Router API, so all direct usage stays inside `AppTabs`. If
its API changes, only that boundary should need migration. See the
[Expo Router native tabs guide](https://docs.expo.dev/router/advanced/native-tabs/).

## Review checklist

For every adaptive surface, verify:

- current iOS with Liquid Glass;
- the oldest supported iOS version;
- Android in light and dark mode;
- Reduce Transparency, Increase Contrast, and Reduce Motion where applicable;
- large text and touch targets;
- that content hierarchy and every action remain identical across renderers.
