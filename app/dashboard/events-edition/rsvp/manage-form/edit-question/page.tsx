"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditQuestionPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("Whats your meal preference?");
  const [answerType, setAnswerType] = useState<"short" | "multiple">("multiple");
  const [options, setOptions] = useState([
    { title: "Meal Title", description: "" },
  ]);

  const handleOptionChange = (idx: number, field: "title" | "description", value: string) => {
    setOptions((opts) => opts.map((opt, i) => i === idx ? { ...opt, [field]: value } : opt));
  };

  const handleAddOption = () => {
    setOptions([...options, { title: "", description: "" }]);
  };

  const handleRemoveOption = (idx: number) => {
    setOptions(options.filter((_, i) => i !== idx));
  };

  const handleSave = () => {
    router.push("/dashboard/events-edition/rsvp/manage-form");
  };

  const handleCancel = () => {
    router.push("/dashboard/events-edition/rsvp/manage-form");
  };

  return (
    <div className="flex-1 p-4 sm:p-8 md:p-12 bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
        <button
          onClick={handleCancel}
          className="bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-800 transition-colors"
        >
          Back
        </button>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-black mb-8">MANAGE FORM</h1>
      <div className="max-w-3xl mx-auto w-full">
        <div className="border border-black rounded-xl p-4 sm:p-8 mb-8 bg-white">
          {/* Question Prompt */}
          <div className="mb-6">
            <label className="block text-base font-semibold mb-2">Questions Prompt*</label>
            <input
              className="w-full border border-black rounded-lg px-4 py-3 sm:py-4 text-base sm:text-lg font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-[#E5B574]"
              value={question}
              onChange={e => setQuestion(e.target.value)}
            />
          </div>
          {/* Answer Type */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 mb-6">
            <label className="flex items-center gap-2 text-base font-medium">
              <input
                type="radio"
                checked={answerType === "short"}
                onChange={() => setAnswerType("short")}
                className="w-6 h-6 accent-[#C18037] border-2 border-black"
              />
              Short Answer
            </label>
            <label className="flex items-center gap-2 text-base font-medium">
              <input
                type="radio"
                checked={answerType === "multiple"}
                onChange={() => setAnswerType("multiple")}
                className="w-6 h-6 accent-[#C18037] border-2 border-black"
              />
              Multiple Choice
            </label>
          </div>
          {/* Options */}
          {answerType === "multiple" && options.map((opt, idx) => (
            <div key={idx} className="mb-4">
              <div className="flex flex-col sm:flex-row items-center mb-2 gap-2">
                <button
                  onClick={() => handleRemoveOption(idx)}
                  className="w-8 h-8 flex items-center justify-center border border-black rounded-full text-2xl font-bold text-gray-500 disabled:opacity-50"
                  disabled={options.length === 1}
                  aria-label="Remove option"
                  type="button"
                >
                  –
                </button>
                <input
                  className="flex-1 border border-black rounded-lg px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#E5B574]"
                  placeholder="Meal Title"
                  value={opt.title}
                  onChange={e => handleOptionChange(idx, "title", e.target.value)}
                />
              </div>
              <textarea
                className="w-full border border-black rounded-lg px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-[#E5B574]"
                placeholder="Description"
                value={opt.description}
                onChange={e => handleOptionChange(idx, "description", e.target.value)}
              />
            </div>
          ))}
          {answerType === "multiple" && (
            <button
              onClick={handleAddOption}
              className="flex items-center gap-2 text-base font-medium text-black mt-2 mb-4"
              type="button"
            >
              <span className="w-8 h-8 flex items-center justify-center border border-black rounded-full text-2xl font-bold">+</span>
              Add Another Option
            </button>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-start mt-6 mb-2 w-full">
          <button
            onClick={handleSave}
            className="bg-gradient-to-r from-[#E5B574] via-[#D59C58] to-[#C18037] text-white font-semibold px-8 sm:px-16 py-3 rounded-lg text-lg hover:from-[#D59C58] hover:to-[#E5B574] transition-colors w-full sm:w-auto"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="bg-gradient-to-r from-[#E5B574] via-[#D59C58] to-[#C18037] text-white font-semibold px-8 sm:px-16 py-3 rounded-lg text-lg hover:from-[#D59C58] hover:to-[#E5B574] transition-colors w-full sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 