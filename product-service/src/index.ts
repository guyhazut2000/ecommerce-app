import { startServer } from "./app";

const PORT = parseInt(process.env.PORT || "4001", 10);

startServer(PORT);
