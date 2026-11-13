-- 13 Nov 2026: edition alerts moved to Google Cloud Run (cloudrun/, service ffmpa-newsroom).
-- Cloud Scheduler job ffmpa-notify-edition (asia-south1) calls POST /tasks/notify every 10 minutes.
-- The old Supabase pg_cron sender was switched off with:
select cron.unschedule('notify-edition');
-- To fall back to the Supabase Edge Function, re-run the cron.schedule block in backend/push.sql
-- and pause the Cloud Scheduler job.
