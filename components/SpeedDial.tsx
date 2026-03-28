"use client";

type Props = {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;

  handleOpenDashboard: () => void;
  handleOpenNurseModal: (data: any) => void;
  handleOpenModal: (data: any) => void;
};

export default function SpeedDial({
  isOpen,
  setIsOpen,
  handleOpenDashboard,
  handleOpenNurseModal,
  handleOpenModal,
}: Props) {
  return (
    <div className="fixed bottom-6 md:bottom-10 right-4 md:right-10 z-50 flex flex-col items-end gap-3">
      
      {isOpen && (
        <div className="flex flex-col gap-3 mb-2 items-end animate-fade-in-up">
          
          <a
            href="?tv=true"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#a2c2e8] hover:bg-[#8eb3df] text-[#4a2b38] px-6 py-3.5 rounded-full font-black shadow-[0_8px_15px_rgba(162,194,232,0.6)] transition-transform hover:scale-105 flex items-center gap-3 whitespace-nowrap"
          >
            Display
          </a>

          <button
            onClick={handleOpenDashboard}
            className="bg-[#fbc2eb] hover:bg-[#f0addd] text-[#4a2b38] px-6 py-3.5 rounded-full font-black shadow-[0_8px_15px_rgba(251,194,235,0.6)] transition-transform hover:scale-105 flex items-center gap-3 whitespace-nowrap"
          >
            Dashboard
          </button>

          <button
            onClick={() => handleOpenNurseModal(null)}
            className="bg-[#ffdac1] hover:bg-[#facba8] text-[#4a2b38] px-6 py-3.5 rounded-full font-black shadow-[0_8px_15px_rgba(255,218,193,0.6)] transition-transform hover:scale-105 flex items-center gap-3 whitespace-nowrap"
          >
            On call
          </button>

          <button
            onClick={() => handleOpenModal(null)}
            className="bg-[#d4b4dd] hover:bg-[#c29bce] text-[#4a2b38] px-6 py-3.5 rounded-full font-black shadow-[0_8px_15px_rgba(212,180,221,0.6)] transition-transform hover:scale-105 flex items-center gap-3 whitespace-nowrap"
          >
            เพิ่มคิวผ่าตัด
          </button>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 md:w-16 md:h-16 text-white rounded-full text-4xl shadow-[0_10px_20px_rgba(184,139,201,0.5)] flex items-center justify-center transition-all duration-300 z-50 cursor-pointer border-2 border-white ${
          isOpen
            ? 'bg-[#ff9a9e] hover:bg-[#ff7b81] rotate-45 scale-110'
            : 'bg-[#b88bc9] hover:bg-[#a67ab5] hover:scale-110'
        }`}
      >
        +
      </button>
    </div>
  );
}