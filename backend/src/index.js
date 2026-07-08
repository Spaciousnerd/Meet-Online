import express from "express";
import { createServer } from "node:http";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import { connectToSocket } from "./controllers/socketManager.js";
import userRoutes from "./routes/routes.js";
const app = express();
const server = createServer(app);
import dotenv from "dotenv";
dotenv.config();
const io = connectToSocket(server);
app.set("port", process.env.PORT || 8000);
app.set("MONGO_URL", process.env.MONGO_URL);
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));
app.use("/api/v1/users", userRoutes);
app.get("/test", async (req, res) => {
  return res.json("running");
});
const start = async () => {
  const connectionDB = await mongoose.connect(app.get("MONGO_URL"));
  server.listen(app.get("port"), () => {
    console.log(`Listening at ${app.get("port")}`);
  });
};
start();
