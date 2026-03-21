import { ShieldCheck, Zap, BarChart3, Globe, Database, TrendingUp, CreditCard, Users } from "lucide-react";

const features = [
  {
    name: "NAMFISA Compliance",
    description: "Automated regulatory reporting and real-time compliance monitoring for Namibian micro-lenders.",
    icon: ShieldCheck,
  },
  {
    name: "Loan Marketplace",
    description: "Connect with verified lenders and get competitive rates through our transparent bidding system.",
    icon: TrendingUp,
  },
  {
    name: "Advanced Analytics",
    description: "Deep insights into portfolio performance, risk assessment, and borrower behavior analytics.",
    icon: BarChart3,
  },
  {
    name: "Shared Registry",
    description: "Access the national credit registry to verify borrower history and reduce default risks.",
    icon: Database,
  },
  {
    name: "Flexible Billing",
    description: "Manage subscriptions and automated invoicing with support for local payment methods.",
    icon: CreditCard,
  },
  {
    name: "Borrower Management",
    description: "Comprehensive tools for managing the entire loan lifecycle from application to collection.",
    icon: Users,
  },
];

export default function Features() {
  return (
    <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-zinc-900">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-gray-100 px-3 py-1 text-sm dark:bg-gray-800">
              Key Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Everything you need to succeed
            </h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              CashHub provides a comprehensive suite of tools designed to help you take control of your financial future.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.name}
              className="relative flex flex-col items-center space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-950"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white dark:bg-white dark:text-black">
                <feature.icon className="h-6 w-6" />
              </div>
              <div className="space-y-2 text-center">
                <h3 className="font-bold">{feature.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
