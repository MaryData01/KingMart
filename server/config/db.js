import mongoose from 'mongoose';

const connectDB = async () => {
  const defaultUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/kingsmart';
  
  try {
    console.log(`Connecting to MongoDB at: ${defaultUri}`);
    await mongoose.connect(defaultUri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export const closeDatabase = async () => {
  await mongoose.disconnect();
};

export default connectDB;
