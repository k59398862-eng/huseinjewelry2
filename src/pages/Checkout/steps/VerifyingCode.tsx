interface VerifyingCodeProps {
  operationId: number;
  amount: number;
}

const VerifyingCode = ({ operationId, amount }: VerifyingCodeProps) => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4" dir="rtl">
      {/* Loading Spinner */}
      <div className="w-16 h-16 rounded-full mx-auto mb-7 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin" />
      </div>

      {/* Main Title */}
      <h2 className="text-lg font-bold text-black text-center mb-3">
        جاري التحقق من صحة الكود
      </h2>

      {/* Subtitle - Two Lines */}
      <p className="text-gray-500 text-center text-sm mb-4">
        يرجى الانتظار، نحن نتحقق من صحة كود التحقق الذي
      </p>
      <p className="text-gray-500 text-center text-sm mb-4">
        أدخلته
      </p>

      {/* Status Box */}
      <div className="bg-gray-100 rounded-lg px-4 py-3 mb-4 w-full max-w-sm">
        <p className="text-sm text-black">
          <span className="font-bold">الحالة:</span>{' '}
          في انتظار الموافقة
        </p>
      </div>

      {/* Empty Line */}
      <div className="mb-4" />

      {/* Gray Rectangle with Operation ID and Amount */}
      <div className="bg-gray-100 rounded-lg px-4 py-3 mb-4 w-full max-w-sm border-r-4 border-blue-500">
        <p className="text-sm mb-2">
          <span className="font-bold text-black">معرف العملية:</span>{' '}
          <span className="text-black">{operationId}</span>
        </p>
        <p className="text-sm text-blue-700">
          المبلغ: {amount} ريال
        </p>
      </div>

      {/* Redirect Text */}
      <p className="text-gray-500 text-center text-sm mb-3">
        سيتم تحويلك تلقائياً إلى صفحة النتيجة خلال ثوان
      </p>

      {/* Note */}
      <p className="text-gray-400 text-center text-xs">
        ملاحظة: هذه العملية قد تستغرق بضع ثوان
      </p>
    </div>
  );
};

export default VerifyingCode;
