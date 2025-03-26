import Link from "next/link";
import { Button } from "./ui/button";

export default function PricingSection() {
  return (
    <div className="w-full max-w-6xl mt-20 mb-20 p-10 rounded-2xl space-y-8 bg-gradient-to-b from-white to-slate-50">
      <h2 className="text-4xl font-bold text-center mb-10 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Investment Options</h2>
      <div className="flex flex-wrap justify-center lg:space-x-6 space-y-6 lg:space-y-0 items-stretch">
        {pricingOptions.map((option, index) => (
          <div
            key={index}
            className={`flex flex-col border-2 ${option.borderColor} rounded-2xl p-6 w-full lg:w-1/4 ${option.bgColor} shadow-lg hover:shadow-xl transition-all duration-300 hover:transform hover:scale-[1.03]`}
          >
            <div className="flex-grow space-y-5">
              <h3 className="text-2xl font-semibold text-center text-slate-800">
                {option.title}
              </h3>
              <p className="text-2xl font-bold text-center mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {option.price}
              </p>
              <p className="text-sm text-slate-600 text-center leading-relaxed">
                {option.description}
              </p>
              <ul className="space-y-3 mb-5 pl-4">
                {option.features.map((feature, fIndex) => (
                  <li key={fIndex} className="flex items-center space-x-2">
                    <span className="text-green-500 text-lg">✓</span>
                    <span className="text-slate-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-10 text-center">
              <Link href="/login">
                {" "}
                <Button className={`w-full py-5 rounded-xl ${option.buttonStyle}`}>{option.buttonText}</Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const pricingOptions = [
  {
    title: "Essential Portrait Package",
    price: "1 Credit",
    description:
      "The perfect starting point for enhancing your digital presence with professional AI-generated portraits.",
    features: [
      "4 Premium-Quality Portraits",
    ],
    buttonText: "Select Essential Package",
    buttonStyle: "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800",
    bgColor: "bg-white",
    borderColor: "border-blue-100",
  },
  {
    title: "Professional Portfolio",
    price: "3 Credits",
    description:
      "Ideal for professionals who need multiple styles and variations for different platforms and purposes.",
    features: [
      "12 Diverse Portrait Styles",
    ],
    buttonText: "Select Professional Package",
    buttonStyle: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  {
    title: "Executive Collection",
    price: "5 Credits",
    description: "Our comprehensive solution offering maximum variety and value for your professional image needs.",
    features: [
      "20 Studio-Quality Portraits",
    ],
    buttonText: "Select Executive Package",
    buttonStyle: "bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800",
    bgColor: "bg-white",
    borderColor: "border-blue-100",
  },
];
