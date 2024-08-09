//file: /api/sales/route.js

import { NextResponse } from "next/server";
import dbConnect from "../../lib/mongoose";
import Order from "../../models/Order";
export const dynamic = "force-dynamic";
export async function GET(req) {
  console.log("Sales API called");

  try {
    await dbConnect();
    console.log("Database connected");

    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    console.log(`Query params: restaurantId=${restaurantId}, month=${month}, year=${year}`);

    if (!restaurantId) {
      console.log("Error: Restaurant ID is missing");
      return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 });
    }

    if (!month || !year) {
      console.log("Error: Month or year is missing");
      return NextResponse.json({ error: "Month and year are required" }, { status: 400 });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    console.log(`Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    const orders = await Order.find({
      restaurantId,
      status: "completed",
      createdAt: { $gte: startDate, $lte: endDate },
    });

    console.log(`Found ${orders.length} orders`);

    const salesData = [];
    for (let i = 1; i <= endDate.getDate(); i++) {
      const date = new Date(year, month - 1, i);
      const dailyOrders = orders.filter(
        (order) => order.createdAt.toDateString() === date.toDateString()
      );

      console.log(`Processing ${date.toISOString().split("T")[0]}: ${dailyOrders.length} orders`);

      const dailySales = dailyOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const items = dailyOrders.reduce((acc, order) => {
        order.items.forEach((item) => {
          if (!acc[item.name]) {
            acc[item.name] = { quantity: 0, sales: 0 };
          }
          acc[item.name].quantity += item.quantity;
          acc[item.name].sales += item.price * item.quantity;
        });
        return acc;
      }, {});

      salesData.push({
        date: date.toISOString().split("T")[0],
        totalSales: dailySales,
        items: Object.entries(items).map(([name, data]) => ({
          name,
          quantity: data.quantity,
          sales: data.sales,
        })),
      });
    }

    console.log("Sales data processed successfully");
    console.log(`Returning ${salesData.length} days of sales data`);

    return NextResponse.json(salesData);
  } catch (error) {
    console.error("Failed to fetch sales data:", error);
    // 스택 트레이스 로깅
    console.error(error.stack);
    return NextResponse.json(
      { error: "Failed to fetch sales data", details: error.message },
      { status: 500 }
    );
  }
}
