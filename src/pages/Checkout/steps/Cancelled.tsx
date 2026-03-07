import { XCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CancelledProps {
  onRetry?: () => void;
}

const Cancelled = ({ onRetry }: CancelledProps) => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center w-full px-5" dir="rtl">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm w-full">
      <div className="mb-6">
        <img
          src="/tamara-logo.webp"
          alt="Tamara"
          className="h-10 mx-auto object-contain"
        />
      </div>

      <div className="w-20 h-20 rounded-full bg-red-100 mx-auto mb-6 flex items-center justify-center">
        <XCircle className="h-10 w-10 text-red-500" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-2">تم إلغاء العملية</h2>
      <p className="text-gray-500 mb-6">لم يتم الموافقة على بيانات البطاقة</p>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-red-700">
          يرجى التحقق من بيانات البطاقة والمحاولة مرة أخرى
        </p>
      </div>

      <Button 
        onClick={onRetry}
        className="w-full bg-[#d4af37] hover:bg-[#c9a030] text-white font-bold py-4 rounded-lg"
      >
        <RefreshCw className="h-4 w-4 ml-2" />
        المحاولة مرة أخرى
      </Button>
      </div>
    </div>
  );
};

export default Cancelled;
