import express from "express";
import connectDB from "./database/index.js";
import apiRoutes from "./routes/api.js";

const app = express();
app.use(express.json());

app.use("/api", apiRoutes);

const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
