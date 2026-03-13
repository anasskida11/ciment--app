/*
  Warnings:

  - A unique constraint covering the columns `[order_id,truck_id]` on the table `truck_assignments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `quantity` to the `truck_assignments` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "truck_assignments_order_id_key";

-- AlterTable
ALTER TABLE "truck_assignments" ADD COLUMN     "quantity" DECIMAL(10,2) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "truck_assignments_order_id_truck_id_key" ON "truck_assignments"("order_id", "truck_id");
