"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface HealthCheck {
  success: boolean;
  service: string;
  version: string;
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  checks: {
    database: {
      status: string;
      latency: string;
    };
    memory: {
      used: string;
      total: string;
    };
    node: {
      version: string;
      platform: string;
    };
  };
}

const fetchHealthStatus = async (): Promise<HealthCheck> => {
  const productServiceUrl =
    process.env.NEXT_PUBLIC_PRODUCT_SERVICE_API_URL || "http://localhost:4001";
  const response = await fetch(`${productServiceUrl}/api/v1/health/detailed`);

  if (!response.ok) {
    throw new Error(`Health check failed: ${response.status}`);
  }

  return response.json();
};

export default function HealthStatus() {
  const {
    data: health,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["health-status"],
    queryFn: fetchHealthStatus,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Loading system status...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
          <CardDescription>Failed to load system status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 mb-4">Error: {error.message}</div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!health) return null;

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          System Health
          <Badge
            variant={health.status === "healthy" ? "default" : "destructive"}
          >
            {health.status}
          </Badge>
        </CardTitle>
        <CardDescription>
          {health.service} v{health.version} • {health.environment}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium">Uptime</div>
            <div className="text-2xl font-bold">
              {formatUptime(health.uptime)}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium">Last Check</div>
            <div className="text-sm text-gray-500">
              {new Date(health.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium">Database</span>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  health.checks.database.status === "healthy"
                    ? "default"
                    : "destructive"
                }
              >
                {health.checks.database.status}
              </Badge>
              <span className="text-sm text-gray-500">
                {health.checks.database.latency}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Memory Usage</span>
            <span className="text-sm">
              {health.checks.memory.used} / {health.checks.memory.total}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="font-medium">Node.js</span>
            <span className="text-sm">
              {health.checks.node.version} ({health.checks.node.platform})
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
