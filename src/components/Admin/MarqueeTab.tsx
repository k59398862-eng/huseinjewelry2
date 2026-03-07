import { useState } from 'react';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface MarqueeTabProps {
  initialText: string;
  initialEnabled: boolean;
  onSave: (text: string, enabled: boolean) => void;
}

const MarqueeTab = ({ initialText, initialEnabled, onSave }: MarqueeTabProps) => {
  const [text, setText] = useState(initialText);
  const [enabled, setEnabled] = useState(initialEnabled);
  const [hasChanges, setHasChanges] = useState(false);

  const handleTextChange = (value: string) => {
    setText(value);
    setHasChanges(true);
  };

  const handleEnabledChange = (checked: boolean) => {
    setEnabled(checked);
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!text.trim()) {
      toast.error('النص لا يمكن أن يكون فارغاً');
      return;
    }

    if (text.length > 500) {
      toast.error('النص طويل جداً (الحد الأقصى 500 حرف)');
      return;
    }

    onSave(text, enabled);
    setHasChanges(false);
    toast.success('تم حفظ إعدادات الشريط المتحرك');
  };

  return (
    <div className="space-y-6">
      {/* Preview Section */}
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(212, 175, 55, 0.2)' }}>
        <div className="px-4 py-3 border-b" style={{ borderColor: 'rgba(212, 175, 55, 0.2)' }}>
          <h3 className="font-bold gold-text">معاينة الشريط</h3>
        </div>
        <div className="py-3 my-0" style={{ background: '#0B1020' }}>
          <div className="marquee-container">
            <div className={`marquee-content ${!enabled ? 'opacity-30' : ''}`}>
              <span className="text-lg font-bold" style={{
                background: 'linear-gradient(90deg, #D4AF37, #FFD700, #F6E27A, #D4AF37)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'shimmer 3s linear infinite'
              }}>
                {text}{text}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <div className="rounded-xl p-6" style={{ border: '1px solid rgba(212, 175, 55, 0.2)', background: 'rgba(15, 23, 42, 0.5)' }}>
        <h3 className="font-bold gold-text mb-6">إعدادات الشريط المتحرك</h3>

        {/* Enable/Disable Switch */}
        <div className="flex items-center justify-between py-4 border-b" style={{ borderColor: 'rgba(212, 175, 55, 0.1)' }}>
          <div>
            <Label htmlFor="marquee-enabled" className="text-base font-semibold text-[#E6ECF8]">
              تشغيل الشريط المتحرك
            </Label>
            <p className="text-sm text-[#E6ECF8]/60 mt-1">
              إظهار أو إخفاء الشريط المتحرك في الصفحة الرئيسية
            </p>
          </div>
          <Switch
            id="marquee-enabled"
            checked={enabled}
            onCheckedChange={handleEnabledChange}
          />
        </div>

        {/* Text Content */}
        <div className="py-4 space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="marquee-text" className="text-base font-semibold text-[#E6ECF8]">
              نص الشريط
            </Label>
            <span className={`text-xs ${text.length > 500 ? 'text-red-400' : 'text-[#E6ECF8]/60'}`}>
              {text.length}/500
            </span>
          </div>
          <Textarea
            id="marquee-text"
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="أدخل نص الشريط المتحرك..."
            className="min-h-[120px] text-base resize-none"
            dir="rtl"
            maxLength={500}
          />
          <p className="text-xs text-[#E6ECF8]/50">
            استخدم الرموز مثل ☆ للفصل بين العبارات
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            className="w-full sm:w-auto gap-2 gold-gradient"
          >
            <Save className="h-4 w-4" />
            {hasChanges ? 'حفظ التغييرات' : 'تم الحفظ'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MarqueeTab;
