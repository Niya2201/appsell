import {
  Business,
  User,
  Customer,
  Conversation,
  Message,
  ProductService,
  Appointment,
  Order,
  Automation,
  FAQItem,
  Subscription,
  UsageStats,
  Lead,
  PlanTier,
} from '../../types';
import {
  SEED_BUSINESS,
  SEED_USERS,
  SEED_SUBSCRIPTIONS,
  SEED_USAGE,
  SEED_SERVICES,
  SEED_CUSTOMERS,
  SEED_CONVERSATIONS,
  SEED_MESSAGES,
  SEED_APPOINTMENTS,
  SEED_ORDERS,
  SEED_AUTOMATIONS,
  SEED_FAQS,
  SEED_LEADS,
} from '../../data/seedData';
import { subscriptionService } from '../services/subscriptionService';

export class SaaSDataStore {
  public businesses: Map<string, Business> = new Map();
  public users: Map<string, User> = new Map();
  public subscriptions: Map<string, Subscription> = new Map();
  public usage: Map<string, UsageStats> = new Map();
  public services: Map<string, ProductService[]> = new Map();
  public customers: Map<string, Customer[]> = new Map();
  public conversations: Map<string, Conversation[]> = new Map();
  public messages: Map<string, Message[]> = new Map();
  public appointments: Map<string, Appointment[]> = new Map();
  public orders: Map<string, Order[]> = new Map();
  public automations: Map<string, Automation[]> = new Map();
  public faqs: Map<string, FAQItem[]> = new Map();
  public leads: Map<string, Lead[]> = new Map();

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Seed primary business: Glow Beauty Salon
    this.businesses.set(SEED_BUSINESS.id, { ...SEED_BUSINESS });

    // Seed test users
    SEED_USERS.forEach((u) => this.users.set(u.id, { ...u }));

    // Seed subscriptions & usage
    Object.entries(SEED_SUBSCRIPTIONS).forEach(([bId, sub]) => {
      this.subscriptions.set(bId, { ...sub });
    });
    Object.entries(SEED_USAGE).forEach(([bId, use]) => {
      this.usage.set(bId, { ...use });
    });

    // Seed tenant collections for Glow Beauty Salon
    const bId = SEED_BUSINESS.id;
    this.services.set(bId, [...SEED_SERVICES]);
    this.customers.set(bId, [...SEED_CUSTOMERS]);
    this.conversations.set(bId, [...SEED_CONVERSATIONS]);
    this.appointments.set(bId, [...SEED_APPOINTMENTS]);
    this.orders.set(bId, [...SEED_ORDERS]);
    this.automations.set(bId, [...SEED_AUTOMATIONS]);
    this.faqs.set(bId, [...SEED_FAQS]);
    this.leads.set(bId, [...SEED_LEADS]);

    // Seed messages
    Object.entries(SEED_MESSAGES).forEach(([convId, msgs]) => {
      this.messages.set(convId, [...msgs]);
    });

