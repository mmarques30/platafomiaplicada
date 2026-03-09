

# Fix: Environment label should show "Business" not "Business Parceria"

The environment selector and switcher display "Business Parceria" as the label, but the user wants it to simply say "Business" at this level — the internal distinction between parceria/sistemas is handled elsewhere.

## Change

**File: `src/contexts/EnvironmentContext.tsx`** (line 48)
- Change `label: "Business Parceria"` to `label: "Business"`

This single change propagates to both the `EnvironmentSelector` page and the `EnvironmentSwitcher` dropdown since they both read from `ENVIRONMENT_CONFIG`.

