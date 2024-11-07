-- CreateEnum
CREATE TYPE "PaymentStatuses" AS ENUM ('Pending', 'Confirmed', 'Failed');

-- CreateEnum
CREATE TYPE "PaymentSystems" AS ENUM ('Paypal', 'Stripe');

-- CreateEnum
CREATE TYPE "AccountTypes" AS ENUM ('Business', 'Personal');

-- CreateTable
CREATE TABLE "payment_transactions" (
    "price" INTEGER NOT NULL,
    "status" "PaymentStatuses" NOT NULL DEFAULT 'Pending',
    "paymentSystem" "PaymentSystems" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentSystemData" JSONB NOT NULL,
    "confirmPaymentSystemData" JSONB,
    "orderId" TEXT NOT NULL,

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("orderId")
);

-- CreateTable
CREATE TABLE "subscription_orders" (
    "id" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "subscriptionType" TEXT NOT NULL,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "dateOfPayments" TIMESTAMP(3),
    "endDateOfSubscription" TIMESTAMP(3),
    "expireAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "subscription_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_account_type" (
    "accountType" "AccountTypes" NOT NULL DEFAULT 'Personal',
    "autoRenewal" BOOLEAN NOT NULL DEFAULT false,
    "expireAt" TIMESTAMP(3),
    "nextPayment" TIMESTAMP(3),
    "userId" INTEGER NOT NULL,

    CONSTRAINT "user_account_type_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_orderId_key" ON "payment_transactions"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "user_account_type_userId_key" ON "user_account_type"("userId");

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "subscription_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_orders" ADD CONSTRAINT "subscription_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_account_type" ADD CONSTRAINT "user_account_type_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
