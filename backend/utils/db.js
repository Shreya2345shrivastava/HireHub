import mongoose from "mongoose";
import dns from "dns";

const connectDB = async () => {
  try {
    // Set custom DNS resolvers to avoid querySrv resolution failures in some Node/network configurations
    try {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    } catch (dnsErr) {
      console.warn("⚠️ Failed to set DNS servers:", dnsErr.message);
    }
    console.log(process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI); // no options needed
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    console.warn("Continuing without DB connection (development fallback). Some routes may fail.");
    return; // don't throw so the server can start for development
  }
};

export default connectDB;
