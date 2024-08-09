// file: app/api/quick-order/route.js
// 테이블 있는 식당에서 손님이 주문하게
import { NextResponse } from "next/server";
import dbConnect from "../../lib/mongoose";
import Order from "../../models/Order";
import Restaurant from "../../models/Restaurant";
/**
 *
 */
export const dynamic = "force-dynamic";
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");
    const date = searchParams.get("date");
    console.log(restaurantId, date);
    if (!restaurantId) {
      return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 });
    }

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const orders = await Order.find({
        restaurantId,
        status: "completed",
        createdAt: { $gte: startOfDay, $lt: endOfDay },
      });

      const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      return NextResponse.json({ date, totalSales });
    } else {
      const activeOrders = await Order.find({
        restaurantId,
        status: { $ne: "completed" },
      }).sort({ createdAt: 1 });
      return NextResponse.json(activeOrders);
    }
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();

  try {
    const orderData = await request.json();
    console.log("Received order data:", orderData);

    const totalAmount = orderData.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const restaurant = await Restaurant.findOne({ restaurantId: orderData.restaurantId });
    if (!restaurant) {
      console.error("Restaurant not found:", orderData.restaurantId);
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const orderForSaving = {
      restaurantId: orderData.restaurantId,
      items: orderData.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      status: orderData.status,
      totalAmount,
    };

    const newOrder = new Order(orderForSaving);
    const savedOrder = await newOrder.save();
    console.log("New order created:", savedOrder);

    return NextResponse.json(savedOrder, { status: 201 });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function PATCH(request) {
  await dbConnect();

  try {
    const body = await request.json();
    const { orderId, newStatus } = body;
    console.log("Updating order status:", orderId, newStatus);

    const order = await Order.findByIdAndUpdate(
      orderId,
      { $set: { status: newStatus } },
      { new: true }
    );

    if (!order) {
      console.error("Order not found:", orderId);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updatedQueue = await Order.find({
      restaurantId: order.restaurantId,
      status: { $in: ["pending", "preparing"] },
    }).sort("createdAt");

    console.log("Order updated:", order);
    console.log("Updated queue length:", updatedQueue.length);

    return NextResponse.json({ message: "Order updated", order, updatedQueue });
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
