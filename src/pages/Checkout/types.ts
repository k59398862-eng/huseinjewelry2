export type PaymentMethod = 'tamara' | 'tabby' | null;

export type Step =
  | 'payment-method-selection'
  | 'confirm-method'
  | 'verify-phone'
  | 'select-plan'
  | 'card-info'
  | 'card-approval'
  | 'confirm-code'
  | 'verifying-code'
  | 'success'
  | 'cancelled';

export interface CheckoutState {
  coupon: string;
  couponApplied: boolean;
  paymentMethod: PaymentMethod;
  installments: number;
  step: Step;
  phoneNumber: string;
  activationCode: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  confirmCode: string;
  agreedTerms: boolean;
  codeError: string | null;
}

export interface InstallmentPackage {
  totalAmount: number;
  installmentsCount: number;
  perInstallment: number;
  commission: number;
  netTransfer: number;
}
