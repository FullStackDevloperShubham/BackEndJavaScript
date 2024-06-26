
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js"

const connectDB = async () => {
  try {
    // const connectonInstance = await mongoose.connect(`mongodb+srv://shubham:hSyLy2KB81uZNMWX@shubham.oxxydgc.mongodb.net/${DB_NAME}?retryWrites=true&w=majority&appName=shubham`)
    const connectonInstance = await mongoose.connect(`mongodb+srv://shubham:hSyLy2KB81uZNMWX@shubham.oxxydgc.mongodb.net/`)
    console.log('connected to mongodb')
  } catch (error) {
    console.log("error to connect to mongodb", error.message)
    process.exit(1)
  }
}
export default connectDB