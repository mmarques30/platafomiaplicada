

# Fix: Mentorados Business Parceria not appearing in Mentoria Business

## Problem
Line 48 of `MentoriaBusinessPage.tsx` filters users by `plano_mentoria === "business"`, but after the plan renaming, the correct value is `"business_parceria"`. Users with role "mentorado" and plan "business_parceria" are excluded from the list.

## Fix
Update the filter on line 48 to include `"business_parceria"`:

```typescript
const users = allUsers.filter(u => 
  u.plano_mentoria === "business_parceria" || 
  u.plano_mentoria === "business" ||  // legacy fallback
  u.roles.includes("parceiros")
);
```

Single line change in `src/pages/admin/mentoria/MentoriaBusinessPage.tsx`.

