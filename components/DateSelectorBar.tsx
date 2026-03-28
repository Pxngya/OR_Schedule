"use client";

type Props = {
  daysInMonth: number;
  selectedDate: number;
  setSelectedDate: (day: number) => void;
};

export default function DateSelectorBar({
  daysInMonth,
  selectedDate,
  setSelectedDate,
}: Props) {
  return (
    <div className="flex overflow-x-auto bg-or-table-head rounded-t-lg border border-b-0 border-gray-300 shadow-sm hide-scrollbar">
      
      <div className="px-3 md:px-4 py-2 font-bold bg-or-table-head border-r border-gray-300 sticky left-0 z-10 whitespace-nowrap">
        วัน
      </div>

      {[...Array(daysInMonth)].map((_, i) => {
        const day = i + 1;

        return (
          <button
            key={day}
            onClick={() => setSelectedDate(day)}
            className={`px-2 md:px-4 py-2 min-w-[36px] md:min-w-[40px] border-r border-gray-300 ${
              selectedDate === day
                ? 'bg-white text-[#b88bc9] rounded-t-md font-black shadow-[0_-3px_0_0_#b88bc9]'
                : 'hover:bg-[#fdfbf2]'
            }`}
          >
            {day}
          </button>
        );
      })}
    </div>
  );
}