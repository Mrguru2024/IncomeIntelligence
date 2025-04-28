import { useParams } from "wouter";
import { QuoteForm } from "@/features/quotes";

export default function EditQuotePage() {
  const { quoteId } = useParams<{ quoteId: string }>();
  
  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        {quoteId === "new" ? "Create Quote" : "Edit Quote"}
      </h1>
      <QuoteForm quoteId={quoteId === "new" ? undefined : quoteId} />
    </div>
  );
}