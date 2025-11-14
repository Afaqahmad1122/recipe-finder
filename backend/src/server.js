import express from "express";
import env from "./config/env.js";

const app = express();
const PORT = env.PORT;

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Server is running", status: "success" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
