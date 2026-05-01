import mongoose from "mongoose";
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "Username is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true
  },
  password: {
    type: String,
    required: [true, "Password is required"],
  },
  isVerified:{
    type: Boolean,
    default: false
  },
  // verificationToken:{
  //   type: String,
  // },
  // verificationTokenExpire:{
  //   type: Date
  // },
  // refreshToken: {
  //   type: String,
  //   default: null
  // },


}, { timestamps: true });

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});



export default mongoose.model("User", userSchema);