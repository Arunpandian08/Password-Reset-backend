import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const connectDB = async () => {
  const mongoURL = process.env.MONGODBCONNECTIONSTRING;
  console.log("Connecting mongoDB...");
  try {
    const connection = await mongoose.connect(mongoURL);
    console.log("MongoDB is connected...");
  } catch (error) {
    console.log("Cannot connected with mongoDB", error);
  }
};
export default connectDB;
