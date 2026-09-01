export default function Ann() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="relative">
        {/* Glowing effect */}
        <div className="absolute inset-0 bg-white opacity-20 blur-xl rounded-2xl"></div>
        
        {/* Main card */}
        <div className="relative border-4 border-white p-12 rounded-2xl shadow-2xl">
          {/* Main heading */}
          <h1 className="text-white text-4xl md:text-6xl font-bold text-center mb-4 leading-tight">
            Phase 3
          </h1>
          
          {/* Divider */}
          <div className="w-24 h-1 bg-white mx-auto mb-6"></div>
          
          {/* Time and date */}
          <div className="text-center space-y-2">
            <p className="text-white text-2xl md:text-3xl font-semibold">
              Starts at 7:30 PM
            </p>
            <p className="text-gray-300 text-xl md:text-2xl">
              10th October, 2025
            </p>
          </div>
          
          {/* Decorative corners */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white opacity-50"></div>
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white opacity-50"></div>
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white opacity-50"></div>
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white opacity-50"></div>
        </div>
      </div>
    </div>
  );
}