import blur from "/public/blur.png";
import example from "/public/example.png";
import result from "/public/result.png";

export default function ExplainerSection() {
  return (
    <div className="w-full max-w-6xl mt-20 p-10 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl shadow-sm space-y-10">
      <h2 className="text-3xl font-bold text-center mb-10 text-slate-800">Your Portrait Creation Journey</h2>

      {/* Step 1: Upload your images */}
      <div className="space-y-5 hover:transform hover:scale-[1.02] transition-all duration-300">
        <div className="flex items-center justify-center space-x-4">
          <div className="text-3xl font-bold text-white bg-gradient-to-r from-blue-500 to-blue-700 rounded-full w-12 h-12 flex items-center justify-center shadow-md">
            1
          </div>
          <h3 className="text-2xl font-semibold text-slate-700">Capture Your Best Self</h3>
        </div>
        <p className="text-sm text-slate-600 text-center leading-relaxed max-w-2xl mx-auto">
          Simply upload 4+ quality selfies with clear facial features. For optimal results, ensure photos are well-lit, 
          front-facing, and show only one person without accessories obscuring your face.
        </p>
        <img
          src={example.src}
          alt="Portrait input examples"
          className="rounded-xl object-cover w-full md:w-3/4 lg:w-1/2 mx-auto shadow-lg"
        />
      </div>

      {/* Step 2: Train your model */}
      <div className="space-y-5 hover:transform hover:scale-[1.02] transition-all duration-300">
        <div className="flex items-center justify-center space-x-4">
          <div className="text-3xl font-bold text-white bg-gradient-to-r from-blue-500 to-blue-700 rounded-full w-12 h-12 flex items-center justify-center shadow-md">
            2
          </div>
          <h3 className="text-2xl font-semibold text-slate-700">Advanced AI Processing</h3>
        </div>
        <p className="text-sm text-slate-600 text-center leading-relaxed max-w-2xl mx-auto">
          Our sophisticated algorithms analyze your features and create a personalized model in approximately 20 minutes. 
          We'll notify you via email once your custom portrait system is ready for exploration.
        </p>
        <img
          src={blur.src}
          alt="AI processing visualization"
          className="rounded-xl object-cover w-full md:w-3/4 lg:w-1/2 mx-auto shadow-lg"
        />
      </div>

      {/* Step 3: Generate images */}
      <div className="space-y-5 hover:transform hover:scale-[1.02] transition-all duration-300">
        <div className="flex items-center justify-center space-x-4">
          <div className="text-3xl font-bold text-white bg-gradient-to-r from-blue-500 to-blue-700 rounded-full w-12 h-12 flex items-center justify-center shadow-md">
            3
          </div>
          <h3 className="text-2xl font-semibold text-slate-700">Discover Your Professional Portraits</h3>
        </div>
        <p className="text-sm text-slate-600 text-center leading-relaxed max-w-2xl mx-auto">
          Once your custom model is trained, you'll have access to studio-quality portraits that highlight your 
          professional image. Perfect for enhancing your digital presence across all platforms.
        </p>
        <img
          src={result.src}
          alt="Professional portrait results"
          className="rounded-xl object-cover w-full md:w-3/4 lg:w-1/2 mx-auto shadow-lg"
        />
      </div>
    </div>
  );
}
