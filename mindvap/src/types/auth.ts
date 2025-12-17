// Authentication Types and Interfaces
// Defines all types used throughout the authentication system

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth: string;
  ageVerified: boolean;
  ageVerifiedAt?: string;
  emailVerified: boolean;
  emailVerifiedAt?: string;
  marketingConsent: boolean;
  marketingConsentAt?: string;
  termsAccepted: boolean;
  termsAcceptedAt?: string;
  privacyAccepted: boolean;
  privacyAcceptedAt?: string;
  status: 'active' | 'suspended' | 'deleted';
  failedLoginAttempts: number;
  accountLockedUntil?: string;
  lastLogin?: string;
  passwordChangedAt: string;
  createdAt: string;
  updatedAt: string;
  // GDPR Compliance Fields
  dataProcessingConsent: boolean;
  dataProcessingConsentAt?: string;
  dataRetentionPeriod: number;
  deletionRequestedAt?: string;
  deletionScheduledAt?: string;
  deletionCompletedAt?: string;
  deletionReason?: string;
}

export interface UserSession {
  id: string;
  userId: string;
  refreshTokenHash: string;
  refreshTokenExpires: string;
  deviceFingerprint?: string;
  userAgent?: string;
  ipAddress?: string;
  locationCountry?: string;
  locationCity?: string;
  isActive: boolean;
  lastUsedAt: string;
  createdAt: string;
  updatedAt: string;
  suspiciousActivity: boolean;
  riskScore: number;
  failedRefreshAttempts: number;
  lastFailedRefresh?: string;
}

export interface UserAddress {
  id: string;
  userId: string;
  type: 'billing' | 'shipping' | 'both';
  isDefault: boolean;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt?: string;
}

export interface Session {
  id: string;
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
  deviceFingerprint: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceInfo: {
    fingerprint: string;
    userAgent: string;
  };
}

export interface LoginResponse {
  success: boolean;
  message: string;
  session?: Session;
  error?: {
    code: string;
    message: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone?: string;
  marketingConsent: boolean;
  termsAccepted: boolean;
  privacyAccepted: boolean;
  dataProcessingConsent: boolean;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  userId?: string;
  emailVerificationRequired?: boolean;
  ageVerificationRequired?: boolean;
  verificationToken?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface VerifyEmailRequest {
  token: string;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  error?: {
    code: string;
    message: string;
  };
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  user?: User;
  error?: {
    code: string;
    message: string;
  };
}

export interface EmailPreferences {
  marketingEmails: boolean;
  orderUpdates: boolean;
  newsletter: boolean;
  abandonedCart: boolean;
  priceAlerts: boolean;
  securityAlerts: boolean;
  lastUpdated: string;
}

export interface UpdateEmailPreferencesRequest {
  marketingEmails?: boolean;
  orderUpdates?: boolean;
  newsletter?: boolean;
  abandonedCart?: boolean;
  priceAlerts?: boolean;
}

export interface EmailPreferencesResponse {
  success: boolean;
  message: string;
  preferences?: EmailPreferences;
  error?: {
    code: string;
    message: string;
  };
}

export interface AgeVerificationRequest {
  documentType: 'drivers_license' | 'passport' | 'state_id';
  documentImage: string; // Base64 encoded
  selfieImage?: string; // Base64 encoded
}

export interface AgeVerificationResponse {
  success: boolean;
  message: string;
  verificationId?: string;
  status?: 'pending' | 'approved' | 'rejected';
  error?: {
    code: string;
    message: string;
  };
}

export interface CreateAddressRequest {
  type: 'billing' | 'shipping' | 'both';
  isDefault?: boolean;
  firstName: string;
  lastName: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {
  id: string;
}

export interface AddressResponse {
  success: boolean;
  message: string;
  address?: UserAddress;
  error?: {
    code: string;
    message: string;
  };
}

export interface DataExportRequest {
  includeDeleted?: boolean;
  includeSessions?: boolean;
}

export interface DataExportResponse {
  success: boolean;
  message: string;
  exportId?: string;
  downloadUrl?: string;
  processingTime?: number;
  error?: {
    code: string;
    message: string;
  };
}

export interface DeleteAccountRequest {
  reason: string;
  password: string;
}

export interface DeleteAccountResponse {
  success: boolean;
  message: string;
  deletionScheduledFor?: string;
  dataRetentionUntil?: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: 'terms' | 'privacy' | 'marketing' | 'data_processing';
  policyVersion: string;
  accepted: boolean;
  acceptedAt: string;
  ipAddress?: string;
  userAgent?: string;
  consentMethod?: string;
  consentContext?: Record<string, any>;
}

export interface SecurityEvent {
  type: 'failed_login' | 'successful_login' | 'password_reset' | 'suspicious_activity';
  userId?: string;
  email?: string;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  timestamp: Date;
}

export interface AuthError {
  code: string;
  message: string;
  field?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: AuthError | ValidationError;
  message?: string;
}

// Authentication context types
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
  isAgeVerified: boolean;
  login: (credentials: LoginRequest) => Promise<LoginResponse>;
  register: (userData: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<RefreshTokenResponse>;
  updateProfile: (data: UpdateProfileRequest) => Promise<UpdateProfileResponse>;
  changePassword: (data: ChangePasswordRequest) => Promise<ChangePasswordResponse>;
  forgotPassword: (email: string) => Promise<ForgotPasswordResponse>;
  resetPassword: (data: ResetPasswordRequest) => Promise<ResetPasswordResponse>;
  verifyEmail: (token: string) => Promise<VerifyEmailResponse>;
  updateEmailPreferences: (preferences: UpdateEmailPreferencesRequest) => Promise<EmailPreferencesResponse>;
  requestAgeVerification: (data: AgeVerificationRequest) => Promise<AgeVerificationResponse>;
  exportUserData: () => Promise<DataExportResponse>;
  deleteAccount: (data: DeleteAccountRequest) => Promise<DeleteAccountResponse>;
  clearError: () => void;
}

// Route protection types
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAgeVerification?: boolean;
  requireEmailVerification?: boolean;
  fallback?: React.ReactNode;
}

// Device information types
export interface DeviceInfo {
  fingerprint: string;
  userAgent: string;
  platform?: string;
  screenResolution?: string;
  timezone?: string;
  language?: string;
  touchPoints?: number;
}

// Authentication state types
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  session: Session | null;
  error: AuthError | null;
  deviceInfo: DeviceInfo;
}

// Form validation types
export interface FormFieldError {
  field: string;
  message: string;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: FormFieldError[];
}

// Password strength types
export interface PasswordStrength {
  score: number; // 0-4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  feedback: string[];
  color: 'red' | 'orange' | 'yellow' | 'blue' | 'green';
}

// Order and Product Types
export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  currency: string;
  shippingAddress: UserAddress;
  billingAddress: UserAddress;
  paymentMethod: PaymentMethod;
  items: OrderItem[];
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  variant?: string;
  sku: string;
}

