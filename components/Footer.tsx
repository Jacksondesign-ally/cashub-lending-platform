import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full py-6 bg-white border-t border-gray-200 dark:bg-black dark:border-gray-800">
      <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg">CashHub</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} CashHub Inc. All rights reserved.
          </span>
        </div>
        <nav className="flex gap-4 sm:gap-6 text-sm font-medium text-gray-500 dark:text-gray-400">
          <Link href="#" className="hover:underline hover:text-gray-900 dark:hover:text-gray-50">
            Terms of Service
          </Link>
          <Link href="#" className="hover:underline hover:text-gray-900 dark:hover:text-gray-50">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
