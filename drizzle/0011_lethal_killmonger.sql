ALTER TABLE "profiles" ALTER COLUMN "password_hash" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "auth_user_id" text;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_auth_user_id_unique" UNIQUE("auth_user_id");