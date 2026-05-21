-- CreateEnum
CREATE TYPE "ClothingCategory" AS ENUM ('TOPS', 'BOTTOMS', 'DRESSES', 'OUTERWEAR', 'SHOES', 'ACCESSORIES', 'OTHER');

-- CreateEnum
CREATE TYPE "ClothingSeason" AS ENUM ('SPRING', 'SUMMER', 'FALL', 'WINTER', 'ALL_SEASON');

-- CreateEnum
CREATE TYPE "ClothingOccasion" AS ENUM ('CASUAL', 'WORK', 'FORMAL', 'SPORT', 'PARTY', 'OTHER');

-- CreateTable
CREATE TABLE "wardrobe_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "ClothingCategory" NOT NULL DEFAULT 'OTHER',
    "season" "ClothingSeason" NOT NULL DEFAULT 'ALL_SEASON',
    "occasion" "ClothingOccasion" NOT NULL DEFAULT 'CASUAL',
    "colors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "brand" TEXT,
    "image_url" TEXT,
    "storage_key" TEXT,
    "last_worn_at" TIMESTAMP(3),
    "needs_laundry" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wardrobe_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_outfits" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "occasion" "ClothingOccasion" NOT NULL DEFAULT 'CASUAL',
    "season" "ClothingSeason" NOT NULL DEFAULT 'ALL_SEASON',
    "ai_notes" TEXT,
    "image_url" TEXT,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saved_outfits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outfit_items" (
    "id" TEXT NOT NULL,
    "outfit_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "outfit_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packing_lists" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "activities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "start_date" TIMESTAMP(3),
    "ai_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packing_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packing_list_items" (
    "id" TEXT NOT NULL,
    "packing_list_id" TEXT NOT NULL,
    "item_id" TEXT,
    "custom_name" TEXT,
    "is_packed" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "packing_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wardrobe_items_user_id_idx" ON "wardrobe_items"("user_id");

-- CreateIndex
CREATE INDEX "wardrobe_items_user_id_category_idx" ON "wardrobe_items"("user_id", "category");

-- CreateIndex
CREATE INDEX "wardrobe_items_user_id_season_idx" ON "wardrobe_items"("user_id", "season");

-- CreateIndex
CREATE INDEX "wardrobe_items_user_id_occasion_idx" ON "wardrobe_items"("user_id", "occasion");

-- CreateIndex
CREATE INDEX "wardrobe_items_user_id_is_active_idx" ON "wardrobe_items"("user_id", "is_active");

-- CreateIndex
CREATE INDEX "saved_outfits_user_id_idx" ON "saved_outfits"("user_id");

-- CreateIndex
CREATE INDEX "saved_outfits_user_id_is_favorite_idx" ON "saved_outfits"("user_id", "is_favorite");

-- CreateIndex
CREATE UNIQUE INDEX "outfit_items_outfit_id_item_id_key" ON "outfit_items"("outfit_id", "item_id");

-- CreateIndex
CREATE INDEX "outfit_items_outfit_id_idx" ON "outfit_items"("outfit_id");

-- CreateIndex
CREATE INDEX "outfit_items_item_id_idx" ON "outfit_items"("item_id");

-- CreateIndex
CREATE INDEX "packing_lists_user_id_idx" ON "packing_lists"("user_id");

-- CreateIndex
CREATE INDEX "packing_lists_user_id_created_at_idx" ON "packing_lists"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "packing_list_items_packing_list_id_idx" ON "packing_list_items"("packing_list_id");

-- AddForeignKey
ALTER TABLE "wardrobe_items" ADD CONSTRAINT "wardrobe_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_outfits" ADD CONSTRAINT "saved_outfits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outfit_items" ADD CONSTRAINT "outfit_items_outfit_id_fkey" FOREIGN KEY ("outfit_id") REFERENCES "saved_outfits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "outfit_items" ADD CONSTRAINT "outfit_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "wardrobe_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packing_lists" ADD CONSTRAINT "packing_lists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packing_list_items" ADD CONSTRAINT "packing_list_items_packing_list_id_fkey" FOREIGN KEY ("packing_list_id") REFERENCES "packing_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "packing_list_items" ADD CONSTRAINT "packing_list_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "wardrobe_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
