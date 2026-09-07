# mining-mobile

## Reusable components

- Never create a new Button, TextInput/input field, or other common UI primitive scoped to a single screen/feature file.
- Before adding any such component, check `src/shared/components/` first. If something close already exists, update/extend it (add a prop/variant) instead of creating a new one.
- If nothing suitable exists, add the new primitive to `src/shared/components/` so every feature can reuse it, rather than duplicating it per screen.

## Screen header

- Every screen that needs a back button/title uses `src/shared/components/AppTopBar.tsx` (mirrors stride-mobile's `AppTopBar`: circular back chevron pill on the left, centered bold title, safe-area aware). Don't build a one-off header per screen — pass `left="back"` and `title` to `AppTopBar` instead.

## Theme

- Colors live in `src/shared/theme/tokens.ts` (`palette`) — always reference `palette.*` / `spacing.*` / `radius.*` from there instead of hardcoding hex values in screens.
- Primary color: `palette.gold` (`#C9A227`), with `palette.lightGold` (`#E4C766`) as a lighter accent.
- Secondary/text color: `palette.charcoal` (`#222222`).
- Background: `palette.warmWhite` (`#FCFBF8`) / `palette.softGold` (`#F5EBCF`).
- Muted/secondary text: `palette.muted` (`#8A8A8A`). Danger/error: `palette.danger` (`#D64545`).

## Folder structure

Follow the Core-main/Apex-main folder conventions for new code (features/<feature>/{screens,components,hooks,utils}).
