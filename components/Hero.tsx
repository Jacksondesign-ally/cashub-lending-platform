import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-white dark:bg-black">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-medium text-gray-900 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-50 mb-4">
              <span className="flex h-2 w-2 rounded-full bg-cashub-600 mr-2"></span>
              New: NAMFISA Compliance Reporting
              <ChevronRight className="ml-1 h-4 w-4" />
            </div>
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-cashub-600 to-accent-500">
              The Modern Operating System for Namibian Lenders
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Streamline your loan operations, ensure full NAMFISA compliance, and access the shared credit registry—all from one powerful dashboard.
            </p>
          </div>
          <div className="space-x-4">
            <Link
              className="inline-flex h-11 items-center justify-center rounded-md bg-black text-white px-8 text-sm font-medium shadow transition-colors hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              href="/signup"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              className="inline-flex h-11 items-center justify-center rounded-md border border-gray-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50"
              href="#"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
