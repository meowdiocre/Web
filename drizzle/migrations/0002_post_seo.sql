ALTER TABLE "posts" ADD COLUMN "seo_title" varchar(70);--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "seo_description" varchar(320);--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "canonical_url" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "social_image_url" text;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "social_image_alt" varchar(256);--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "no_index" boolean DEFAULT false NOT NULL;
