import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env['MONGO_URI'] || 'mongodb://localhost:27017/mern-chat-app';
    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${(error as Error).message}`);
    console.error('Please make sure MongoDB is running and the connection string is correct.');
    
    // In development, allow the server to start without MongoDB
    if (process.env['NODE_ENV'] === 'development') {
      console.log('Starting server without MongoDB connection (development mode)');
      console.log('You can start MongoDB locally or use MongoDB Atlas');
    } else {
      process.exit(1); // Exit on failure in production
    }
  }
};

export default connectDB; 