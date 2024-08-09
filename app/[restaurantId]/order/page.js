import NoTableMenuPage from "./NoTableMenuPage";
import dbConnect from "../../lib/mongoose";
import Restaurant from "../../models/Restaurant";

export async function generateStaticParams() {
  await dbConnect();
  const restaurants = await Restaurant.find({}, "restaurantId");

  return restaurants.map((restaurant) => ({
    restaurantId: restaurant.restaurantId.toString(),
  }));
}

export default function Page({ params }) {
  return <NoTableMenuPage params={params} />;
}
