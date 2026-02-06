export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">Yukti</h1>
        <p className="text-xl text-gray-600 mb-8">AI-Powered Resume Builder</p>
        <div className="space-x-4">
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            Get Started
          </button>
          <button className="px-6 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition">
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}
