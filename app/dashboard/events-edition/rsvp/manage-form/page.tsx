"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const event = {
  name: "Wedding Day",
  date: "Sunday, May 24, 2026",
};

const popularQuestions = [
  "Whats your meal preference?",
  "Do you have any dietary restrictions?",
  "Will you need transportation to our Wedding Day?",
  "Do you need accomodation?",
];

export default function ManageFormPage() {
  const router = useRouter();
  const [rsvpOn, setRsvpOn] = useState(true);
  const [afterParty, setAfterParty] = useState(false);
  const [addedQuestions, setAddedQuestions] = useState<string[]>([]);

  const handleBack = () => {
    router.push("/dashboard/events-edition/rsvp");
  };

  const handleAddQuestion = (q: string) => {
    router.push("/dashboard/events-edition/rsvp/manage-form/edit-question");
  };

  const handleRemoveQuestion = (q: string) => {
    setAddedQuestions(addedQuestions.filter((item) => item !== q));
  };

  return (
    <div className="flex-1 p-4 sm:p-8 md:p-12 bg-white min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
        <button
          onClick={handleBack}
          className="bg-black text-white px-6 py-2 rounded font-semibold hover:bg-gray-800 transition-colors"
        >
          Back
        </button>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-black mb-6">MANAGE FORM</h1>
      <div className="text-xl sm:text-2xl font-semibold mb-4">Add questions for guests attending this event:</div>
      <div className="bg-[#F5F5F5] rounded-lg p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between mb-6 gap-4 w-full">
        <div className="flex flex-col flex-1 w-full">
          <div className="text-base sm:text-lg font-semibold">{event.name}</div>
          <div className="text-gray-600 text-sm sm:text-base">{event.date}</div>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0 w-full md:w-auto">
          <span className="font-semibold text-gray-700">RSVP ON</span>
          <button
            className={`w-14 h-7 flex items-center rounded-full p-1 duration-300 ease-in-out ${rsvpOn ? 'bg-gradient-to-r from-[#E5B574] via-[#D59C58] to-[#C18037]' : 'bg-gray-300'}`}
            onClick={() => setRsvpOn(!rsvpOn)}
          >
            <span
              className={`bg-white w-5 h-5 rounded-full shadow-md transform duration-300 ease-in-out ${rsvpOn ? 'translate-x-7' : ''}`}
            />
          </button>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between mb-2 gap-4 w-full">
        <div className="font-semibold text-base sm:text-lg">Popular Questions:</div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-sm sm:text-base font-medium text-gray-700">Wedding after party day</span>
          <button
            className={`w-12 h-6 flex items-center rounded-full p-1 duration-300 ease-in-out ${afterParty ? 'bg-gradient-to-r from-[#E5B574] via-[#D59C58] to-[#C18037]' : 'bg-gray-300'}`}
            onClick={() => setAfterParty(!afterParty)}
          >
            <span
              className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${afterParty ? 'translate-x-6' : ''}`}
            />
          </button>
        </div>
      </div>
      <div className="mb-8">
        {popularQuestions.map((q) => (
          <div key={q} className="flex flex-col sm:flex-row items-center justify-between border border-black rounded-lg px-4 sm:px-6 py-4 mb-3 bg-white gap-2 w-full">
            <span className="text-base font-medium w-full sm:w-auto">{q}</span>
            <button
              onClick={() => handleAddQuestion(q)}
              className="border border-black px-4 py-1 rounded hover:bg-gray-100 transition-colors w-full sm:w-auto"
            >
              Add
            </button>
          </div>
        ))}
      </div>
      <div className="text-gray-700 text-sm sm:text-base max-w-2xl">
        <b>Manage form for website:</b> You can add and subtract the questions you want on website.
      </div>
    </div>
  );
} 