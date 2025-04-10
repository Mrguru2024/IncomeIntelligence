// Extremely minimal app with no dependencies
function CleanApp() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-white">
      <h1 className="text-4xl font-bold mb-6 text-blue-600">Stackr Finance</h1>
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg border">
        <h2 className="text-2xl font-semibold mb-4">Welcome to Stackr</h2>
        <p className="mb-4">Your financial tracker for service providers.</p>
        <div className="space-y-4">
          <button 
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            onClick={() => console.log('Login clicked')}
          >
            Login
          </button>
          <button 
            className="w-full py-2 px-4 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition"
            onClick={() => console.log('Register clicked')}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default CleanApp;