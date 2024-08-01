import { NextResponse } from "next/server";
import dbConnect from "../../lib/mongoose";
import Table from "../../models/Table";

// GET: 테이블 정보 가져오기
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const restaurantId = url.searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json({ error: "restaurantId is required" }, { status: 400 });
    }

    await dbConnect();
    const tables = await Table.find({ restaurantId }).sort("tableId");
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

    if (!restaurantId || !tables || !Array.isArray(tables)) {
      return NextResponse.json(
        { error: "restaurantId and valid tables array are required" },
        { status: 400 }
      );
    }

    await dbConnect();
    // 기존 테이블 삭제
    await Table.deleteMany({ restaurantId });

    // 새 테이블 추가
    const tablesWithRestaurantId = tables.map((table) => ({
      ...table,
      restaurantId,
      status: table.status || "empty", // 기본값 설정
    }));

    await Table.insertMany(tablesWithRestaurantId);
    return NextResponse.json({ message: "Tables added successfully" });
  } catch (error) {
    console.error("Failed to add tables:", error);
    return NextResponse.json({ error: "Failed to add tables" }, { status: 500 });
  }
}

// PUT: 테이블 정보 전체 업데이트
export async function PUT(req) {
  try {
    const { restaurantId, tables } = await req.json();

    if (!restaurantId || !tables || !Array.isArray(tables)) {
      return NextResponse.json(
        { error: "restaurantId and valid tables array are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // 기존 테이블 삭제 후 새로운 테이블로 대체
    await Table.deleteMany({ restaurantId });

    const tablesWithRestaurantId = tables.map((table) => ({
      ...table,
      restaurantId,
      status: table.status || "empty", // 기본값 설정
    }));

    await Table.insertMany(tablesWithRestaurantId);
    return NextResponse.json({ message: "Tables updated successfully" });
  } catch (error) {
    console.error("Failed to update tables:", error);
    return NextResponse.json({ error: "Failed to update tables" }, { status: 500 });
  }
}

// PATCH: 개별 테이블 정보 부분 업데이트
export async function PATCH(req) {
  try {
    const { restaurantId, table } = await req.json();

    if (!restaurantId || !table || !table.id) {
      return NextResponse.json(
        { error: "restaurantId and table with id are required" },
        { status: 400 }
      );
    }

    await dbConnect();
    const updatedTable = await Table.findOneAndUpdate(
      { restaurantId, id: table.id },
      { $set: { ...table, restaurantId } },
      { new: true, upsert: true }
    );

    if (!updatedTable) {
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Table updated successfully", table: updatedTable });
  } catch (error) {
    console.error("Failed to update table:", error);
    return NextResponse.json({ error: "Failed to update table" }, { status: 500 });
  }
}
