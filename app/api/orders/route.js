import { NextResponse } from "next/server";
import dbConnect from "../../lib/mongoose";
import Order from "../../models/Order";
import Restaurant from "../../models/Restaurant";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 });
    }

    // 수정: 주문을 최신순으로 정렬
    const orders = await Order.find({ restaurantId }).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();

  try {
    const orderData = await request.json();
    console.log(orderData);
    // Calculate total amount
    const totalAmount = orderData.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    // Prepare order data according to the schema
    const orderForSaving = {
      restaurantId: orderData.restaurantId,
      tableId: orderData.tableId,
      items: orderData.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      status: orderData.status,
      totalAmount,
    };
    console.log(orderForSaving);
    const newOrder = new Order(orderForSaving);
    // console.log(newOrder);
    const savedOrder = await newOrder.save();
    console.log(savedOrder);
    // Emit socket event for new order
    // const io = new Server(res.socket.server);
    // io.to(orderData.restaurantId).emit("newOrder", savedOrder);

    return NextResponse.json(savedOrder, { status: 201 });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  await dbConnect();

  try {
    const { orderId } = params;
    const { status } = await request.json();

    const updatedOrder = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
