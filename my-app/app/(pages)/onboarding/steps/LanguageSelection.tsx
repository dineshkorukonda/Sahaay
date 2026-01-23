"use client";

import React from "react";
import { Check, Globe, Languages } from "lucide-react";

interface LanguageSelectionProps {
  selectedLanguage: string;
  onSelect: (lang: string) => void;
}

const languages = [
  { id: "en", name: "English", sub: "Standard English", icon: Languages },
  { id: "hi", name: "Hindi", sub: "हिन्दी", icon: Globe },
  { id: "mr", name: "Marathi", sub: "मराठी", icon: Globe },
  { id: "gu", name: "Gujarati", sub: "ગુજરાતી", icon: Globe },
  { id: "ta", name: "Tamil", sub: "தமிழ்", icon: Globe },
  { id: "bn", name: "Bengali", sub: "বাংলা", icon: Globe },
];

export default function LanguageSelection({ selectedLanguage, onSelect }: LanguageSelectionProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Choose your language</h2>
        <p className="text-gray-500 text-lg">
          Select your preferred language to customize your healthcare experience. This can be updated anytime in your profile settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {languages.map((lang) => {
          const isSelected = selectedLanguage === lang.name;
          const Icon = lang.icon;

          return (
            <button
              key={lang.id}
              onClick={() => onSelect(lang.name)}
              className={`relative flex items-center p-6 rounded-2xl border-2 transition-all duration-200 text-left hover:shadow-md ${isSelected
                  ? "border-[#22c55e] bg-green-50 shadow-green-100"
                  : "border-gray-100 bg-white hover:border-green-200"
                }`}
            >
              <div className={`p-3 rounded-full mr-4 ${isSelected ? "bg-[#22c55e]/10" : "bg-gray-50"}`}>
                <Icon className={`w-6 h-6 ${isSelected ? "text-[#22c55e]" : "text-gray-400"}`} />
              </div>

              <div>
                <h3 className={`font-bold text-lg ${isSelected ? "text-[#22c55e]" : "text-gray-900"}`}>
                  {lang.name}
                </h3>
                <p className="text-sm text-gray-400 font-medium">{lang.sub}</p>
              </div>

              {isSelected && (
                <div className="absolute top-4 right-4">
                  <div className="bg-[#22c55e] rounded-full p-1">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
