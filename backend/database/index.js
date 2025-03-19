import { DB_TYPE } from "../config/dbConfig.js";
import connectMongo from "./mongo.js";
import { connectPostgres } from "./postgres.js";

let connectDB;

if (DB_TYPE === "mongo") {
  connectDB = connectMongo;
} else if (DB_TYPE === "postgres") {
  connectDB = connectPostgres;
} else {
  throw new Error("Invalid DB_TYPE");
}

export default connectDB;
