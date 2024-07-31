import { NextResponse } from "next/server";
import dbConnect from "../../lib/mongoose";
import Table from "../../models/Table"; // 테이블 모델

// MongoDB 연결
// const connectToDatabase = async () => {
//   if (mongoose.connection.readyState >= 1) {
//     return;
//   }
//   await mongoose.connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });
// };

// GET: 테이블 정보 가져오기
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const restaurantId = url.searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json({ error: "restaurantId is required" }, { status: 400 });
    }

    await connectToDatabase();
    const tables = await Table.find({ restaurantId });
    return NextResponse.json(tables);
  } catch (error) {
    console.error("Failed to fetch tables:", error);
    return NextResponse.json({ error: "Failed to fetch tables" }, { status: 500 });
  }
}

// POST: 테이블 정보 추가
export async function POST(req) {
  try {
    const { restaurantId, tables } = await req.json();

    if (!restaurantId || !tables) {
      return NextResponse.json({ error: "restaurantId and tables are required" }, { status: 400 });
    }

    await connectToDatabase();
    // 기존 테이블 삭제
    await Table.deleteMany({ restaurantId });
    // 새 테이블 추가
    await Table.insertMany(tables);
    return NextResponse.json({ message: "Tables added successfully" });
  } catch (error) {
    console.error("Failed to add tables:", error);
    return NextResponse.json({ error: "Failed to add tables" }, { status: 500 });
  }
}

// PATCH: 테이블 위치 업데이트
export async function PATCH(req) {
  try {
    const { restaurantId, tables } = await req.json();

    if (!restaurantId || !tables) {
      return NextResponse.json({ error: "restaurantId and tables are required" }, { status: 400 });
    }

    await connectToDatabase();
    for (const table of tables) {
      await Table.findOneAndUpdate({ id: table.id, restaurantId }, table, { upsert: true });
    }
    return NextResponse.json({ message: "Tables updated successfully" });
  } catch (error) {
    console.error("Failed to update tables:", error);
    return NextResponse.json({ error: "Failed to update tables" }, { status: 500 });
  }
}
