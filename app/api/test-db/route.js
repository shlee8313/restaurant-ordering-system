import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";
/**
 *
 */
// export const dynamic = "force-dynamic";
export async function GET() {
  try {
    console.log("API오냐====================");
    const client = await clientPromise;
    const db = client.db("Restaurant");

    // 간단한 쿼리 실행
    const collection = db.collection("menu");
    const result = await collection.find({}).limit(1).toArray();

    return NextResponse.json({
      message: "Successfully connected to MongoDB",
      data: result,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to connect to MongoDB" }, { status: 500 });
  }
}
