import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const cors = { headers: { "Access-Control-Allow-Origin": "*" } };

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: cors.headers });
}

export async function POST(request: Request) {
  try {
    const { reference } = await request.json();
    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400, ...cors }
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey || secretKey.includes("YOUR_PAYSTACK")) {
      return NextResponse.json(
        { error: "Paystack secret key not configured" },
        { status: 500, ...cors }
      );
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${secretKey}` },
      }
    );
    const data = await response.json();

    if (data.status && data.data?.status === "success") {
      return NextResponse.json(
        { success: true, verified: true, data: data.data },
        cors
      );
    }
    return NextResponse.json(
      { success: false, verified: false, message: "Payment not verified" },
      cors
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      {
        error: "Verification failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500, ...cors }
    );
  }
}
