import { PrismaClient } from "@prisma/client";

let prismaInstance: PrismaClient | null = null;

export const createDatabaseService = () => {
  const getPrismaClient = (): PrismaClient => {
    if (!prismaInstance) {
      prismaInstance = new PrismaClient({
        log:
          process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
      });
    }
    return prismaInstance;
  };

  const connect = async (): Promise<void> => {
    try {
      const prisma = getPrismaClient();
      await prisma.$connect();
      console.log("✅ Database connected successfully");
    } catch (error) {
      console.error("❌ Database connection failed:", error);
      throw error;
    }
  };

  const disconnect = async (): Promise<void> => {
    try {
      const prisma = getPrismaClient();
      await prisma.$disconnect();
      console.log("✅ Database disconnected successfully");
    } catch (error) {
      console.error("❌ Database disconnection failed:", error);
      throw error;
    }
  };

  const healthCheck = async (): Promise<boolean> => {
    try {
      const prisma = getPrismaClient();
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error("❌ Database health check failed:", error);
      return false;
    }
  };

  return {
    getPrismaClient,
    connect,
    disconnect,
    healthCheck,
  };
};

// Singleton instance for backward compatibility
const databaseService = createDatabaseService();

export default {
  getInstance: () => databaseService,
};
