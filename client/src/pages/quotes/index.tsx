import { QuoteList } from "@/features/quotes";

export default function QuotesPage() {
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Quotes</h1>
      <QuoteList />
    </div>
  );
}