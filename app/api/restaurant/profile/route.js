//file: \app\api\restaurant\profile\route.js

// import { verifyToken } from "../../lib/jwt";
// import Restaurant from "../../models/Restaurant";
export const dynamic = "force-dynamic";

export default async function handler(req, res) {
  if (req.method === "GET") {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const decoded = verifyToken(token);
      const restaurant = await Restaurant.findById(decoded.restaurantId);

      if (!restaurant) {
        return res.status(404).json({ message: "Restaurant not found" });
      }

      res.status(200).json(restaurant);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  } else {
    res.setHeader("Allow", ["GET"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
