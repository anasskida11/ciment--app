-- AlterTable
ALTER TABLE "clients" DROP COLUMN IF EXISTS "address",
DROP COLUMN IF EXISTS "city",
DROP COLUMN IF EXISTS "postal_code";

-- RenameColumn
ALTER TABLE "clients" RENAME COLUMN "tax_id" TO "id_number";
