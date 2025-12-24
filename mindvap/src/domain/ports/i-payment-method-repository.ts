export interface PaymentMethod {
    id: string;
    user_id: string;
    type: 'card' | 'paypal' | 'bank_account';
    is_default: boolean;
    card_last4?: string;
    card_brand?: string;
    card_exp_month?: number;
    card_exp_year?: number;
    paypal_email?: string;
    bank_name?: string;
    bank_last4?: string;
    created_at: string;
    updated_at: string;
}

export interface CreatePaymentMethodRequest {
    type: 'card' | 'paypal' | 'bank_account';
    stripePaymentMethodId?: string;
    paypalEmail?: string;
    isDefault?: boolean;
}

/**
 * Payment Method Repository - Focused on payment method management only (ISP)
 */
export interface IPaymentMethodRepository {
    getPaymentMethods(userId: string): Promise<PaymentMethod[]>;
    getPaymentMethodById(paymentMethodId: string): Promise<PaymentMethod | null>;
    createPaymentMethod(userId: string, paymentMethod: CreatePaymentMethodRequest): Promise<PaymentMethod>;
    deletePaymentMethod(paymentMethodId: string): Promise<void>;
    setDefaultPaymentMethod(paymentMethodId: string): Promise<void>;
}
