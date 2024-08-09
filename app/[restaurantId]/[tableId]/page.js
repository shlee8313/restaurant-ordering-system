// app/[restaurantId]/[tableId]/page.js
import dbConnect from "../../lib/mongoose";
import Restaurant from "../../models/Restaurant";
import Table from "../../models/Table";
import ClientMenuPage from "./ClientMenuPage";

export async function generateStaticParams() {
  try {
    await dbConnect();
    const restaurants = await Restaurant.find({ hasTables: true }, "restaurantId");
    const paths = [];

    for (const restaurant of restaurants) {
      const tables = await Table.find({ restaurantId: restaurant.restaurantId }, "tableId");
      const restaurantPaths = tables.map((table) => ({
        restaurantId: restaurant.restaurantId,
        tableId: table.tableId.toString(),
      }));
      paths.push(...restaurantPaths);
    }

    return paths;
  } catch (error) {
    console.error("Failed to fetch restaurants and tables for static paths:", error);
    return [];
  }
}

export default function MenuPage({ params }) {
  return <ClientMenuPage params={params} />;
}
