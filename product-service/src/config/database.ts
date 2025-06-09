import { PrismaClient } from "@prisma/client";

class DatabaseService {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new PrismaClient({
        log:
          process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
      });
    }
    return DatabaseService.instance;
  }

  public static async connect(): Promise<void> {
    try {
      await DatabaseService.getInstance().$connect();
      console.log("✅ Database connected successfully");
    } catch (error) {
      console.error("❌ Database connection failed:", error);
      process.exit(1);
    }
  }

  public static async disconnect(): Promise<void> {
    try {
      await DatabaseService.getInstance().$disconnect();
      console.log("✅ Database disconnected successfully");
    } catch (error) {
      console.error("❌ Database disconnection failed:", error);
    }
  }
}

export default DatabaseService;
