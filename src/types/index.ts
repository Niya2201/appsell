export type UserRole = 'owner' | 'staff' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  businessId: string;
  avatar?: string;
  phone?: string;
}

export type PlanTier = 'free' | 'starter' | 'growth' | 'business';

export type SubscriptionStatus =
  | 'free'
  | 'trial'
  | 'active'
  | 'past_due'
  | 'cancelled'
  | 'expired';

export interface PlanLimits {
  aiConversationsMonthly: number;
  customerLimit: number;
  staffLimit: number;
  advancedAnalytics: boolean;
  automatedFollowups: boolean;
  paymentReminders: boolean;
  voiceMessages: boolean;
  customAiInstructions: boolean;
  multilingualAi: boolean;
  prioritySupport: boolean;
}

export interface Plan {
  id: PlanTier;
  name: string;
  priceMonthly: number; // in INR ₹
  priceYearly: number;  // in INR ₹
  description: string;
  popular?: boolean;
  limits: PlanLimits;
  features: string[];
}

export interface Subscription {
  id: string;
  businessId: string;
  planId: PlanTier;
  status: SubscriptionStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEndsAt?: string;
  paymentMethod?: {
    type: 'upi' | 'card' | 'netbanking' | 'revenuecat';
    last4?: string;
    brand?: string;
  };
}

export interface BusinessHours {
  open: string;
  close: string;
  closed: boolean;
}

export type AIPersonality = 'professional' | 'friendly' | 'casual' | 'concise';

export type SupportedLanguage =
  | 'en' // English
  | 'hi' // Hindi
  | 'ml' // Malayalam
  | 'ta' // Tamil
  | 'te' // Telugu
  | 'kn'; // Kannada

export interface Business {
  id: string;
  name: string;
  category: string;
  description: string;
  location: string;
  phone: string;
  email: string;
  website?: string;
  currency: string;
  timezone: string;
  hours: Record<string, BusinessHours>;
  aiPersonality: AIPersonality;
  primaryLanguage: SupportedLanguage;
  supportedLanguages: SupportedLanguage[];
  customAiInstructions?: string;
  autoReplyEnabled: boolean;
  whatsappPhoneNumberId?: string;
  createdAt: string;
}

export interface UsageStats {
  businessId: string;
  period: string; // e.g., '2026-09'
  aiConversationsUsed: number;
  customersCount: number;
  staffCount: number;
  ordersCount: number;
  appointmentsCount: number;
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  email?: string;
  tags: string[];
  firstContactedAt: string;
  lastContactedAt: string;
  totalOrders: number;
  totalSpend: number; // INR
  appointmentsCount: number;
  pendingPayment: number; // INR
  notes: string;
  aiSummary: string;
  preferredLanguage?: SupportedLanguage;
}

export type ConversationStatus =
  | 'ai_handling'
  | 'human_required'
  | 'resolved'
  | 'follow_up';

export interface Conversation {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  status: ConversationStatus;
  lastMessage: string;
  lastMessageTimestamp: string;
  unreadCount: number;
  channel: 'whatsapp_simulator' | 'whatsapp_cloud';
  assignedStaffId?: string;
  sentiment?: 'positive' | 'neutral' | 'urgent' | 'negative';
}

export interface MessageMetadata {
  intent?: string;
  confidence?: number;
  actionTaken?: string;
  requiresHuman?: boolean;
  languageDetected?: SupportedLanguage;
  extractedData?: Record<string, any>;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'customer' | 'ai' | 'agent' | 'system';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  metadata?: MessageMetadata;
}

export interface ProductService {
  id: string;
  businessId: string;
  type: 'product' | 'service';
  name: string;
  description: string;
  price: number; // INR ₹
  durationMinutes?: number;
  category: string;
  isAvailable: boolean;
  imageUrl?: string;
}

export type AppointmentStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Appointment {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  staffName: string;
  status: AppointmentStatus;
  price: number;
  notes?: string;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'refunded';
export type OrderStatus = 'received' | 'processing' | 'ready' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  deliveryDate?: string;
  notes?: string;
  createdAt: string;
}

export interface Automation {
  id: string;
  businessId: string;
  name: string;
  triggerType:
    | 'appointment_24h'
    | 'payment_pending_24h'
    | 'lead_inactive_48h'
    | 'birthday_greeting';
  actionType: 'send_whatsapp_message';
  templateText: string;
  isEnabled: boolean;
  lastRunAt?: string;
  executionCount: number;
}

export interface FAQItem {
  id: string;
  businessId: string;
  question: string;
  answer: string;
  category: string;
}

export interface Lead {
  id: string;
  businessId: string;
  customerId: string;
  name: string;
  phone: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  estimatedValue: number;
  interest: string;
  createdAt: string;
}

export interface AnalyticsSummary {
  todayConversations: number;
  aiResolutionRate: number; // percentage e.g. 91
  newLeads: number;
  ordersCount: number;
  appointmentsCount: number;
  pendingPaymentsAmount: number;
  aiUsageMonthly: number;
  aiMonthlyLimit: number;
  customerGrowthRate: number;
  averageResponseTimeSeconds: number;
}
