# mining-mobile

## Reusable components

- Never create a new Button, TextInput/input field, or other common UI primitive scoped to a single screen/feature file.
- Before adding any such component, check `src/shared/components/` first. If something close already exists, update/extend it (add a prop/variant) instead of creating a new one.
- If nothing suitable exists and it's a generic cross-app primitive, add it to `src/shared/components/`. If it's a composite specific to one feature's screens (e.g. a settings/profile menu row, a feature-specific header card), put it in that feature's `components/` folder instead (mirrors stride-mobile: `SettingsProfileHeader`/`SettingsMenuSectionCard` live in `features/dashboard/components`, not `shared/components`).
- Component files: named-export `function ComponentName(props): React.ReactElement`, explicit return type, no `interface`, no default exports, styles via `StyleSheet.create` at the file bottom — matches stride-mobile's convention.
- Prop types don't live inline in a component file, app-wide. `src/shared/components/*` types go in `src/shared/types/<componentName>.types.ts`; a feature's own `features/<feature>/components/*` types go in `features/<feature>/types/<componentName>.types.ts` (camelCase file name matching the component, e.g. `MenuRow.tsx` → `menuRow.types.ts`). Import the type back into the component. Exception: a screen's own react-navigation `Props` type (`type Props = NativeStackScreenProps<...>` etc.) stays inline in the screen file — it's single-use, route-specific wiring, not a reusable prop shape.
- Any `Pressable`/`TouchableOpacity` that renders a gold/charcoal background + label (+ optional icon) is a `Button`, not a one-off — use `src/shared/components/Button.tsx` instead of hand-rolling it. `Button` supports: `variant` (primary/secondary/outline/link), `size` ('lg' = 56px pill, for full-width CTAs like onboarding "Continue"), `icon` + `iconPosition` ('left'/'right'), `loading`, and `overlay` (an absolutely-positioned layer behind the label, e.g. an animated progress fill — see `WelcomeScreen.tsx`'s continue button). Don't add a new single-purpose prop to `Button` for a one-off visual; prefer `style` overrides or `overlay` first.
- Periodically audit for drift: grep for hand-rolled `TouchableOpacity`/`Pressable` styled like an existing shared component (gold pill, bordered card, menu row, etc.) rather than assuming new code already reuses things correctly.

## Screen header

- Every screen that needs a back button/title uses `src/shared/components/AppTopBar.tsx` (mirrors stride-mobile's `AppTopBar`: circular back chevron pill on the left, centered bold title, safe-area aware). Don't build a one-off header per screen — pass `left="back"` and `title` to `AppTopBar` instead.

## Theme

- Theme lives in `src/theme/` (mirrors stride-mobile's `src/theme/` location), split into `colors.ts` (`palette`), `spacing.ts`, `radius.ts`, `typography.ts`, and `cardShadow.ts` (`cardBackShadow`), all re-exported from `src/theme/index.ts`. Import via `@/theme` — always reference `palette.*` / `spacing.*` / `radius.*` from there instead of hardcoding hex values in screens.
- Primary color: `palette.gold` (`#C9A227`), with `palette.lightGold` (`#E4C766`) as a lighter accent.
- Secondary/text color: `palette.charcoal` (`#222222`).
- Background: `palette.warmWhite` (`#FCFBF8`) / `palette.softGold` (`#F5EBCF`).
- Muted/secondary text: `palette.muted` (`#8A8A8A`). Danger/error: `palette.danger` (`#D64545`).

## Folder structure

Follow the Core-main/Apex-main folder conventions for new code (features/<feature>/{screens,components,hooks,utils}).
