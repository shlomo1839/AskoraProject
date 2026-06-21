import dotenv from "dotenv";

dotenv.config();

/** שם מסד הנתונים הקבוע של הפרויקט */
export const DB_NAME = "askora";

export const env = {
  port: Number(process.env.PORT) || 5000,
  mongodbUri:
    process.env.MONGODB_URI || `mongodb://localhost:27017/${DB_NAME}`,
  nodeEnv: process.env.NODE_ENV || "development",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-in-production",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
};
