# Pre-existing issues — not part of the recent audit fixes

Found incidentally while verifying unrelated changes. Neither was touched or caused by that work — both predate it. Low effort, safe to pick up independently.

## 1. Missing `Ionicons` import breaks type-check

**File:** `src/features/listings/screens/EquipmentStockScreen.tsx`
**Lines:** 161, 167

`Ionicons` is used but never imported, so `npm run type-check` fails:

```
src/features/listings/screens/EquipmentStockScreen.tsx(161,37): error TS2304: Cannot find name 'Ionicons'.
src/features/listings/screens/EquipmentStockScreen.tsx(167,8): error TS2304: Cannot find name 'Ionicons'.
```

Usage:

```tsx
function Tile({ icon, label, value }: {
  icon: React.ComponentProps<typeof Ionicons>['name'];   // line 161
  ...
}): React.ReactElement {
  return (
    <View style={[styles.tile, cardBackShadow]}>
      <Ionicons name={icon} size={18} color={palette.gold} />   {/* line 167 */}
      ...
```

**Fix:** add the missing import near the top of the file, matching how other screens import it (e.g. `import { Ionicons } from '@expo/vector-icons';`):

```tsx
import { Ionicons } from '@expo/vector-icons';
```

Then confirm `npm run type-check` passes.

## 2. Stray formatting nit

**File:** `src/features/dashboard/screens/ProfileScreen.tsx`
**Line:** 34

`npx eslint src/features/dashboard/screens/ProfileScreen.tsx` reports:

```
34:20  error  Delete `⏎·`  prettier/prettier
```

**Fix:** run `npx prettier --write src/features/dashboard/screens/ProfileScreen.tsx` (or `eslint --fix` on the file) and confirm `npm run lint` is clean on it afterward.
