import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();

    // Fetch all users
    const users = await db.collection("users").find({}).toArray();

    // Fetch accounts if you also want Google login details
    const accounts = await db.collection("accounts").find({}).toArray();

    return NextResponse.json({
      success: true,
      users,
      accounts,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
