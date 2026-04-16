"use client";

type Props = {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;

  handleOpenDashboard: () => void;
  handleOpenNurseModal: (data: any) => void;
  todaysNurseLog: any;
  handleOpenModal: (data: any) => void;
  isViewer?: boolean;
};

export default function SpeedDial({
  isOpen,
  setIsOpen,
  handleOpenDashboard,
  handleOpenNurseModal,
  handleOpenModal,
  todaysNurseLog,
  isViewer = false,
}: Props) {

  // 👉 ปิด SpeedDial ก่อนทำ action
  const closeAndRun = (fn: () => void) => {
    setIsOpen(false);
    fn();
  };

  const handleCopyTVLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}?tv=true`;

    try {
      await navigator.clipboard.writeText(url);
      alert('✅ คัดลอกลิงก์ Display แล้ว');
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('✅ คัดลอกลิงก์ Display แล้ว');
    }
  };

  return (
    <div className="fixed bottom-6 md:bottom-10 right-4 md:right-10 z-50 flex flex-col items-end gap-3">

      {isOpen && (
        <div className="flex flex-col gap-3 mb-2 items-end animate-fade-in-up">

          <a
            href="?tv=true"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="bg-[#a2c2e8] hover:bg-[#8eb3df] text-[#4a2b38] px-6 py-3.5 rounded-full font-black shadow-[0_8px_15px_rgba(162,194,232,0.6)] transition-transform hover:scale-105 flex items-center gap-3 whitespace-nowrap"
          >
            Display
          </a>

          <button
            onClick={() => closeAndRun(handleCopyTVLink)}
            className="bg-[#c2f0e1] hover:bg-[#a8e5d2] text-[#2b4a3f] px-6 py-3.5 rounded-full font-black shadow-[0_8px_15px_rgba(194,240,225,0.6)] transition-transform hover:scale-105 flex items-center gap-3 whitespace-nowrap"
          >
            Copy Display Link
          </button>

          {/* ❌ viewer ห้ามเห็น */}
          {!isViewer && (
            <>
              <button onClick={() => closeAndRun(handleOpenDashboard)}>
                Dashboard
              </button>

              <button onClick={() => closeAndRun(() => handleOpenNurseModal(todaysNurseLog))}>
                On call
              </button>

              <button onClick={() => closeAndRun(() => handleOpenModal(null))}>
                เพิ่มคิวผ่าตัด
              </button>
            </>
          )}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 md:w-16 md:h-16 text-white rounded-full text-4xl shadow-[0_10px_20px_rgba(184,139,201,0.5)] flex items-center justify-center transition-all duration-300 z-50 cursor-pointer border-2 border-white ${isOpen
            ? 'bg-[#ff9a9e] hover:bg-[#ff7b81] rotate-45 scale-110'
            : 'bg-[#b88bc9] hover:bg-[#a67ab5] hover:scale-110'
          }`}
      >
        +
      </button>
    </div>
  );
}