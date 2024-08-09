//file: \app\api\menu\route.js

import { NextResponse } from "next/server";
import dbConnect from "../../lib/mongoose";
import Menu from "../../models/Menu";
export const dynamic = "force-dynamic";
/**
 * 

 */

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const restaurantId = searchParams.get("restaurantId");

  if (!restaurantId) {
    return NextResponse.json({ error: "Restaurant ID is required" }, { status: 400 });
  }

  try {
    await dbConnect();
    const menu = await Menu.findOne({ restaurantId });
    console.log(menu);
    if (!menu) {
      return NextResponse.json({ error: "Menu not found for this restaurant" }, { status: 404 });
    }

    return NextResponse.json(menu);
  } catch (error) {
    console.error("Failed to fetch menu:", error);
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
}
