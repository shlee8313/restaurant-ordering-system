//file: \app\api\restaurant\login\route.js

import { NextResponse } from "next/server";
import { generateToken } from "../../../lib/jwt";
import dbConnect from "../../../lib/mongoose";
import Restaurant from "../../../models/Restaurant";
import bcrypt from "bcrypt";
/**
 *
 */
// export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    await dbConnect();

    const { restaurantId, password } = await req.json();
    console.log(restaurantId, password);

    const restaurant = await Restaurant.findOne({ restaurantId });
    console.log(restaurant);

    if (!restaurant) {
      return NextResponse.json({ message: "Invalid restaurantId or password" }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, restaurant.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid restaurantId or password" }, { status: 401 });
    }

    // 토큰 생성
    const token = generateToken({ restaurantId: restaurant.restaurantId, _id: restaurant._id });

    // 비밀번호 필드 제거
    const restaurantObject = restaurant.toObject();
    delete restaurantObject.password;

    // 토큰과 레스토랑 정보 응답
    return NextResponse.json({ token, restaurant: restaurantObject }, { status: 200 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ message: "An error occurred" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 405,
    headers: { Allow: "POST" },
  });
}
