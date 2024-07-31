import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongoose";
import Order from "../../../models/Order";

export async function GET() {
  try {
    await dbConnect();
    const orders = await Order.find().lean();
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const orderData = await req.json();
    const newOrder = new Order(orderData);
    await newOrder.save();
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    await dbConnect();
    const { orderId, status } = await req.json();
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true, runValidators: true }
    );
    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
