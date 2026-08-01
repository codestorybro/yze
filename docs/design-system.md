# Yze adaptive design system

## Decision

Yze has one shared information architecture, interaction model, and set of semantic design tokens.
Platform-native visual treatments are progressive enhancements, not separate product themes. A
feature must remain complete, legible, and intentional when an optional visual effect is
unavailable.

Liquid Glass is an iOS enhancement. It must never be required to understand navigation, discover an
action, or read content. Android and older iOS releases use their native controls or a deliberately
minimal tonal surface instead of attempting to imitate Apple's material with a custom blur.

## Brand and voice

The product name is **Yze**. The preferred compact brand lockup is:

> **Yze — Gear, organized.**

The longer campaign line is:

> **Get Yze. Get your gear organized.**

When a plain product description is more useful than wordplay, use **A visual home for your gear.**
Copy should be short, direct, calm, and concrete. Do not depend on the Yze wordplay alone to explain
the product, and avoid unnatural phrases such as “gear organize.”

The current application icon is a working Yze mark: three ordered paths converge around one lime
signal. It replaces the Ignite placeholder and establishes the geometry and palette for native
builds, but it may still be refined as the brand matures. Its light appearance uses a charcoal mark
on a near-white neutral gradient; its dark appearance uses an off-white mark on a quiet graphite
gradient. Keep launcher-icon appearances and both splash-theme variants synchronized when the mark
changes. Do not copy another product's logo or ornamental geometry to reproduce its tonal character.

## Visual direction

Apple's restraint and the Tesla app's strong content hierarchy are references, not templates to
copy. Do not reproduce Tesla branding, assets, layouts, or controls. Apply the underlying principles
to Yze's own storage domain:

- one dominant visual or task per screen;
- generous whitespace and a clear top-to-bottom reading order;
- a large hero that establishes the current context;
- no more than three immediately visible, high-frequency quick actions;
- a restrained, single-column content flow instead of a grid of equally prominent cards;
- platform-native navigation and controls where they improve familiarity.

On the future populated Home screen, the hero may show a photo or visual overview of the selected
place, such as a studio, cabinet, or backpack. It is Yze's analogue for a product-focused hero, not a
reason to imitate a vehicle render. The empty state must remain honest: use a neutral visual and a
clear value statement rather than invented inventory, counts, or activity.

The intended Home hierarchy is:

1. Yze wordmark and, when real scopes exist, a selector for the active gear context.
2. A dominant hero with the active place or an intentional empty state.
3. Once their flows exist, three functional quick actions: **Add item**, **Add place**, and **Find
   gear**.
4. Future content sections such as **Recent gear**, **Your spaces**, and **Unplaced items**, shown
   only when their data and actions exist.
5. Development diagnostics, including the Phase 0 API connection check, visually subordinate to the
   product experience.

Do not render inactive product promises merely to fill this structure. **Add item**, **Add place**,
and **Find gear** appear as commands only when they perform those actions. Until a domain flow
exists, omit its command or present explanatory empty-state content without a button that leads
nowhere.

## Professional design principles

