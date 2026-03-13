-- AlterTable
ALTER TABLE "truck_assignments" ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "delivery_cost" DECIMAL(10,2),
ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "is_active" SET DEFAULT false;
