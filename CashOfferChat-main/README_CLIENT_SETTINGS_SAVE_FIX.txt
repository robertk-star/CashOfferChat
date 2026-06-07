CashOfferChat client settings save fix

Apply this ZIP at the active project root. Do not place these files inside nested folders such as CashOfferChat-main/CashOfferChat-main, coc_combined_fix, or temp_extract.

Updated files:
- src/app/api/client/settings/route.ts
- src/app/client/settings/page.tsx

Purpose:
- Shows exact save errors instead of the generic "Settings could not be saved."
- Handles duplicate business_settings rows without failing.
- Updates every settings row for the client business so the widget cannot keep reading stale settings.
- Inserts singleton_key on new settings rows for older databases that still have the original singleton column.

SQL migration needed: No new SQL for this code fix.
Recommended SQL check: sql/017_multibusiness_settings_fix.sql should already be applied.
Vercel ENV needed: No new variables.
