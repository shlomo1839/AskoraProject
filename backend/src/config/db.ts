import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(): Promise<void> {
  await mongoose.connect(env.mongodbUri);
  console.log(`MongoDB connected (database: ${mongoose.connection.db?.databaseName})`);
}


// export async function connectDB(): Promise<void> {
//   try {
//     // 1. ניסיון התחברות
//     await mongoose.connect(env.mongodbUri);

//     // 2. בדיקה מפורשת שהחיבור אכן פעיל (readyState === 1)
//     if (mongoose.connection.readyState === 1) {
//       const dbName = mongoose.connection.db?.databaseName || 'unknown';
//       console.log(`🚀 MongoDB connected successfully (database: ${dbName})`);
//     } else {
//       throw new Error(`Connection established but readyState is ${mongoose.connection.readyState}`);
//     }

//   } catch (error) {
//     // 3. תפיסת שגיאות במידה והחיבור נכשל (למשל: URI לא תקין, דאטה-בייס למטה וכו')
//     console.error(`❌ Failed to connect to MongoDB: ${(error as Error).message}`);
    
//     // אופציונלי: קריסה מבוקרת של האפליקציה אם ה-DB הוא קריטי לעליית השרת
//     process.exit(1); 
//   }
// }

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  console.log('MongoDB disconnected');
}