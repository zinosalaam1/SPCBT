import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('MongoDB connected');
};

export default connectDB;
