//file: \app\api\tables\route.js

import { NextResponse } from "next/server";
import dbConnect from "../../lib/mongoose";
import Table from "../../models/Table";
import Restaurant from "../../models/Restaurant";
import Order from "../../models/Order";
import { ChevronDownCircle } from "lucide-react";
import { ObjectId } from "mongodb"; // 파일 상단에 추가
/**
 *
 */
export const dynamic = "force-dynamic";
// GET: 테이블 정보 가져오기
//
export async function GET(req) {
  try {
    // console.log("Received GET request:", req.url);
    const url = new URL(req.url);
    const restaurantId = url.searchParams.get("restaurantId");
    // console.log("Extracted restaurantId:", restaurantId);

    if (!restaurantId) {
      console.warn("Missing restaurantId parameter");
      return NextResponse.json({ error: "restaurantId is required" }, { status: 400 });
    }

    await dbConnect();
    let tables = await Table.find({ restaurantId }).sort("tableId").lean();
    // console.log("Fetched tables from database:", tables);

    // Fetch active orders for each table
    const tablesWithOrders = await Promise.all(
      tables.map(async (table) => {
        const activeOrders = await Order.find({
          restaurantId,
          tableId: table.tableId,
          status: { $ne: "completed" },
        }).lean();

        // 명시적으로 id 필드 추가
        const ordersWithId = activeOrders.map((order) => ({
          ...order,
          id: order._id.toString(),
        }));

        return {
          ...table,
          orders: ordersWithId,
        };
      })
    );

    // console.log("Tables with active orders:", tablesWithOrders);
    return NextResponse.json(tablesWithOrders);
  } catch (error) {
    console.error("Failed to fetch tables:", error);
    return NextResponse.json({ error: "Failed to fetch tables" }, { status: 500 });
  }
}
/**
 *
 *
 *
 */
// POST: 주문 처리 함수
export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Received POST request with body:", body);
    const { restaurantId, tableId, x, y, width, height, status } = body;
    console.log("Parsed request data:", { restaurantId, tableId, x, y, width, height, status });

    if (!restaurantId || !tableId) {
      console.warn("Invalid request data:", { restaurantId, tableId });
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    await dbConnect();
    console.log("Connected to database");

    const updatedTable = await Table.findOneAndUpdate(
      { restaurantId, tableId },
      {
        restaurantId,
        tableId,
        x,
        y,
        width,
        height,
        status: status || "empty",
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    console.log("Created/Updated table:", updatedTable);
    return NextResponse.json({
      message: "Table created/updated successfully",
      table: updatedTable,
    });
  } catch (error) {
    console.error("Failed to create/update table:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Duplicate table ID for this restaurant" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to create/update table" }, { status: 500 });
  }
}
// PUT: 테이블 정보 전체 업데이트
export async function PUT(req) {
  try {
    const body = await req.json();
    console.log("Received PUT request with body:", body);
    const { restaurantId, tables } = body;
    console.log("Parsed request data:", { restaurantId, tables });

    if (!restaurantId || !tables || !Array.isArray(tables)) {
      console.warn("Invalid request data:", { restaurantId, tables });
      return NextResponse.json(
        { error: "restaurantId and valid tables array are required" },
        { status: 400 }
      );
    }

    await dbConnect();
    console.log("Connected to database");

    await Table.deleteMany({ restaurantId });
    console.log("Deleted existing tables for restaurantId:", restaurantId);

    const tablesWithRestaurantId = tables.map((table) => ({
      ...table,
      restaurantId,
      status: table.status || "empty",
    }));

    await Table.insertMany(tablesWithRestaurantId);
    console.log("Inserted new tables:", tablesWithRestaurantId);

    return NextResponse.json({ message: "Tables updated successfully" });
  } catch (error) {
    console.error("Failed to update tables:", error);
    return NextResponse.json({ error: "Failed to update tables" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    console.log("Received PATCH request body:", body);
    const { restaurantId, tableId, orderId, newStatus } = body;

    if (!restaurantId || !tableId || !orderId || !newStatus) {
      // console.warn("Missing required parameters:", { restaurantId, tableId, orderId, newStatus });
      return NextResponse.json(
        {
          error: "Missing required parameters",
          receivedParams: { restaurantId, tableId, orderId, newStatus },
        },
        { status: 400 }
      );
    }

    await dbConnect();

    // 주문 찾기 및 업데이트
    const order = await Order.findOneAndUpdate(
      { _id: orderId, restaurantId, tableId },
      { $set: { status: newStatus } },
      { new: true }
    );

    if (!order) {
      console.log("Order not found:", { orderId, restaurantId, tableId });
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // console.log("Updated order:", order);

    // 테이블의 모든 주문 가져오기
    const allOrders = await Order.find({ restaurantId, tableId, status: { $ne: "completed" } });

    // 테이블 상태 업데이트
    const tableStatus = allOrders.length > 0 ? "occupied" : "empty";
    const table = await Table.findOneAndUpdate(
      { restaurantId, tableId },
      { $set: { status: tableStatus } },
      { new: true }
    );

    if (!table) {
      console.log("Table not found:", { restaurantId, tableId });
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    // console.log("Updated table:", table);

    // id 필드 명시적 추가
    const responseOrder = {
      ...order.toObject(),
      id: order._id.toString(),
    };

    return NextResponse.json({
      message: "Order updated successfully",
      order: responseOrder,
      table,
    });
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json(
      { error: "Failed to update order", details: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
/**
 *
 */
// PATCH: 개별 테이블 정보 부분 업데이트
// export async function PATCH(req) {
//   try {
//     const { restaurantId, tableId, order: updatedOrder } = await req.json();

//     if (!restaurantId || !tableId || !updatedOrder) {
//       return NextResponse.json(
//         { error: "restaurantId, tableId, and order data are required" },
//         { status: 400 }
//       );
//     }

//     await dbConnect();

//     // 테이블 찾기
//     const table = await Table.findOne({ restaurantId, tableId });
//     if (!table) {
//       return NextResponse.json({ error: "Table not found" }, { status: 404 });
//     }

//     // 주문 찾기 또는 생성
//     let order = await Order.findOne({ restaurantId, tableId, status: { $ne: "completed" } });
//     if (!order) {
//       order = new Order({
//         restaurantId,
//         tableId,
//         ...updatedOrder,
//         totalAmount: updatedOrder.totalAmount || 0, // totalAmount가 없으면 0으로 설정
//       });
//     } else {
//       console.log(updatedOrder);
//       // 주문 업데이트
//       order.items = updatedOrder.items;
//       order.status = updatedOrder.status;
//       order.totalAmount = updatedOrder.totalAmount || 0; // totalAmount가 없으면 0으로 설정
//     }

//     await order.save();

//     // 테이블 상태 업데이트
//     table.status = order.items.length > 0 ? "occupied" : "empty";
//     await table.save();

//     return NextResponse.json({ message: "Order updated successfully", order });
//   } catch (error) {
//     console.error("Failed to update order:", error);
//     return NextResponse.json(
//       { error: "Failed to update order", details: error.message },
//       { status: 500 }
//     );
//   }
// }

/**
 * 오늘
 */
