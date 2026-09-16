ALTER TYPE "public"."role" ADD VALUE 'admin';--> statement-breakpoint
ALTER TABLE "favorites" DROP CONSTRAINT "favorites_user_id_profiles_id_fk";
--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_property" ON "favorites" USING btree ("user_id","property_id");