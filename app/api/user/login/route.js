import { signToken } from "../../lib/jwt";
import User from "../../models/User";

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });

      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = signToken(user._id);
      res.status(200).json({ token, user });
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
