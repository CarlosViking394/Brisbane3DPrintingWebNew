export default function Cancel() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Payment Canceled</h1>
        <p className="text-gray-600 mb-6">Your payment was canceled. You can try again anytime.</p>
        <a href="/" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Return to Home</a>
      </div>
    </div>
  );
} 