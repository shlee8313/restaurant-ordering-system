import mongoose from "mongoose";
import bcrypt from "bcrypt";

const restaurantSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    restaurantId: { type: String, required: true, unique: true },
    businessName: { type: String, required: true },
    address: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    businessNumber: { type: String, required: true },
    operatingHours: { type: String, required: true },
    tables: { type: Number, required: true },
  },
  { collection: "restaurants" }
); // 여기서 컬렉션 이름을 지정합니다.

// 비밀번호 암호화 전후 처리
restaurantSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 비밀번호 비교 메서드
restaurantSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

const Restaurant = mongoose.models.Restaurant || mongoose.model("Restaurant", restaurantSchema);

export default Restaurant;
