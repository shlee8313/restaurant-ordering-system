import { NextResponse } from "next/server";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("Restaurant");

    const orders = await db.collection("orders").find().toArray();
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { restaurantId, tableId, items, status } = await req.json();

    const client = await clientPromise;
    const db = client.db("Restaurant");

    const order = {
      restaurantId,
      tableId,
      items,
      status,
      createdAt: new Date(),
    };
    console.log("=======order=========", order);
    const result = await db.collection("orders").insertOne(order);
    const insertedOrder = await db.collection("orders").findOne({ _id: result.insertedId });

    return NextResponse.json(insertedOrder, { status: 201 });
  } catch (error) {
    console.error("Failed to create order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { orderId, status } = await req.json();

    const client = await clientPromise;
    const db = client.db("restaurantDB");

    const result = await db
      .collection("orders")
      .updateOne({ _id: new ObjectId(orderId) }, { $set: { status } });

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updatedOrder = await db.collection("orders").findOne({ _id: new ObjectId(orderId) });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
