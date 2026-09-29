import "dotenv/config";
import { createServer } from "node:http";

import app from "./app.js";
import { pool } from "./db/connection.js";
import { connectToSocket } from "./realtime/socket.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await pool.query("SELECT 1");
    console.log("Database connected");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
  const server = createServer(app);
  connectToSocket(server);

  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
