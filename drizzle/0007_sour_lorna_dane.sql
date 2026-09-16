ALTER TABLE "properties" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
-- Backfill: without this every pre-existing row would claim it was modified
-- at migration time, which is exactly the false lastModified that sitemap.xml
-- was reporting before.
UPDATE "properties" SET "updated_at" = "created_at" WHERE "created_at" IS NOT NULL;--> statement-breakpoint
CREATE INDEX "admin_actions_created_at_idx" ON "admin_actions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "leads_created_at_idx" ON "leads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "properties_active_created_idx" ON "properties" USING btree ("status","deleted_at","created_at");--> statement-breakpoint
CREATE INDEX "properties_active_price_idx" ON "properties" USING btree ("status","deleted_at","price");--> statement-breakpoint
CREATE INDEX "properties_city_idx" ON "properties" USING btree ("city");--> statement-breakpoint
CREATE INDEX "properties_type_idx" ON "properties" USING btree ("type");--> statement-breakpoint
CREATE INDEX "properties_agent_id_idx" ON "properties" USING btree ("agent_id");--> statement-breakpoint
CREATE INDEX "property_images_property_id_idx" ON "property_images" USING btree ("property_id");