import { startServer } from "./app";

const PORT = parseInt(process.env.PORT || "4001", 10);

startServer(PORT).catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
