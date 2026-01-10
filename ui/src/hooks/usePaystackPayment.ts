import React from "react"

interface PaystackTransaction {
  reference?: string
  [key: string]: unknown
}

interface ProcessPaymentArgs {
  email: string
  amount: number
  onSuccess: (transaction: PaystackTransaction | unknown) => void
  onCancel: () => void
  onError: (error: unknown) => void
}

type PaystackInline = new () => {
  newTransaction(args: {
    key: string
    email: string
    amount: number
    onSuccess: (t: unknown) => void
    onCancel: () => void
    onError: (e: unknown) => void
  }): void
}

export const usePaystackPayment = () => {
  const [paystackReady, setPaystackReady] = React.useState(false)
  const paystackRef = React.useRef<PaystackInline | null>(null)

  React.useEffect(() => {
    let cancelled = false

    // Lazy-load Paystack on the client to avoid SSR window access.
    const loadPaystack = async () => {
      if (typeof window === "undefined") return

      try {
        const paystackModule = await import("@paystack/inline-js")
        if (!cancelled) {
          paystackRef.current = paystackModule.default
          setPaystackReady(true)
        }
      } catch (error) {
        console.error("Failed to load Paystack", error)
      }
    }

    loadPaystack()

    return () => {
      cancelled = true
    }
  }, [])

  const processPayment = ({
    email,
    amount,
    onSuccess,
    onCancel,
    onError,
  }: ProcessPaymentArgs) => {
    if (!paystackReady || !paystackRef.current) {
      onError(new Error("Payment service not ready"))
      return
    }

    if (typeof window === "undefined") {
      onError(new Error("Payment can only be initiated in the browser"))
      return
    }

    const PaystackPop = paystackRef.current!
    const popup = new PaystackPop()
    popup.newTransaction({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "",
      email,
      amount: Math.round(amount * 100),
      onSuccess,
      onCancel,
      onError,
    })
  }

  return { paystackReady, setPaystackReady, processPayment }
}
