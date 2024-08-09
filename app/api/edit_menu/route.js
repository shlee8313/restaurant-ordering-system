//file: \app\api\edit_menu\route.js

import { NextResponse } from "next/server";
import dbConnect from "../../lib/mongoose";
import Menu from "../../models/Menu";
import Restaurant from "../../models/Restaurant";
import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET_KEY; // Ensure you have this in your environment variables
// export const dynamic = "force-dynamic";
export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);

    const restaurantId = searchParams.get("restaurantId");

    console.log(restaurantId);
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // const token = authHeader.split(" ")[1];
    // const decoded = jwt.verify(token, SECRET_KEY);

    // if (decoded.restaurantId !== restaurantId) {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    const menu = await Menu.findOne({ restaurantId });
    console.log(menu);
    if (!menu) {
      return NextResponse.json({ error: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json(menu);
  } catch (error) {
    console.error("Failed to fetch menu:", error);
    return NextResponse.json({ error: "Failed to fetch menu" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    await dbConnect();
    const menuData = await req.json();
    const { restaurantId, categories } = menuData;
    console.log(restaurantId, categories);
    const authHeader = req.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // const token = authHeader.split(" ")[1];
    // const decoded = jwt.verify(token, SECRET_KEY);

    // if (decoded.restaurantId !== restaurantId) {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

    if (!restaurantId || !categories) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const restaurant = await Restaurant.findOne({ restaurantId });
    console.log(restaurant);
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    let menu = await Menu.findOne({ restaurantId });
    console.log(menu);
    if (menu) {
      menu.categories = categories;
      await menu.save();
    } else {
      menu = new Menu({ restaurantId, categories });
      await menu.save();
    }

    return NextResponse.json(menu);
  } catch (error) {
    console.error("Failed to update menu:", error);
    return NextResponse.json({ error: "Failed to update menu" }, { status: 500 });
  }
}
