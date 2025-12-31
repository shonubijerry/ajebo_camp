import React from "react";
import PaystackPop from "@paystack/inline-js";

const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

interface ProcessPaymentArgs {
  email: string;
  amount: number;
  onSuccess: (transaction: any) => void;
  onCancel: () => void;
  onError: (error: any) => void;
}

export const usePaystackPayment = () => {
  const [paystackReady, setPaystackReady] = React.useState(false);

  const processPayment = ({
    email,
    amount,
    onSuccess,
    onCancel,
    onError,
  }: ProcessPaymentArgs) => {
    if (!paystackReady) {
      onError(new Error("Payment service not ready"));
      return;
    }

    const popup = new PaystackPop();
    popup.newTransaction({
      key: PAYSTACK_PUBLIC_KEY,
      email,
      amount: Math.round(amount * 100),
      onSuccess,
      onCancel,
      onError,
    });
  };

  return { paystackReady, setPaystackReady, processPayment };
};