    // Also seed businesses for other test accounts
    this.seedDemoBusiness('biz_free_demo', 'Chai Point Bakery & Cafe', 'Bakery & Cafe', 'free');
    this.seedDemoBusiness('biz_trial_demo', 'Smile Care Dental Clinic', 'Healthcare & Dental', 'growth', true);
    this.seedDemoBusiness('biz_starter_demo', 'FitPulse Personal Training', 'Fitness & Gym', 'starter');
    this.seedDemoBusiness('biz_business_demo', 'Vogue Luxe Fashion Boutique', 'Fashion & Retail', 'business');
  }

  private seedDemoBusiness(id: string, name: string, category: string, planId: PlanTier, isTrial = false) {
    const biz: Business = {
      id,
      name,
      category,
      description: `Quality ${category} services catering to customers with modern convenience.`,
      location: 'MG Road, Bengaluru, Karnataka, India',
      phone: '+91 98111 22334',
      email: `contact@${id}.com`,
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      hours: {
        monday: { open: '09:00', close: '20:00', closed: false },
        tuesday: { open: '09:00', close: '20:00', closed: false },
        wednesday: { open: '09:00', close: '20:00', closed: false },
        thursday: { open: '09:00', close: '20:00', closed: false },
        friday: { open: '09:00', close: '20:00', closed: false },
        saturday: { open: '09:00', close: '20:00', closed: false },
        sunday: { open: '10:00', close: '18:00', closed: false },
      },
      aiPersonality: 'friendly',
      primaryLanguage: 'en',
      supportedLanguages: ['en', 'hi'],
      autoReplyEnabled: true,
      createdAt: new Date().toISOString(),
    };
    this.businesses.set(id, biz);

    if (!this.subscriptions.has(id)) {
      this.subscriptions.set(id, {
        id: `sub_${id}`,
        businessId: id,
        planId,
        status: isTrial ? 'trial' : planId === 'free' ? 'free' : 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
        trialEndsAt: isTrial ? new Date(Date.now() + 6 * 86400000).toISOString() : undefined,
        cancelAtPeriodEnd: false,
      });
    }

    if (!this.usage.has(id)) {
      this.usage.set(id, {
        businessId: id,
        period: '2026-09',
        aiConversationsUsed: planId === 'free' ? 48 : 120,
        customersCount: 15,
        staffCount: 1,
        ordersCount: 2,
        appointmentsCount: 3,
      });
    }

    this.services.set(id, [
      {
        id: `srv_${id}_1`,
        businessId: id,
        type: 'service',
        name: 'Standard Consultation / Service',
        description: 'Comprehensive initial service and care.',
        price: 500,
        category: 'General',
        isAvailable: true,
      },
    ]);

    this.customers.set(id, []);
    this.conversations.set(id, []);
    this.appointments.set(id, []);
    this.orders.set(id, []);
    this.automations.set(id, []);
    this.faqs.set(id, [
      {
        id: `faq_${id}_1`,
        businessId: id,
        question: 'What are your hours?',
        answer: 'We are open from 9 AM to 8 PM.',
        category: 'General',
      },
    ]);
    this.leads.set(id, []);
  }

  // --- Multi-Tenant Accessors with Isolation ---

  public getBusiness(businessId: string): Business | undefined {
    return this.businesses.get(businessId);
  }

  public getSubscription(businessId: string): Subscription {
    let sub = this.subscriptions.get(businessId);
    if (!sub) {
      sub = {
        id: `sub_${businessId}`,
        businessId,
        planId: 'free',
        status: 'free',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
        cancelAtPeriodEnd: false,
      };
      this.subscriptions.set(businessId, sub);
    }
    return sub;
  }

  public getUsage(businessId: string): UsageStats {
    let u = this.usage.get(businessId);
    if (!u) {
      u = {
        businessId,
        period: new Date().toISOString().substring(0, 7),
        aiConversationsUsed: 0,
        customersCount: 0,
        staffCount: 1,
        ordersCount: 0,
        appointmentsCount: 0,
      };
      this.usage.set(businessId, u);
    }
    return u;
  }

  public getServices(businessId: string): ProductService[] {
    return this.services.get(businessId) || [];
  }

  public addService(businessId: string, item: Omit<ProductService, 'id' | 'businessId'>): ProductService {
    const list = this.services.get(businessId) || [];
    const newService: ProductService = {
      ...item,
      id: `srv_${Date.now()}`,
      businessId,
    };
    list.push(newService);
    this.services.set(businessId, list);
    return newService;
  }

  public getCustomers(businessId: string): Customer[] {
    return this.customers.get(businessId) || [];
  }

  public addCustomer(businessId: string, customer: Omit<Customer, 'id' | 'businessId'>): Customer {
    const list = this.customers.get(businessId) || [];
    const newCust: Customer = {
      ...customer,
      id: `cust_${Date.now()}`,
      businessId,
    };
    list.unshift(newCust);
    this.customers.set(businessId, list);

    const usage = this.getUsage(businessId);
    usage.customersCount = list.length;
    return newCust;
  }

  public getConversations(businessId: string): Conversation[] {
    return this.conversations.get(businessId) || [];
  }

  public getMessages(conversationId: string): Message[] {
    return this.messages.get(conversationId) || [];
  }

  public addMessage(conversationId: string, message: Omit<Message, 'id' | 'conversationId'>): Message {
    const list = this.messages.get(conversationId) || [];
    const newMsg: Message = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      conversationId,
    };
    list.push(newMsg);
    this.messages.set(conversationId, list);

    // Update conversation lastMessage
    for (const [_, convs] of this.conversations.entries()) {
      const conv = convs.find((c) => c.id === conversationId);
      if (conv) {
        conv.lastMessage = newMsg.text;
        conv.lastMessageTimestamp = newMsg.timestamp;
        if (newMsg.sender === 'customer') {
          conv.unreadCount += 1;
        }
        break;
      }
    }
    return newMsg;
  }

  public updateConversationStatus(
    businessId: string,
    conversationId: string,
    status: Conversation['status']
  ): Conversation | undefined {
    const list = this.conversations.get(businessId) || [];
    const conv = list.find((c) => c.id === conversationId);
    if (conv) {
      conv.status = status;
      return conv;
    }
    return undefined;
  }

  public getAppointments(businessId: string): Appointment[] {
    return this.appointments.get(businessId) || [];
  }

  public addAppointment(businessId: string, item: Omit<Appointment, 'id' | 'businessId' | 'createdAt'>): Appointment {
    const list = this.appointments.get(businessId) || [];
    const newApt: Appointment = {
      ...item,
      id: `apt_${Date.now()}`,
      businessId,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newApt);
    this.appointments.set(businessId, list);

    const usage = this.getUsage(businessId);
    usage.appointmentsCount = list.length;
    return newApt;
  }

  public getOrders(businessId: string): Order[] {
    return this.orders.get(businessId) || [];
  }

  public addOrder(businessId: string, item: Omit<Order, 'id' | 'businessId' | 'createdAt'>): Order {
    const list = this.orders.get(businessId) || [];
    const newOrder: Order = {
      ...item,
      id: `ord_${Date.now()}`,
      businessId,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newOrder);
    this.orders.set(businessId, list);

    const usage = this.getUsage(businessId);
    usage.ordersCount = list.length;
    return newOrder;
  }

  public getAutomations(businessId: string): Automation[] {
    return this.automations.get(businessId) || [];
  }

  public getFaqs(businessId: string): FAQItem[] {
    return this.faqs.get(businessId) || [];
  }

  public addFaq(businessId: string, faq: Omit<FAQItem, 'id' | 'businessId'>): FAQItem {
    const list = this.faqs.get(businessId) || [];
    const newFaq: FAQItem = {
      ...faq,
      id: `faq_${Date.now()}`,
      businessId,
    };
    list.push(newFaq);
    this.faqs.set(businessId, list);
    return newFaq;
  }

  public getLeads(businessId: string): Lead[] {
    return this.leads.get(businessId) || [];
  }

  public addLead(businessId: string, lead: Omit<Lead, 'id' | 'businessId' | 'createdAt'>): Lead {
    const list = this.leads.get(businessId) || [];
    const newLead: Lead = {
      ...lead,
      id: `lead_${Date.now()}`,
      businessId,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newLead);
    this.leads.set(businessId, list);
    return newLead;
  }

  public incrementAiUsage(businessId: string): number {
    const u = this.getUsage(businessId);
    u.aiConversationsUsed += 1;
    return u.aiConversationsUsed;
  }

  public updateSubscriptionPlan(
    businessId: string,
    planId: PlanTier,
    status: Subscription['status'] = 'active'
  ): Subscription {
    const sub = this.getSubscription(businessId);
    sub.planId = planId;
    sub.status = status;
    sub.currentPeriodStart = new Date().toISOString();
    sub.currentPeriodEnd = new Date(Date.now() + 30 * 86400000).toISOString();
    sub.cancelAtPeriodEnd = false;
    this.subscriptions.set(businessId, sub);
    return sub;
  }

  public cancelSubscription(businessId: string): Subscription {
    const sub = this.getSubscription(businessId);
    sub.cancelAtPeriodEnd = true;
    return sub;
  }
}

export const dbStore = new SaaSDataStore();
