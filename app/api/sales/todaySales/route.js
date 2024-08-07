//file: \app\api\sales\todaySales\route.js

import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongoose";
import Order from "../../../models/Order";

export async function GET(req) {
  console.log("Sales API called for today's total sales");

  try {
    await dbConnect();
    console.log("Database connected");

    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");

    console.log(`Query params: restaurantId=${restaurantId}`);

    if (!restaurantId) {
      console.log("Error: Restaurant ID is missing");
      return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 });
    }

    // 오늘 날짜 범위 설정 (로컬 시간 기준)
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
      999
    );

    console.log(`Date range: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);

    const todayOrders = await Order.find({
      restaurantId,
      status: "completed",
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    console.log(`Found ${todayOrders.length} orders for today`);

    const totalSales = todayOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    console.log(`Today's total sales: ${totalSales}`);

    return NextResponse.json({
      date: startOfDay.toISOString().split("T")[0],
      totalSales,
    });
  } catch (error) {
    console.error("Failed to fetch today's sales data:", error);
    console.error(error.stack);
    return NextResponse.json(
      { error: "Failed to fetch today's sales data", details: error.message },
      { status: 500 }
    );
  }
}
