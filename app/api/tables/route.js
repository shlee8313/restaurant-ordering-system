import { NextResponse } from "next/server";
import dbConnect from "../../lib/mongoose";
import Table from "../../models/Table";
import Restaurant from "../../models/Restaurant";
import Order from "../../models/Order";
import { ChevronDownCircle } from "lucide-react";

/**
 *
 */
// GET: 테이블 정보 가져오기
export async function GET(req) {
  try {
    console.log("Received GET request:", req.url);
    const url = new URL(req.url);
    const restaurantId = url.searchParams.get("restaurantId");
    console.log("Extracted restaurantId:", restaurantId);

    if (!restaurantId) {
      console.warn("Missing restaurantId parameter");
      return NextResponse.json({ error: "restaurantId is required" }, { status: 400 });
    }

    await dbConnect();
    let tables = await Table.find({ restaurantId }).sort("tableId").lean();
    console.log("Fetched tables from database:", tables);

    if (tables.length === 0) {
      console.log("No tables found, attempting to create initial tables...");
      try {
        // Uncomment the following line if you have a createInitialTables function
        // tables = await createInitialTables(restaurantId);
        console.log("Initial tables created successfully:", tables);
      } catch (error) {
        console.error("Error in createInitialTables:", error);
      }

      if (tables && tables.length > 0) {
        console.log("Created and fetched new tables:", tables);
      } else {
        console.log("Failed to create initial tables");
      }
    } else {
      console.log("Existing tables found:", tables);
    }

    // Fetch active orders for each table
    const tablesWithOrders = await Promise.all(
      tables.map(async (table) => {
        const activeOrders = await Order.find({
          restaurantId,
          tableId: table.tableId,
          status: { $ne: "completed" },
        }).lean();

        let consolidatedItems = [];
        let totalAmount = 0;
        console.log(activeOrders);
        activeOrders.forEach((order) => {
          order.items.forEach((item) => {
            const existingItem = consolidatedItems.find(
              (i) => i.id === item.id && i.name === item.name && i.price === item.price
            );
            if (existingItem) {
              existingItem.quantity += item.quantity;
            } else {
              consolidatedItems.push({ ...item });
            }
          });
          totalAmount += order.totalAmount;
        });

        const consolidatedOrder =
          activeOrders.length > 0
            ? {
                ...activeOrders[0],
                items: consolidatedItems,
                totalAmount: totalAmount,
                status: activeOrders[activeOrders.length - 1].status, // 가장 최근 주문의 상태 사용
              }
            : null;

        return {
          ...table,
          order: consolidatedOrder,
        };
      })
    );

    console.log("Tables with consolidated active orders:", tablesWithOrders);

    return NextResponse.json(tablesWithOrders);
  } catch (error) {
    console.error("Failed to fetch tables:", error);
    return NextResponse.json({ error: "Failed to fetch tables" }, { status: 500 });
  }
}
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
export async function PATCH(req) {
  try {
    const { restaurantId, tableId, order: updatedOrder, itemId, newStatus } = await req.json();

    if (!restaurantId || !tableId) {
      return NextResponse.json({ error: "restaurantId and tableId are required" }, { status: 400 });
    }

    await dbConnect();

    // 가장 최근의 완료되지 않은 주문을 찾습니다.
    let order = await Order.findOne({
      restaurantId,
      tableId,
      status: { $ne: "completed" },
    }).sort({ createdAt: -1 });

    if (!order) {
      if (!updatedOrder) {
        return NextResponse.json({ error: "No active order found" }, { status: 404 });
      }
      // 새 주문 생성
      order = new Order({
        restaurantId,
        tableId,
        items: updatedOrder.items,
        totalAmount: updatedOrder.totalAmount || 0,
        status: "pending",
      });
    } else {
      // 기존 주문 업데이트
      if (itemId && newStatus) {
        // 개별 항목 상태 업데이트
        const itemIndex = order.items.findIndex((item) => item.id === itemId);
        if (itemIndex !== -1) {
          order.items[itemIndex].status = newStatus;
        }
      } else if (updatedOrder) {
        // 새 항목 추가 또는 기존 항목 업데이트
        updatedOrder.items.forEach((newItem) => {
          const existingItemIndex = order.items.findIndex((item) => item.id === newItem.id);
          if (existingItemIndex !== -1) {
            // 기존 항목 업데이트
            order.items[existingItemIndex] = {
              ...order.items[existingItemIndex],
              ...newItem,
              quantity: order.items[existingItemIndex].quantity + newItem.quantity,
            };
          } else {
            // 새 항목 추가
            order.items.push(newItem);
          }
        });
      }
    }

    // totalAmount 재계산
    order.totalAmount = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 주문 상태 업데이트
    const statusPriority = ["pending", "preparing", "served", "completed"];
    order.status = order.items.reduce((maxStatus, item) => {
      return statusPriority.indexOf(item.status) < statusPriority.indexOf(maxStatus)
        ? item.status
        : maxStatus;
    }, "completed");

    await order.save();
    console.log("Order saved to DB:", order);

    // 테이블 상태 업데이트
    const table = await Table.findOneAndUpdate(
      { restaurantId, tableId },
      { $set: { status: order.status === "completed" ? "empty" : "occupied" } },
      { new: true }
    );

    return NextResponse.json({ message: "Order updated successfully", order, table });
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json(
      { error: "Failed to update order", details: error.message },
      { status: 500 }
    );
  }
}
