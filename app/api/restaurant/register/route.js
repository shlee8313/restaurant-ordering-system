import { NextResponse } from "next/server";
import dbConnect from "../../../lib/mongoose";
import Restaurant from "../../../models/Restaurant";

export async function POST(request) {
  try {
    await dbConnect();

    const {
      email,
      password,
      businessName,
      address,
      phoneNumber,
      businessNumber,
      operatingHours,
      tables,
      restaurantId,
    } = await request.json();
    console.log(
      password,
      businessName,
      address,
      phoneNumber,
      businessNumber,
      operatingHours,
      tables,
      restaurantId
    );
    if (
      !email ||
      !password ||
      !businessName ||
      !businessNumber ||
      !operatingHours ||
      !restaurantId ||
      !tables
    ) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const existingRestaurant = await Restaurant.findOne({ email });
    console.log(existingRestaurant);
    if (existingRestaurant) {
      return NextResponse.json({ message: "Restaurant already exists" }, { status: 400 });
    }

    const newRestaurant = new Restaurant({
      email,
      password,
      businessName,
      address,
      phoneNumber,
      businessNumber,
      operatingHours,
      tables,
      restaurantId,
    });

    await newRestaurant.save();

    return NextResponse.json(
      { message: "Restaurant registered successfully", restaurantId: newRestaurant._id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "An error occurred during registration", error: error.message },
      { status: 500 }
    );
  }
}
