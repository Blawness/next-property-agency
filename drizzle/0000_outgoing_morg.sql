CREATE TYPE "public"."listing_type" AS ENUM('jual', 'sewa');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('rumah', 'apartemen', 'tanah', 'ruko');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('buyer', 'agent');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('active', 'sold', 'rented');--> statement-breakpoint
CREATE TABLE "favorites" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"property_id" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"full_name" text NOT NULL,
	"phone" text,
	"role" "role" DEFAULT 'buyer',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "profiles_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"price" numeric(15, 0) NOT NULL,
	"type" "property_type" NOT NULL,
	"listing_type" "listing_type" NOT NULL,
	"city" text NOT NULL,
	"address" text,
	"lat" numeric(10, 7),
	"lng" numeric(10, 7),
	"land_area" integer,
	"building_area" integer,
	"bedrooms" integer,
	"bathrooms" integer,
	"agent_id" text,
	"status" "status" DEFAULT 'active',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "property_images" (
	"id" text PRIMARY KEY NOT NULL,
	"property_id" text,
	"url" text NOT NULL,
	"is_primary" boolean DEFAULT false,
	"order" integer DEFAULT 0
);
--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_agent_id_profiles_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_images" ADD CONSTRAINT "property_images_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;