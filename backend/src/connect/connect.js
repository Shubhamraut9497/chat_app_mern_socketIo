import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();


const connect=async()=>{
  return await mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
  }).then(()=>{
    console.log("DB connected");
  }).catch((err)=>{
    console.log(err);
  })
}
export default connect;