import { NextResponse } from "next/server";
import dbConnect from "../../lib/mongoose";
import Table from "../../models/Table";
import Restaurant from "../../models/Restaurant";

// 초기 테이블 생성 함수
// async function createInitialTables(restaurantId) {
//   try {
//     console.log("Starting creation of initial tables for restaurantId:", restaurantId);
//     const initialTables = [
//       { restaurantId, tableId: 1, x: 50, y: 50, width: 100, height: 100, status: "empty" },
//       { restaurantId, tableId: 2, x: 200, y: 50, width: 100, height: 100, status: "empty" },
//       { restaurantId, tableId: 3, x: 350, y: 50, width: 150, height: 100, status: "empty" },
//       { restaurantId, tableId: 4, x: 50, y: 200, width: 150, height: 100, status: "empty" },
//       { restaurantId, tableId: 5, x: 250, y: 200, width: 200, height: 100, status: "empty" },
//       { restaurantId, tableId: 6, x: 50, y: 350, width: 400, height: 50, status: "empty" },
//     ];

//     console.log("Attempting to create tables:", initialTables);

//     const createdTables = await Promise.all(
//       initialTables.map(async (table) => {
//         try {
//           const result = await Table.findOneAndUpdate(
//             { restaurantId: table.restaurantId, tableId: table.tableId },
//             table,
//             { upsert: true, new: true, runValidators: true }
//           );
//           console.log(`Table ${table.tableId} created/updated successfully`);
//           return result;
//         } catch (err) {
//           console.error(`Error creating/updating table ${table.tableId}:`, err);
//           return null;
//         }
//       })
//     );

//     const validTables = createdTables.filter((table) => table !== null);
//     console.log("Successfully created/updated tables:", validTables);
//     return validTables;
//   } catch (error) {
//     console.error("Error in createInitialTables:", error);
//     throw error;
//   }
// }
// GET: 테이블 정보 가져오기
export async function GET(req) {
  try {
    console.log("Received GET request:", req.url);
    const url = new URL(req.url);
    const restaurantId = url.searchParams.get("restaurantId");
    console.log("Extracted restaurantId:", restaurantId);

    if (!restaurantId) {
      console.warn("Missing restaurantId parameter");
      return NextResponse.json({ error: "restaurantId is required" }, { status: 400 });
    }

    await dbConnect();
    let tables = await Table.find({ restaurantId }).sort("tableId");
    console.log("Fetched tables from database:", tables);

    if (tables.length === 0) {
      console.log("No tables found, attempting to create initial tables...");
      try {
        // tables = await createInitialTables(restaurantId);
        console.log("Initial tables created successfully:", tables);
      } catch (error) {
        console.error("Error in createInitialTables:", error);
      }

      if (tables && tables.length > 0) {
        console.log("Created and fetched new tables:", tables);
      } else {
        console.log("Failed to create initial tables");
      }
    } else {
      console.log("Existing tables found:", tables);
    }

    return NextResponse.json(tables);
  } catch (error) {
    console.error("Failed to fetch tables:", error);
    return NextResponse.json({ error: "Failed to fetch tables" }, { status: 500 });
  }
}

// POST: 주문 처리 함수
export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Received POST request with body:", body);
    const { restaurantId, tableId, x, y, width, height, status } = body;
    console.log("Parsed request data:", { restaurantId, tableId, x, y, width, height, status });

    if (!restaurantId || !tableId) {
      console.warn("Invalid request data:", { restaurantId, tableId });
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 });
    }

    await dbConnect();
    console.log("Connected to database");

    const updatedTable = await Table.findOneAndUpdate(
      { restaurantId, tableId },
      {
        restaurantId,
        tableId,
        x,
        y,
        width,
        height,
        status: status || "empty",
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    console.log("Created/Updated table:", updatedTable);
    return NextResponse.json({
      message: "Table created/updated successfully",
      table: updatedTable,
    });
  } catch (error) {
    console.error("Failed to create/update table:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "Duplicate table ID for this restaurant" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Failed to create/update table" }, { status: 500 });
  }
}
// PUT: 테이블 정보 전체 업데이트
export async function PUT(req) {
  try {
    const body = await req.json();
    console.log("Received PUT request with body:", body);
    const { restaurantId, tables } = body;
    console.log("Parsed request data:", { restaurantId, tables });

    if (!restaurantId || !tables || !Array.isArray(tables)) {
      console.warn("Invalid request data:", { restaurantId, tables });
      return NextResponse.json(
        { error: "restaurantId and valid tables array are required" },
        { status: 400 }
      );
    }

    await dbConnect();
    console.log("Connected to database");

    await Table.deleteMany({ restaurantId });
    console.log("Deleted existing tables for restaurantId:", restaurantId);

    const tablesWithRestaurantId = tables.map((table) => ({
      ...table,
      restaurantId,
      status: table.status || "empty",
    }));

    await Table.insertMany(tablesWithRestaurantId);
    console.log("Inserted new tables:", tablesWithRestaurantId);

    return NextResponse.json({ message: "Tables updated successfully" });
  } catch (error) {
    console.error("Failed to update tables:", error);
    return NextResponse.json({ error: "Failed to update tables" }, { status: 500 });
  }
}

// PATCH: 개별 테이블 정보 부분 업데이트
export async function PATCH(req) {
  try {
    const body = await req.json();
    console.log("Received PATCH request with body:", body);
    const { restaurantId, table } = body;
    console.log("Parsed request data:", { restaurantId, table });

    if (!restaurantId || !table || !table.id) {
      console.warn("Invalid request data:", { restaurantId, table });
      return NextResponse.json(
        { error: "restaurantId and table with id are required" },
        { status: 400 }
      );
    }

    await dbConnect();
    console.log("Connected to database");

    const updatedTable = await Table.findOneAndUpdate(
      { restaurantId, id: table.id },
      { $set: { ...table, restaurantId } },
      { new: true, upsert: true }
    );

    if (!updatedTable) {
      console.warn("Table not found for updating:", { restaurantId, table });
      return NextResponse.json({ error: "Table not found" }, { status: 404 });
    }

    console.log("Updated table:", updatedTable);
    return NextResponse.json({ message: "Table updated successfully", table: updatedTable });
  } catch (error) {
    console.error("Failed to update table:", error);
    return NextResponse.json({ error: "Failed to update table" }, { status: 500 });
  }
}
