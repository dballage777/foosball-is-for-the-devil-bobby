-- =====================================================================
-- 0007_fix_studies_select.sql — Let a study's owner always read it.
--
-- The original studies_select policy relied on membership (added by an
-- AFTER-INSERT trigger). Immediately after creating a study, reading the row
-- back through RLS could fail due to trigger/visibility timing. Adding
-- `owner_id = auth.uid()` makes the owner's own study always readable.
-- Idempotent: safe to re-run.
-- =====================================================================

drop policy if exists studies_select on bible_studies;
create policy studies_select on bible_studies
  for select to authenticated
  using (
    owner_id = auth.uid()
    or privacy = 'public'
    or is_study_member(id, auth.uid())
  );
