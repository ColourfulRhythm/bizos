export async function verifyPayment(reference: string): Promise<boolean> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey || secretKey.includes("YOUR_PAYSTACK")) return false;
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    { headers: { Authorization: `Bearer ${secretKey}` } }
  );
  if (!res.ok) return false;
  const data = await res.json();
  return !!(data.status && data.data?.status === "success");
}
