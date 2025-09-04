"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const guestData = [
  {
    confirm: true,
    name: "Greg",
    surname: "Smith",
    rsvpWedding: "Yes",
    rsvpAfter: "No",
    isChild: "Yes",
    childAge: "2",
    meal: "Vegan",
    accomodation: "No",
    transport: "Yes",
    note: "Test note",
    email: "gregsmith@gmail.com",
    confirmer: "Greg Smith",
    tags: ["Vegetarian"],
    table: "A1"
  },
  {
    confirm: true,
    name: "Aneta",
    surname: "Sting",
    rsvpWedding: "Yes",
    rsvpAfter: "No",
    isChild: "Yes",
    childAge: "14",
    meal: "Regular",
    accomodation: "No",
    transport: "No",
    note: "",
    email: "",
    confirmer: "",
    tags: ["Child"],
    table: "A2"
  },
  {
    confirm: false,
    name: "Marry",
    surname: "Jane",
    rsvpWedding: "No",
    rsvpAfter: "No",
    isChild: "No",
    childAge: "----",
    meal: "----",
    accomodation: "No",
    transport: "No",
    note: "",
    email: "",
    confirmer: "",
    tags: [],
    table: "B1"
  },
  {
    confirm: false,
    name: "Tao",
    surname: "Sting",
    rsvpWedding: "No",
    rsvpAfter: "No",
    isChild: "No",
    childAge: "----",
    meal: "----",
    accomodation: "No",
    transport: "No",
    note: "",
    email: "",
    confirmer: "",
    tags: [],
    table: "B2"
  },
];

export default function ManageGuestsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

  const handleBack = () => {
    router.push("/dashboard/events-edition/rsvp");
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
        <span className="text-black font-medium px-6 py-2 rounded">Logout</span>
      </div>
      <h1 className="text-2xl sm:text-3xl font-bold text-black mb-8">MANAGE GUEST LISTS</h1>
      <div className="flex flex-col sm:flex-row flex-wrap justify-between items-center mb-8 gap-4 w-full">
        <div className="flex flex-col sm:flex-row gap-4 flex-1 min-w-[200px] w-full">
          <input
            type="text"
            placeholder="Find Guests"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-black rounded px-4 py-2 w-full sm:w-60"
          />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="border border-black rounded px-4 py-2 w-full sm:w-40"
          >
            <option value="">Filter By</option>
            <option value="child">Child</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="confirmed">Confirmed</option>
          </select>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button className="bg-gradient-to-r from-[#E5B574] via-[#D59C58] to-[#C18037] text-white font-semibold px-8 py-2 rounded-md shadow-md hover:from-[#D59C58] hover:to-[#E5B574] transition-colors w-full sm:w-auto">
            Download List
          </button>
          <button className="bg-gradient-to-r from-[#E5B574] via-[#D59C58] to-[#C18037] text-white font-semibold px-8 py-2 rounded-md shadow-md hover:from-[#D59C58] hover:to-[#E5B574] transition-colors w-full sm:w-auto">
            Add Guest
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-black rounded-lg text-xs sm:text-sm md:text-base">
          <thead className="bg-[#F5F5F5]">
            <tr>
              <th className="px-2 sm:px-4 py-2 sm:py-3 border-b border-black text-left">Confirm</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 border-b border-black text-left">Name</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 border-b border-black text-left">Surname</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 border-b border-black text-left">RSVP Status<br/>(Wedding Day)</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 border-b border-black text-left">RSVP Status<br/>(After Party)</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 border-b border-black text-left">Is it child?</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 border-b border-black text-left">Child’s age</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 border-b border-black text-left">Meal Preference</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 border-b border-black text-left">Accomodation</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 border-b border-black text-left">Transport</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 border-b border-black text-left">Note</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 border-b border-black text-left">Email</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 border-b border-black text-left">Confirmer</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 border-b border-black text-left">Edit</th>
              <th className="px-2 sm:px-4 py-2 sm:py-3 border-b border-black text-left text-red-600">Delete</th>
            </tr>
          </thead>
          <tbody>
            {guestData.map((guest, idx) => (
              <tr key={idx} className="border-b border-black last:border-b-0">
                <td className="px-2 sm:px-4 py-2 border-black text-center"><input type="checkbox" checked={guest.confirm} readOnly /></td>
                <td className="px-2 sm:px-4 py-2 border-black">{guest.name}</td>
                <td className="px-2 sm:px-4 py-2 border-black">{guest.surname}</td>
                <td className="px-2 sm:px-4 py-2 border-black">{guest.rsvpWedding}</td>
                <td className="px-2 sm:px-4 py-2 border-black">{guest.rsvpAfter}</td>
                <td className="px-2 sm:px-4 py-2 border-black">{guest.isChild}</td>
                <td className="px-2 sm:px-4 py-2 border-black">{guest.childAge}</td>
                <td className="px-2 sm:px-4 py-2 border-black">{guest.meal}</td>
                <td className="px-2 sm:px-4 py-2 border-black">{guest.accomodation}</td>
                <td className="px-2 sm:px-4 py-2 border-black">{guest.transport}</td>
                <td className="px-2 sm:px-4 py-2 border-black">{guest.note}</td>
                <td className="px-2 sm:px-4 py-2 border-black">{guest.email}</td>
                <td className="px-2 sm:px-4 py-2 border-black">{guest.confirmer}</td>
                <td className="px-2 sm:px-4 py-2 border-black text-center">
                  <button className="text-black hover:text-[#C18037]" title="Edit">
                    <span role="img" aria-label="edit">✏️</span>
                  </button>
                </td>
                <td className="px-2 sm:px-4 py-2 border-black text-center">
                  <button className="text-red-600 hover:text-red-800" title="Delete">
                    <span role="img" aria-label="delete">🗑️</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 