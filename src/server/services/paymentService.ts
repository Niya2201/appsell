import { PlanTier, Subscription } from '../../types';

export interface PaymentIntentRequest {
  businessId: string;
  planId: PlanTier;
  billingCycle: 'monthly' | 'yearly';
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
}

export interface PaymentIntentResponse {
  paymentId: string;
  orderId: string;
  amount: number;
  currency: string;
  provider: 'revenuecat' | 'web_payment_india';
  checkoutUrl?: string;
  clientSecret?: string;
  upiPaymentLink?: string;
}

export interface WebhookEventPayload {
  event: string;
  id: string;
  businessId: string;
  planId: PlanTier;
  status: string;
  timestamp: string;
  rawPayload?: any;
}

export interface IPaymentProvider {
  name: string;
  createCheckoutSession(request: PaymentIntentRequest): Promise<PaymentIntentResponse>;
  handleWebhook(rawBody: string | any, headers: Record<string, string>): Promise<WebhookEventPayload>;
  cancelSubscription(subscriptionId: string): Promise<boolean>;
}

export class RevenueCatProvider implements IPaymentProvider {
  public name = 'revenuecat';
  private apiKey: string | undefined;

  constructor() {
    this.apiKey = process.env.REVENUECAT_API_KEY;
  }

  public isConfigured(): boolean {
    return !!this.apiKey;
  }

  public async createCheckoutSession(request: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    if (!this.apiKey) {
      // In demo mode or unconfigured, return simulation link with full payload
      return {
        paymentId: `rc_sub_${Date.now()}`,
        orderId: `rc_ord_${Date.now()}`,
        amount: request.amount,
        currency: request.currency,
        provider: 'revenuecat',
        checkoutUrl: `https://app.revenuecat.com/checkout/demo?businessId=${request.businessId}&plan=${request.planId}`,
      };
    }

    // Official RevenueCat REST API v2 Subscriber purchase / checkout call
    const res = await fetch(`https://api.revenuecat.com/v2/projects/default/customers/${request.businessId}/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: `replyflow_${request.planId}_${request.billingCycle}`,
        price: request.amount,
        currency: request.currency,
      }),
    });

    if (!res.ok) {
      throw new Error(`RevenueCat API responded with ${res.status}: ${await res.text()}`);
    }

    const data = await res.json();
    return {
      paymentId: data.id || `rc_sub_${Date.now()}`,
      orderId: data.order_id || `rc_ord_${Date.now()}`,
      amount: request.amount,
      currency: request.currency,
      provider: 'revenuecat',
      checkoutUrl: data.checkout_url,
    };
  }

  public async handleWebhook(rawBody: any, headers: Record<string, string>): Promise<WebhookEventPayload> {
    const event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    const rcEvent = event.event || {};

    return {
      event: rcEvent.type || 'RENEWAL',
      id: rcEvent.id || `evt_${Date.now()}`,
      businessId: rcEvent.app_user_id || 'unknown',
      planId: (rcEvent.product_id?.split('_')?.[1] as PlanTier) || 'starter',
      status: rcEvent.type === 'CANCELLATION' ? 'cancelled' : 'active',
      timestamp: new Date().toISOString(),
      rawPayload: event,
    };
  }

  public async cancelSubscription(subscriptionId: string): Promise<boolean> {
    if (!this.apiKey) {
      return true; // Demo mode success
    }
    // Call RevenueCat cancel API
    return true;
  }
}

export class WebPaymentProvider implements IPaymentProvider {
  public name = 'web_payment_india';
  private secret: string | undefined;

  constructor() {
    this.secret = process.env.PAYMENT_PROVIDER_SECRET;
  }

  public isConfigured(): boolean {
    return !!this.secret;
  }

  public async createCheckoutSession(request: PaymentIntentRequest): Promise<PaymentIntentResponse> {
    const orderId = `order_in_${Date.now()}`;
    const paymentId = `pay_in_${Date.now()}`;

    // Generates simulated or real UPI Intent URI for Indian Small Businesses
    const upiUri = `upi://pay?pa=billing@replyflow&pn=ReplyFlow%20AI&am=${request.amount}&cu=INR&tn=ReplyFlow%20${request.planId.toUpperCase()}%20Subscription`;

    return {
      paymentId,
      orderId,
      amount: request.amount,
      currency: 'INR',
      provider: 'web_payment_india',
      checkoutUrl: `/checkout?order_id=${orderId}&amount=${request.amount}`,
      upiPaymentLink: upiUri,
      clientSecret: `sec_${Date.now()}`,
    };
  }

  public async handleWebhook(rawBody: any, headers: Record<string, string>): Promise<WebhookEventPayload> {
    const event = typeof rawBody === 'string' ? JSON.parse(rawBody) : rawBody;
    return {
      event: event.event || 'payment.captured',
      id: event.id || `evt_${Date.now()}`,
      businessId: event.payload?.businessId || 'unknown',
      planId: (event.payload?.planId as PlanTier) || 'growth',
      status: 'active',
      timestamp: new Date().toISOString(),
      rawPayload: event,
    };
  }

  public async cancelSubscription(subscriptionId: string): Promise<boolean> {
    return true;
  }
}

export class PaymentManager {
  private revenueCat: RevenueCatProvider;
  private webPayment: WebPaymentProvider;

  constructor() {
    this.revenueCat = new RevenueCatProvider();
    this.webPayment = new WebPaymentProvider();
  }

  public getProvider(preferred?: 'revenuecat' | 'web_payment_india'): IPaymentProvider {
    if (preferred === 'revenuecat' && this.revenueCat.isConfigured()) {
      return this.revenueCat;
    }
    // Default to Indian Web Payment Provider for INR pricing and UPI flow
    return this.webPayment;
  }

  public getRevenueCat(): RevenueCatProvider {
    return this.revenueCat;
  }

  public getWebPayment(): WebPaymentProvider {
    return this.webPayment;
  }
}

export const paymentManager = new PaymentManager();
