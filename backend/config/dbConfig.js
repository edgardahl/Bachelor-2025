import dotenv from 'dotenv';

dotenv.config();

export const DB_TYPE = process.env.DB_TYPE || "mongo";
export const MONGO_URI = process.env.MONGO_URI;
export const POSTGRES_URI = process.env.POSTGRES_URI;
