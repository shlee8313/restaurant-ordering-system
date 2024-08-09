//file: \app\api\restaurant\route.js

import { NextResponse } from "next/server";
import dbConnect from "../../lib/mongoose";
import Restaurant from "../../models/Restaurant";
// export const dynamic = "force-dynamic";
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
    const restaurant = await Restaurant.findOne({ restaurantId });
    console.log(restaurant);
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    return NextResponse.json(restaurant);
  } catch (error) {
    console.error("Failed to fetch restaurant:", error);
    return NextResponse.json({ error: "Failed to fetch restaurant" }, { status: 500 });
  }
}
