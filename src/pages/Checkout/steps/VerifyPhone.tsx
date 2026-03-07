import { useRef, useEffect, useState, ClipboardEvent, KeyboardEvent } from 'react';
import { toEnglishNumbers } from '@/lib/utils';
import TamaraLogo from '@/components/TamaraLogo';

interface VerifyPhoneProps {
  phoneNumber: string;
  activationCode: string;
  setActivationCode: (value: string) => void;
  agreedTerms: boolean;
  setAgreedTerms: (value: boolean) => void;
  codeError: string | null;
  resendTimer: number;
  formatTimer: (seconds: number) => string;
  isVerifyingCode: boolean;
  onBack: () => void;
  onSubmit: () => void;
  onClearError: () => void;
}

const OTP_LENGTH = 6;

const formatPhoneNumber = (phone: string) => {
  // Input: "555555555" → Output: "555 555 5"
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
};

const VerifyPhone = ({
  phoneNumber,
  activationCode,
  setActivationCode,
  agreedTerms,
  setAgreedTerms,
  codeError,
  resendTimer,
  formatTimer,
  isVerifyingCode,
  onBack,
  onSubmit,
  onClearError,
}: VerifyPhoneProps) => {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(OTP_LENGTH).fill(null));

  useEffect(() => {
    if (activationCode === '') {
      setDigits(Array(OTP_LENGTH).fill(''));
    }
  }, [activationCode]);

  const syncToParent = (newDigits: string[]) => {
    const code = newDigits.join('');
    setActivationCode(code);
  };

  const handleDigitChange = (index: number, value: string) => {
    const cleaned = toEnglishNumbers(value).replace(/\D/g, '');
    if (!cleaned) return;
    const digit = cleaned[cleaned.length - 1];

    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    syncToParent(newDigits);
    onClearError();

    if (index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newDigits = [...digits];
      if (newDigits[index]) {
        newDigits[index] = '';
        setDigits(newDigits);
        syncToParent(newDigits);
        onClearError();
      } else if (index > 0) {
        newDigits[index - 1] = '';
        setDigits(newDigits);
        syncToParent(newDigits);
        onClearError();
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      if (index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'ArrowRight') {
      if (index > 0) inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = toEnglishNumbers(e.clipboardData.getData('text')).replace(/\D/g, '');
    if (!pasted) return;
    const newDigits = [...digits];
    for (let i = 0; i < OTP_LENGTH; i++) {
      newDigits[i] = pasted[i] ?? '';
    }
    setDigits(newDigits);
    syncToParent(newDigits);
    onClearError();
    const nextEmpty = newDigits.findIndex(d => !d);
    const focusIndex = nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty;
    inputRefs.current[focusIndex]?.focus();
  };

  const isCodeComplete = digits.every(d => d !== '');

  // Auto-submit when code is complete AND agreedTerms is true
  useEffect(() => {
    if (isCodeComplete && agreedTerms && !isVerifyingCode) {
      onSubmit();
    }
  }, [isCodeComplete, agreedTerms, isVerifyingCode, onSubmit]);

  const displayPhone = formatPhoneNumber(phoneNumber);

  const formatTimerDisplay = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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
        <div className="h-px bg-[#eee]" />

        {/* Content */}
        <div className="px-5 py-6 flex flex-col flex-1">
          <h1 className="text-[22px] font-bold text-black mb-1 text-right" style={{ fontFamily: "'Cairo', sans-serif" }}>
            تحقق من رقمك
          </h1>

          {/* Phone Card - with phone number and change link inside same card */}
          <div 
            className="border border-gray-200 rounded-lg p-4 bg-white mb-4"
          >
            <div className="text-right">
              <div className="text-black font-bold text-lg border-b border-black inline-block pb-1">
                {displayPhone}
              </div>
              <div 
                className="text-purple-600 text-sm mt-1 cursor-pointer hover:underline"
                style={{ color: '#6C1DD6' }}
                onClick={onBack}
              >
                تبي تغير الرقم؟
              </div>
            </div>
          </div>

          {/* Verification message */}
          <p className="text-[12px] text-[#666] mb-6 text-right">
            لقد أرسلنا للتو رمز التحقق عبر الرسائل القصيرة
          </p>

          {/* OTP boxes */}
          <div className="flex justify-center gap-2 mb-3" dir="ltr">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleDigitChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-[36px] h-[44px] text-center text-[18px] font-bold rounded-[6px] outline-none transition-all"
                style={{
                  border: codeError
                    ? '1px solid #ef4444'
                    : digit
                    ? '1px solid #6C1DD6'
                    : '1px solid #ddd',
                  color: '#000',
                  backgroundColor: '#f7f7f7',
                  boxShadow: digit ? '0 0 0 2px rgba(108,29,214,0.1)' : 'none',
                }}
              />
            ))}
          </div>

          {/* Error message */}
          {codeError && (
            <p className="text-red-500 text-[13px] text-center mb-3">{codeError}</p>
          )}

          {/* Timer / resend - right aligned with title */}
          <div className="mb-6 flex justify-start">
            {resendTimer > 0 ? (
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-[20px] text-[13px]"
                style={{ backgroundColor: '#f5f6f9', color: '#777' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="7" cy="7" r="6" stroke="#888" strokeWidth="1.4"/>
                  <path d="M7 4v3.5l2 1.2" stroke="#888" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
                <span>إعادة الإرسال في {formatTimerDisplay(resendTimer)}</span>
              </div>
            ) : (
              <button
                className="text-[14px] font-bold underline"
                style={{ color: '#6C1DD6' }}
                onClick={() => {}}
              >
                إعادة إرسال الرمز
              </button>
            )}
          </div>

          {/* Spacer for fixed checkbox */}
          <div className="flex-1" />
        </div>
      </div>

      {/* Fixed Terms Checkbox at bottom right */}
      <div 
        className="fixed bottom-[10px] right-[10px] z-50"
        dir="rtl"
      >
        <label className="flex items-center gap-2 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={agreedTerms}
              onChange={e => setAgreedTerms(e.target.checked)}
              className="sr-only"
            />
            <div
              className="w-6 h-6 rounded-[4px] flex items-center justify-center transition-colors"
              style={{
                backgroundColor: agreedTerms ? '#6C1DD6' : '#fff',
                border: agreedTerms ? '2px solid #6C1DD6' : '2px solid #ccc',
              }}
              onClick={() => setAgreedTerms(!agreedTerms)}
            >
              {agreedTerms && (
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 5L5.5 9.5L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          </div>
          <span 
            className="text-[12px] font-medium"
            style={{ color: '#6C1DD6' }}
          >
            أوافق على شروط وأحكام تمارا
          </span>
        </label>
      </div>
    </div>
  );
};

export default VerifyPhone;
