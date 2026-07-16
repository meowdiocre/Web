DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM categories WHERE slug = 'tag') THEN
		RAISE EXCEPTION 'Rename the existing category slug "tag" before applying the tags migration.';
	END IF;
END $$;
--> statement-breakpoint
CREATE TABLE "post_tags" (
	"post_id" uuid NOT NULL,
	"tag_slug" varchar(64) NOT NULL,
	CONSTRAINT "post_tags_post_id_tag_slug_pk" PRIMARY KEY("post_id","tag_slug")
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"slug" varchar(64) PRIMARY KEY NOT NULL,
	"label" varchar(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_tag_slug_tags_slug_fk" FOREIGN KEY ("tag_slug") REFERENCES "public"."tags"("slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "post_tags_tag_slug_idx" ON "post_tags" USING btree ("tag_slug");--> statement-breakpoint
CREATE UNIQUE INDEX "tags_label_lower_unique" ON "tags" USING btree (lower("label"));
