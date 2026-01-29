CREATE TABLE "deals" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "deals_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(255) NOT NULL,
	"description" varchar(1000),
	"price" numeric(10, 2) NOT NULL,
	"originalPrice" numeric(10, 2),
	"currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"imageUrl" varchar(500),
	"isExpired" boolean DEFAULT false NOT NULL,
	"isDisabled" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlist" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "wishlist_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userId" integer NOT NULL,
	"dealId" integer NOT NULL,
	"alertEnabled" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "wishlist_userId_dealId_unique" UNIQUE("userId","dealId")
);
--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_dealId_deals_id_fk" FOREIGN KEY ("dealId") REFERENCES "public"."deals"("id") ON DELETE cascade ON UPDATE no action;