Every meaningful visual change is reviewed against the eight principles in Expo's
[professional design guide](https://expo.dev/blog/how-to-apply-professional-design-principles-in-ai-app-development).
They are operating constraints for Yze, not a one-off inspiration exercise:

1. **Contrast** — choose one focal point or primary action per state. Use size, weight, color, and
   shape deliberately; do not let several lime controls compete for attention.
2. **Hierarchy** — make the intended reading and action order obvious. Product context and the main
   task come first, supporting content second, and diagnostics last.
3. **Alignment** — share container edges and visual axes. Prefer the common single-column frame over
   isolated widths or decorative offsets.
4. **Proximity** — use space to express relationships. Keep a heading, its explanation, and its hero
   visually together; create a larger interval before the next independent section.
5. **Repetition** — reuse semantic colors, one type family, the spacing scale, shape vocabulary,
   image treatment, and interaction patterns. Repetition should clarify the system, not repeat the
   same message or route in several places.
6. **Balance** — distribute visual weight intentionally. The dominant hero may be asymmetric, but
   smaller controls and copy must counterbalance it rather than leave accidental gaps.
7. **White space** — treat negative space as active structure. Preserve Yze's calm, premium rhythm
   instead of filling the screen with cards, dividers, badges, or premature actions.
8. **Unity** — every detail must reinforce one product idea: a calm visual home for gear. A screen is
   ready only when its typography, imagery, surfaces, actions, motion, and platform behavior feel
   like one system.

Do not accept the first technically correct composition. For visual work, inspect screenshots in
light and dark appearance at minimum, apply the checklist above, and iterate on the most visible
break in hierarchy. Also compare iOS and Android whenever a platform-native surface is involved.
This guards against the sterile, purely utilitarian result that otherwise appears when UI is built
only from requirements and component names.

## Color, type, and shape

Yze uses cool mineral neutrals in both themes, with one restrained lime signal color as its
recognizable accent. The dark theme is designed independently rather than produced by mechanically
inverting the light palette. Imagery should receive an appropriate scrim when necessary; it must not
be color-inverted.

Screens and components consume semantic roles rather than raw palette values. The core roles are:

- `background` for the screen canvas;
- `surface` and `surfaceRaised` for content hierarchy;
- `text` and `textDim` for primary and supporting copy;
- `border` and `separator` for quiet structure;
- `tint` and `onTint` for accessible interactive emphasis;
- `signal` and `onSignal` for the vivid lime brand cue and any foreground placed directly on it;
- `success`, `error`, and their background roles for status feedback;
- overlays for image contrast and temporary layers.

The lime signal is not a default text color on a light background and must never be the only cue for
state. Every semantic foreground/background pair must meet the required contrast in both themes.

Space Grotesk is Yze's brand typeface. Prefer regular, medium, and semibold weights, large confident
headings, and concise body copy. Use a small shape vocabulary: generous radii for the hero and major
content surfaces, medium radii for controls, and platform-appropriate touch targets. Avoid excessive
shadows, borders, gradients, and “card soup”; spacing should establish hierarchy before decoration.

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

In the current and planned component set this means:

- `AppTabs`, native toolbars, search controls, compact scope selectors, floating contextual actions,
  and future scanner overlays may receive a platform-native material;
- the Home hero, place and item cards, list rows, status panels, forms, and section containers use
  semantic content surfaces without Liquid Glass;
- the Home quick-action group uses ordinary semantic controls by default. It becomes eligible for an
  adaptive material only if it genuinely floats above content as one functional control group;
- screens refer to components by purpose, such as `AppTabs`, `OrganizerHero`, `QuickAction`,
  `FloatingToolbar`, or `ContentCard`, never by a visual effect.

Do not emulate Liquid Glass on content cards or unsupported platforms. Similar geometry and spacing
provide brand continuity; identical material is neither required nor desirable.

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

## Reference components: Home

The first Home composition demonstrates the content layer of this system:

- `OrganizerHero` selects a theme-appropriate product render while exposing one stable semantic
  component to its caller;
- `BrandHeader` owns the compact wordmark and isolates the top offset required by the web native-tabs
  fallback;
- `QuickAction` remains the semantic component for future real commands; it is intentionally not
  rendered merely to duplicate a tab or the primary empty-state action;
- `Button` uses semantic `primary`, `secondary`, and `ghost` treatments rather than raw palette
  values;
- `GearOrganizerScreen` composes the hierarchy and owns product copy, but contains no platform or
  OS-version checks.

During Phase 0, Home exposes one purposeful next step, **Open Places**, while persistent navigation
owns **Places** and **Settings**. The API check stays in its subordinate development-status section.
Render the planned quick actions only when those domain flows are complete. This preserves one
clear focal action and avoids repeating the same destinations in tabs, shortcuts, and a card.

## Launch and screen-edge behavior

The native application name is **Yze**. Launcher icons and the light/dark native splash use the same
ordered-path mark and semantic appearance as the application theme. iOS declares separate light and
dark icon assets. Android uses `drawable-night` resource qualifiers for its adaptive background and
foreground, plus a monochrome layer for Android's system-themed icon treatment. Theme selection is
native on both platforms and never branches in React Native code. `AppLaunchGate` keeps that
native splash visible until fonts, localization, matching launch artwork, and the first application
layout are ready. The native screen then hands off without a fade to a pixel-matched JavaScript
surface: the Y mark folds into its lime signal point and a circle growing from that point reveals the
already-mounted application. The sequence stays below one second, never remounts navigation, and
does not animate route content independently. Reduce Motion skips the fold and radial reveal and
shows the prepared application immediately.

The application remains in a stable, unclipped full-screen container throughout this handoff. Only
the launch curtain above it is animated; native navigation and image layers must never be mounted
inside the circular clipping geometry, because doing so breaks UIKit Liquid Glass compositing and
can delay bundled-image rendering on iOS. The curtain itself has one static geometry with a
signal-sized opening and animates only a compositor transform. Do not animate its width, height,
position, border radius, or border width per frame; that forces Fabric layout and Core Animation to
redraw an oversized layer and can introduce launch hitches on iOS.

On iOS, the operating-system launch snapshot is declared with `UILaunchScreen` and the named
`SplashScreenBackground`/`SplashScreenLogo` assets. The generated `SplashScreen.storyboard` remains
bundled only because `expo-splash-screen` uses it to hold an identical native surface after the
process starts. This split deliberately invalidates launch snapshots cached by older builds under
the legacy Ignite storyboard while preserving a seamless native-to-JavaScript handoff.

`Screen` owns edge behavior for every route:

- scrolling screens use native automatic content insets, allowing `NativeTabs` to account for the
  real tab-bar height on each device and iOS presentation mode;
- `AppTabs` marks its route subtree as native-tab-hosted, so Android fixed screens do not reserve
  the system bottom inset twice, while fixed iOS screens still protect content locally;
- Android receives the missing top system inset inside the shared boundary;
- the top safe-area clearance is part of the scroll content: at rest the first element starts below
  system UI, then it can travel sharply underneath the status area to the physical screen edge;
- no fixed blur, gradient, or opaque overlay may mask the status area on ordinary scroll screens;
- a standard end-of-content clearance is added independently of the dynamic navigation inset;
- fixed screens use a full-height inner content frame and own safe areas not already supplied by
  their navigation host; screens outside tabs retain their own bottom protection.

Feature screens must not add padding equal to an assumed tab-bar or status-bar height. Use
`bottomClearance="none"` or a deliberate `safeAreaEdges` override only for a true full-bleed
experience such as a future camera, lightbox, or immersive media screen. These exceptions stay
semantic and never branch on a platform or OS version in route code.

These components are reference points for future place and item experiences. The generated
organizer render is an intentional foundation visual, not user data; replace it with the selected
place or item imagery once that domain exists.

## Review checklist

For every adaptive surface, verify:

- current iOS with Liquid Glass;
- the oldest supported iOS version;
- Android in light and dark mode;
- Reduce Transparency, Increase Contrast, and Reduce Motion where applicable;
- large text and touch targets;
- that content hierarchy and every action remain identical across renderers.

For every significant screen composition, also verify:

- one unmistakable focal task and a three-level reading hierarchy;
- shared alignment axes and proximity that communicates grouping;
- consistent tokens and no repeated route, slogan, or CTA without a distinct purpose;
- intentional balance and enough white space in compact and wide layouts;
- unity across copy, imagery, surfaces, motion, and both color appearances;
- screenshot review in light and dark appearance before declaring the visual work complete.
