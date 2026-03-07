import { toEnglishNumbers } from '@/lib/utils';
import TamaraLogo from '@/components/TamaraLogo';

interface ConfirmMethodProps {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}

const ConfirmMethod = ({ phoneNumber, setPhoneNumber, onBack, onSubmit }: ConfirmMethodProps) => {
  const isValid = phoneNumber.length >= 9;

  return (
    <div
      className="min-h-screen bg-white flex flex-col"
      dir="rtl"
      style={{ fontFamily: "'Tajawal', 'Cairo', sans-serif" }}
    >
      <div className="max-w-[430px] mx-auto w-full flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <TamaraLogo />
          <div className="flex items-center gap-2">
            <button
              onClick={() => {}}
              className="text-[14px] text-[#333] font-medium"
            >
              English
            </button>
            <span className="text-[#ccc]">|</span>
            <button
              onClick={onBack}
              aria-label="إغلاق"
              className="w-8 h-8 flex items-center justify-center rounded-full border border-[#ddd] hover:bg-gray-50 transition-colors"
            >
              <span className="text-[#333] text-lg leading-none">✕</span>
            </button>
          </div>
        </div>

        {/* Separator */}
        <div className="h-px bg-[#eee] mx-0" />

        {/* Content */}
        <div className="px-5 py-6 flex flex-col flex-1">
          <h1 className="text-[22px] font-bold text-black mb-1 text-right">
            أدخل رقم الجوال
          </h1>
          <p className="text-[14px] text-[#666] mb-6 text-right">
            سيتم إرسال رمز تحقق للمتابعة
          </p>

          {/* Phone input */}
          <div className="mb-8">
            <div
              className="flex items-center border rounded-[10px] overflow-hidden w-full"
              style={{ borderColor: '#dcdcdc', height: 48 }}
            >
              {/* Country code - right side for RTL (left side visually) */}
              <div
                className="flex items-center gap-2 px-3 py-3 border-l"
                style={{ borderColor: '#dcdcdc', backgroundColor: '#fafafa' }}
              >
                <span className="text-[14px] font-bold text-black" dir="ltr">+966</span>
                <img
                  src="/external/images/saudi_flag.png"
                  alt="SA"
                  onError={(e) => {
                    e.currentTarget.src = 'https://flagcdn.com/w20/sa.png';
                  }}
                  className="w-[22px] h-[15px] rounded-sm"
                />
              </div>
              {/* Phone number input - 15% wider */}
              <input
                value={phoneNumber}
                onChange={e => setPhoneNumber(toEnglishNumbers(e.target.value))}
                placeholder="اكتب رقمك"
                className="flex-1 px-3 py-3 text-[15px] text-black bg-white outline-none placeholder-[#aaa]"
                style={{ direction: 'ltr', textAlign: 'right', width: '115%' }}
                maxLength={10}
                type="tel"
                inputMode="numeric"
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            onClick={onSubmit}
            disabled={!isValid}
            className="w-full py-[14px] text-[16px] font-bold rounded-[30px] transition-colors"
            style={{
              backgroundColor: isValid ? '#000000' : '#f5f5f5',
              color: isValid ? '#fff' : '#999',
              cursor: isValid ? 'pointer' : 'not-allowed',
            }}
          >
            أرسل الرمز
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmMethod;
