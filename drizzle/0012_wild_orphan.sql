DROP TABLE "password_reset_tokens" CASCADE;--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "password_hash";--> statement-breakpoint
ALTER TABLE "profiles" DROP COLUMN "password_changed_at";