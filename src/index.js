// require('dotenv').config({ path: './' })
import dotenv from 'dotenv';
import connectDB from "./db/index.js";
import { app } from './app.js'
dotenv.config({
  path: './env'
})

const PORT = 8000

connectDB()


app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
})
























// (async () => {
//   try {
//     await mongoose.connect(`${ process.env.MONGODB_URI } / ${ DB_NAME }`)
//   } catch (error) {
//     console.log(error);
//   }
// })()

