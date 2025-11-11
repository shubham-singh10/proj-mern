import mongoose from "mongoose";

export async function connectDB() {
    const localUri = process.env.MONGO_URI_LOCAL;
    const cloudUri = process.env.MONGO_URI_CLOUD;

    if (!localUri && !cloudUri) {
        console.error("No MongoDB URI defined in .env file!");
        process.exit(1);
    }

    try {
        if (localUri) {
            await mongoose.connect(localUri);
            console.log(`MongoDB connected: local`);
        } else if (cloudUri) {
            await mongoose.connect(cloudUri);
            console.log(`MongoDB connected: cloud`);
        }
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    }
}
