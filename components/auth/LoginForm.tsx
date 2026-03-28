"use client";

export default function LoginForm({
  loginEmpId,
  setLoginEmpId,
  loginError,
  handleLogin
}: {
  loginEmpId: string;
  setLoginEmpId: (v: string) => void;
  loginError: string;
  handleLogin: (e: React.FormEvent) => void;
}) {
  return (
    <div className="min-h-screen bg-[#fdfbf2] flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-full max-w-md border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#d4b4dd] to-[#b88bc9]"></div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-[#4a2b38] mb-2">เข้าสู่ระบบ</h1>
          <p className="text-gray-500 text-sm">
            แผนกผ่าตัด โรงพยาบาลกรุงเทพอุดร
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              รหัสพนักงาน (Employee ID)
            </label>
            <input
              type="text"
              value={loginEmpId}
              onChange={(e) => setLoginEmpId(e.target.value)}
              className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-[#d4b4dd] focus:ring-4 focus:ring-[#f3eff4] outline-none transition-all font-mono text-lg text-center"
              placeholder="กรอกรหัสพนักงาน"
              autoFocus
              required
            />
          </div>

          {loginError && (
            <div className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded-lg">
              {loginError}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[#4a2b38] text-white font-bold text-lg p-3 rounded-xl hover:bg-[#6e4356] transition-colors shadow-md"
          >
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
}