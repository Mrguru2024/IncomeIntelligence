// ULTRA SIMPLIFIED VERSION
import { useEffect } from "react";

// Ultra simplified component for debugging
export default function SpendingGuardrails() {
  // Debug log when component renders
  useEffect(() => {
    console.log("⚠️⚠️⚠️ SpendingGuardrails TEST component rendered!");
    // Log element to console for debugging
    const debugElement = document.getElementById('guardrails-debug-banner');
    console.log("Debug banner element:", debugElement);
  }, []);

  return (
    <div className="container min-h-screen w-full" style={{background: "linear-gradient(135deg, #6366f1, #8b5cf6)"}}>
      {/* Very visible debug banner */}
      <div id="guardrails-debug-banner" className="fixed top-0 left-0 w-full bg-red-600 text-white p-4 text-center text-xl font-bold z-50">
        GUARDRAILS TEST PAGE ACTIVE
      </div>
      
      <div className="py-24 px-8 text-center text-white">
        <h1 className="text-6xl font-extrabold mb-6">Spending Guardrails</h1>
        <p className="text-2xl mb-12">This is the test version of the Guardrails feature.</p>
        
        <div className="bg-white text-black p-8 rounded-lg shadow-2xl max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Guardrails Status</h2>
          <p className="text-xl">This is an ultra-simplified implementation for debugging purposes.</p>
        </div>
      </div>
    </div>
  );
}