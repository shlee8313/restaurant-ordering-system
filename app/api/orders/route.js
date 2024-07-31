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

export async function POST(req) {
  // 추가: 로깅 추가
  console.log("POST request received at /api/orders");
  try {
    await dbConnect();
    const orderData = await req.json();
    // 추가: 받은 주문 데이터 로깅
    console.log("Received order data:", orderData);

    const { restaurantId, tableId, items } = orderData;

    // 수정: 입력 데이터 검증 강화
    if (!restaurantId || !tableId || !items || items.length === 0) {
      console.log("Invalid order data");
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 추가: 레스토랑 존재 여부 확인
    const restaurant = await Restaurant.findOne({ restaurantId });
    if (!restaurant) {
      console.log("Restaurant not found:", restaurantId);
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const newOrder = new Order(orderData);
    await newOrder.save();
    // 추가: 새 주문 저장 로깅
    console.log("New order saved:", newOrder._id);

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json(
      { error: "Failed to create order", details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(req) {
  try {
    await dbConnect();
    const { orderId, status } = await req.json();
    // 수정: 주문 상태 업데이트 시 유효성 검사 추가
    if (!["pending", "preparing", "completed", "canceled"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
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
