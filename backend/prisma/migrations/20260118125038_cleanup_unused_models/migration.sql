/*
  Warnings:

  - The values [QUOTE_SENT,QUOTE_ACCEPTED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [DIRECTEUR,CAISSIER_VENTE,GESTIONNAIRE_COMPTABILITE] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `confirmed_at` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `client_id` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `invoice_id` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `supplier_id` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `confirmed_at` on the `truck_assignments` table. All the data in the column will be lost.
  - You are about to drop the `accounting_entries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_reports` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `invoice_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `invoices` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notifications` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quote_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quotes` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PENDING', 'CONFIRMED', 'STOCK_REQUESTED', 'IN_PREPARATION', 'READY', 'DELIVERED', 'ARCHIVED', 'CANCELLED');
ALTER TABLE "public"."orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'GESTIONNAIRE_CLIENTELE', 'GESTIONNAIRE_STOCK', 'GESTIONNAIRE_TRUCKS', 'COMPTABLE');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'GESTIONNAIRE_CLIENTELE';
COMMIT;

-- DropForeignKey
ALTER TABLE "accounting_entries" DROP CONSTRAINT "accounting_entries_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "accounting_entries" DROP CONSTRAINT "accounting_entries_invoice_id_fkey";

-- DropForeignKey
ALTER TABLE "invoice_items" DROP CONSTRAINT "invoice_items_invoice_id_fkey";

-- DropForeignKey
ALTER TABLE "invoice_items" DROP CONSTRAINT "invoice_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_client_id_fkey";

-- DropForeignKey
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_order_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_order_id_fkey";

-- DropForeignKey
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_user_id_fkey";

-- DropForeignKey
ALTER TABLE "quote_items" DROP CONSTRAINT "quote_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "quote_items" DROP CONSTRAINT "quote_items_quote_id_fkey";

-- DropForeignKey
ALTER TABLE "quotes" DROP CONSTRAINT "quotes_client_id_fkey";

-- DropForeignKey
ALTER TABLE "quotes" DROP CONSTRAINT "quotes_order_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_client_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_invoice_id_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_supplier_id_fkey";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "confirmed_at";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "client_id",
DROP COLUMN "invoice_id",
DROP COLUMN "supplier_id";

-- AlterTable
ALTER TABLE "truck_assignments" DROP COLUMN "confirmed_at";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'GESTIONNAIRE_CLIENTELE';

-- DropTable
DROP TABLE "accounting_entries";

-- DropTable
DROP TABLE "daily_reports";

-- DropTable
DROP TABLE "invoice_items";

-- DropTable
DROP TABLE "invoices";

-- DropTable
DROP TABLE "notifications";

-- DropTable
DROP TABLE "quote_items";

-- DropTable
DROP TABLE "quotes";

-- DropEnum
DROP TYPE "AccountingEntryType";

-- DropEnum
DROP TYPE "InvoiceStatus";

-- DropEnum
DROP TYPE "NotificationType";

-- DropEnum
DROP TYPE "QuoteStatus";

-- DropEnum
DROP TYPE "ReportType";

-- RenameIndex
ALTER INDEX "clients_tax_id_key" RENAME TO "clients_id_number_key";

-- RenameIndex
ALTER INDEX "suppliers_tax_id_key" RENAME TO "suppliers_id_number_key";