export interface PaymentMethod {
  id: string;
  userId: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
  stripePaymentMethodId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: any; // Product interface from your types
  addedAt: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  type: 'login' | 'order_placed' | 'profile_updated' | 'address_added' | 'payment_added';
  description: string;
  metadata: Record<string, any>;
  createdAt: string;
}

// Account Management Request/Response Types
export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
    variant?: string;
  }>;
  shippingAddressId: string;
  billingAddressId: string;
  paymentMethodId: string;
  notes?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  order?: Order;
  error?: {
    code: string;
    message: string;
  };
}

export interface GetOrdersRequest {
  page?: number;
  limit?: number;
  status?: string;
  sortBy?: 'createdAt' | 'total' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface GetOrdersResponse {
  success: boolean;
  message?: string;
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface GetOrderDetailsResponse {
  success: boolean;
  message?: string;
  order?: Order;
  error?: {
    code: string;
    message: string;
  };
}

export interface CreatePaymentMethodRequest {
  type: 'card';
  cardNumber: string;
  expMonth: number;
  expYear: number;
  cvc: string;
  isDefault?: boolean;
}

export interface CreatePaymentMethodResponse {
  success: boolean;
  message: string;
  paymentMethod?: PaymentMethod;
  error?: {
    code: string;
    message: string;
  };
}

export interface GetPaymentMethodsResponse {
  success: boolean;
  message?: string;
  paymentMethods: PaymentMethod[];
  error?: {
    code: string;
    message: string;
  };
}

export interface DeletePaymentMethodRequest {
  id: string;
}

export interface DeletePaymentMethodResponse {
  success: boolean;
  message: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface SetDefaultPaymentMethodRequest {
  id: string;
}

export interface SetDefaultPaymentMethodResponse {
  success: boolean;
  message: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface AddWishlistItemRequest {
  productId: string;
}

export interface AddWishlistItemResponse {
  success: boolean;
  message: string;
  wishlistItem?: WishlistItem;
  error?: {
    code: string;
    message: string;
  };
}

export interface GetWishlistResponse {
  success: boolean;
  message?: string;
  items: WishlistItem[];
  error?: {
    code: string;
    message: string;
  };
}

export interface RemoveWishlistItemRequest {
  id: string;
}

export interface RemoveWishlistItemResponse {
  success: boolean;
  message: string;
  error?: {
    code: string;
    message: string;
  };
}

export interface MoveWishlistToCartRequest {
  wishlistItemId: string;
  quantity?: number;
}

export interface MoveWishlistToCartResponse {
  success: boolean;
  message: string;
  cartItem?: {
    product: any;
    quantity: number;
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface GetUserActivityRequest {
  limit?: number;
  type?: string;
  since?: string;
}

export interface GetUserActivityResponse {
  success: boolean;
  message?: string;
  activities: UserActivity[];
  error?: {
    code: string;
    message: string;
  };
}

// Dashboard specific types
export interface DashboardStats {
  totalOrders: number;
  totalSpent: number;
  wishlistCount: number;
  lastOrderDate?: string;
  emailVerified: boolean;
  ageVerified: boolean;
  recentActivity: UserActivity[];
}

export interface GetDashboardStatsResponse {
  success: boolean;
  message?: string;
  stats?: DashboardStats;
  error?: {
    code: string;
    message: string;
  };
}