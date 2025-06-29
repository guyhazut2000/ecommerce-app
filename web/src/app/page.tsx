import Link from "next/link";
import HealthStatus from "@/components/health-status";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <main className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            🛍️ Ecommerce App
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Modern ecommerce application built with Next.js, React Query, and
            microservices architecture.
            <br />
            <span className="text-sm font-medium text-green-600">
              ✅ CI/CD Pipeline Active - Testing GitHub Actions
            </span>
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center space-x-4">
          <Button asChild>
            <Link href="/products">View Products</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/products">Browse Catalog</Link>
          </Button>
        </div>

        {/* Health Status */}
        <div className="max-w-md mx-auto">
          <HealthStatus />
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="text-center p-6 border rounded-lg">
            <div className="text-2xl mb-2">🚀</div>
            <h3 className="font-semibold mb-2">Fast Performance</h3>
            <p className="text-sm text-gray-600">
              Built with Next.js for optimal performance and user experience
            </p>
          </div>
          <div className="text-center p-6 border rounded-lg">
            <div className="text-2xl mb-2">🔧</div>
            <h3 className="font-semibold mb-2">Microservices</h3>
            <p className="text-sm text-gray-600">
              Scalable architecture with separate product service and database
            </p>
          </div>
          <div className="text-center p-6 border rounded-lg">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-semibold mb-2">Real-time Updates</h3>
            <p className="text-sm text-gray-600">
              React Query for efficient data fetching and caching
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
