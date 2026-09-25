import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dbStore } from './src/server/db/store';
import { subscriptionService } from './src/server/services/subscriptionService';
import { paymentManager } from './src/server/services/paymentService';
import { whatsAppCloudService } from './src/server/services/whatsappService';
import { processCustomerMessageWithAI } from './src/server/gemini';
import { PlanTier } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse CLI flags (--port and --host) passed by dev runners
const cliArgs = process.argv.slice(2);
const portFlagIdx = cliArgs.indexOf('--port');
const hostFlagIdx = cliArgs.indexOf('--host');

const CLI_PORT = portFlagIdx !== -1 && cliArgs[portFlagIdx + 1] ? Number(cliArgs[portFlagIdx + 1]) : null;
const CLI_HOST = hostFlagIdx !== -1 && cliArgs[hostFlagIdx + 1] ? cliArgs[hostFlagIdx + 1] : null;

const HOST = CLI_HOST || process.env.HOST || '0.0.0.0';
const PORT = CLI_PORT || (process.env.PORT ? Number(process.env.PORT) : 3000);

const app = express();

app.use(cors());
app.use(express.json());

// Multi-tenant Middleware: Extract Business ID from Header, Query, or default to Glow Salon
app.use((req: Request, _res: Response, next: NextFunction) => {
  const bizIdHeader = req.headers['x-business-id'] as string;
  const bizIdQuery = req.query.businessId as string;
  req.businessId = bizIdHeader || bizIdQuery || 'biz_glow_salon';
  next();
});

declare global {
  namespace Express {
    interface Request {
      businessId: string;
      userRole?: 'owner' | 'staff' | 'admin';
    }
  }
}

// ==========================================
// 1. AUTH & ONBOARDING API
// ==========================================

// Get current active user
app.get('/api/auth/me', (req: Request, res: Response) => {
  const bizId = req.businessId;
  const biz = dbStore.getBusiness(bizId);
  const users = Array.from(dbStore.users.values()).filter((u) => u.businessId === bizId);
  const activeUser = users[0] || {
    id: `user_${bizId}`,
    email: biz?.email || 'owner@example.com',
    name: biz?.name ? `${biz.name} Admin` : 'Business Owner',
    role: 'owner',
    businessId: bizId,
  };
  res.json({ user: activeUser, business: biz });
});

// Switch demo user (for developers / presentation testing)
app.post('/api/auth/switch-user', (req: Request, res: Response) => {
  const { email } = req.body;
  const matchedUser = Array.from(dbStore.users.values()).find((u) => u.email === email);
  if (!matchedUser) {
    return res.status(404).json({ error: 'Demo user not found' });
  }
  const biz = dbStore.getBusiness(matchedUser.businessId);
  res.json({ user: matchedUser, business: biz });
});

// Register new business (Onboarding Flow)
app.post('/api/auth/register-business', (req: Request, res: Response) => {
  const {
    businessName,
    category,
    description,
    location,
    phone,
    email,
    website,
    hours,
    services,
    faqs,
    aiPersonality,
    primaryLanguage,
  } = req.body;

  const newBizId = `biz_${Date.now()}`;
  const newBiz = {
    id: newBizId,
    name: businessName || 'My Business',
    category: category || 'Retail & Services',
    description: description || '',
    location: location || 'India',
    phone: phone || '+91 90000 00000',
    email: email || 'owner@newbiz.com',
    website,
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    hours: hours || {
      monday: { open: '10:00', close: '20:00', closed: false },
      tuesday: { open: '10:00', close: '20:00', closed: false },
      wednesday: { open: '10:00', close: '20:00', closed: false },
      thursday: { open: '10:00', close: '20:00', closed: false },
      friday: { open: '10:00', close: '20:00', closed: false },
      saturday: { open: '10:00', close: '20:00', closed: false },
      sunday: { open: '10:00', close: '18:00', closed: false },
    },
    aiPersonality: aiPersonality || 'friendly',
    primaryLanguage: primaryLanguage || 'en',
    supportedLanguages: ['en', 'hi', 'ml', 'ta', 'te', 'kn'],
    autoReplyEnabled: true,
    createdAt: new Date().toISOString(),
  };

  dbStore.businesses.set(newBizId, newBiz);

  // New business automatically receives 7-day Growth Trial
  const trialSub = subscriptionService.createTrial(newBizId, 7);
  dbStore.subscriptions.set(newBizId, trialSub);

  // Initialize usage
  dbStore.usage.set(newBizId, {
    businessId: newBizId,
    period: new Date().toISOString().substring(0, 7),
    aiConversationsUsed: 0,
    customersCount: 0,
    staffCount: 1,
    ordersCount: 0,
    appointmentsCount: 0,
  });

  // Add initial services & FAQs if provided
  if (Array.isArray(services)) {
    services.forEach((s) => dbStore.addService(newBizId, s));
  }
  if (Array.isArray(faqs)) {
    faqs.forEach((f) => dbStore.addFaq(newBizId, f));
  }

  // Create owner user
  const newUser = {
    id: `user_${Date.now()}`,
    email: email || 'owner@newbiz.com',
    name: businessName ? `${businessName} Owner` : 'Owner',
    role: 'owner' as const,
    businessId: newBizId,
  };
  dbStore.users.set(newUser.id, newUser);

  res.status(201).json({ business: newBiz, user: newUser, subscription: trialSub });
});

// ==========================================
// 2. BUSINESS PROFILE API
// ==========================================

app.get('/api/business', (req: Request, res: Response) => {
  const biz = dbStore.getBusiness(req.businessId);
  if (!biz) return res.status(404).json({ error: 'Business not found' });
  res.json(biz);
});

app.put('/api/business', (req: Request, res: Response) => {
  const biz = dbStore.getBusiness(req.businessId);
  if (!biz) return res.status(404).json({ error: 'Business not found' });
  Object.assign(biz, req.body);
  res.json(biz);
});

// ==========================================
// 3. SUBSCRIPTIONS & ENTITLEMENTS API
// ==========================================

app.get('/api/subscription', (req: Request, res: Response) => {
  const sub = dbStore.getSubscription(req.businessId);
  const plan = subscriptionService.getPlan(sub.planId);
  res.json({ subscription: sub, plan });
});

app.get('/api/subscription/plans', (_req: Request, res: Response) => {
  res.json(subscriptionService.getAllPlans());
});

app.get('/api/subscription/usage', (req: Request, res: Response) => {
  const sub = dbStore.getSubscription(req.businessId);
  const usage = dbStore.getUsage(req.businessId);
  const plan = subscriptionService.getPlan(sub.planId);

  const aiCheck = subscriptionService.checkUsageLimit(sub, usage, 'ai_conversations');
  const custCheck = subscriptionService.checkUsageLimit(sub, usage, 'customers');
  const staffCheck = subscriptionService.checkUsageLimit(sub, usage, 'staff');

  res.json({
    usage,
    plan,
    limits: {
      ai: aiCheck,
      customers: custCheck,
      staff: staffCheck,
    },
  });
});

app.get('/api/subscription/check/:feature', (req: Request, res: Response) => {
  const sub = dbStore.getSubscription(req.businessId);
  const feature = req.params.feature as any;
  const result = subscriptionService.canUseFeature(sub, feature);
  res.json(result);
});

// Upgrade plan
app.post('/api/subscription/upgrade', (req: Request, res: Response) => {
  const { planId } = req.body;
  if (!planId) return res.status(400).json({ error: 'Missing planId' });

  const updatedSub = dbStore.updateSubscriptionPlan(req.businessId, planId as PlanTier, 'active');
  res.json({ success: true, subscription: updatedSub });
});

// Start Free Trial
app.post('/api/subscription/start-trial', (req: Request, res: Response) => {
  const trialSub = subscriptionService.createTrial(req.businessId, 7);
  dbStore.subscriptions.set(req.businessId, trialSub);
  res.json({ success: true, subscription: trialSub });
});

// Cancel subscription
app.post('/api/subscription/cancel', (req: Request, res: Response) => {
  const sub = dbStore.cancelSubscription(req.businessId);
  res.json({
    success: true,
    message: `Your subscription will remain active until ${new Date(sub.currentPeriodEnd).toLocaleDateString()}, after which it will downgrade gracefully to FREE with all customer data preserved.`,
    subscription: sub,
  });
});

// Developer Demo Switch: Quickly toggle subscription state or max out usage to test paywall
app.post('/api/subscription/demo-set-state', (req: Request, res: Response) => {
  const { planId, status, maxOutUsage, resetUsage } = req.body;
  const sub = dbStore.getSubscription(req.businessId);
  if (planId) sub.planId = planId;
  if (status) sub.status = status;

  const usage = dbStore.getUsage(req.businessId);
  if (maxOutUsage) {
    const plan = subscriptionService.getPlan(sub.planId);
    usage.aiConversationsUsed = plan.limits.aiConversationsMonthly; // Max out to trigger paywall
  } else if (resetUsage) {
    usage.aiConversationsUsed = 0;
  }

  res.json({ subscription: sub, usage });
});

// ==========================================
// 4. PAYMENTS & CHECKOUT API
// ==========================================

app.post('/api/payments/checkout-session', async (req: Request, res: Response) => {
  try {
    const { planId, billingCycle, provider } = req.body;
    const plan = subscriptionService.getPlan(planId);
    const amount = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
    const biz = dbStore.getBusiness(req.businessId);

    const paymentProvider = paymentManager.getProvider(provider);
    const session = await paymentProvider.createCheckoutSession({
      businessId: req.businessId,
      planId,
      billingCycle: billingCycle || 'monthly',
      amount,
      currency: 'INR',
      customerEmail: biz?.email || 'customer@example.com',
      customerName: biz?.name || 'Customer',
    });

    res.json(session);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Webhook for RevenueCat
app.post('/api/payments/webhook/revenuecat', async (req: Request, res: Response) => {
  try {
    const parsed = await paymentManager.getRevenueCat().handleWebhook(req.body, req.headers as any);
    if (parsed.businessId && parsed.businessId !== 'unknown') {
      if (parsed.status === 'cancelled') {
        dbStore.cancelSubscription(parsed.businessId);
      } else {
        dbStore.updateSubscriptionPlan(parsed.businessId, parsed.planId, 'active');
      }
    }
    res.json({ received: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Webhook for Indian Web Payment Provider (Razorpay/UPI)
app.post('/api/payments/webhook/web', async (req: Request, res: Response) => {
  try {
    const parsed = await paymentManager.getWebPayment().handleWebhook(req.body, req.headers as any);
    if (parsed.businessId && parsed.businessId !== 'unknown') {
      dbStore.updateSubscriptionPlan(parsed.businessId, parsed.planId, 'active');
    }
    res.json({ received: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ==========================================
// 5. META WHATSAPP CLOUD API WEBHOOKS
// ==========================================

// Verification endpoint for Meta
app.get('/api/webhook/whatsapp', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'] as string;
  const token = req.query['hub.verify_token'] as string;
  const challenge = req.query['hub.challenge'] as string;

  const verifiedChallenge = whatsAppCloudService.verifyWebhookChallenge(mode, token, challenge);
  if (verifiedChallenge) {
    return res.status(200).send(verifiedChallenge);
  }
  return res.sendStatus(403);
});

// Incoming message handler from Meta
app.post('/api/webhook/whatsapp', async (req: Request, res: Response) => {
  try {
    const parsed = whatsAppCloudService.parseIncomingWebhook(req.body);
    if (!parsed.isMessage || parsed.isDuplicate || !parsed.text) {
      return res.status(200).json({ status: 'ignored_or_duplicate' });
    }

    // Tenant lookup by recipient or default
    const bizId = req.businessId;
    const biz = dbStore.getBusiness(bizId);
    if (!biz) return res.status(200).json({ status: 'business_not_found' });

    // Find or create customer
    let customers = dbStore.getCustomers(bizId);
    let customer = customers.find((c) => c.phone === parsed.from);
    if (!customer) {
      customer = dbStore.addCustomer(bizId, {
        name: parsed.senderName || 'WhatsApp Customer',
        phone: parsed.from || '+91 99999 99999',
        tags: ['WhatsApp Cloud API', 'New Lead'],
        firstContactedAt: new Date().toISOString(),
        lastContactedAt: new Date().toISOString(),
        totalOrders: 0,
        totalSpend: 0,
        appointmentsCount: 0,
        pendingPayment: 0,
        notes: 'Contacted via Meta WhatsApp Cloud API',
        aiSummary: 'New inbound WhatsApp contact',
      });
    }

    // Process with AI & send reply
    const services = dbStore.getServices(bizId);
    const faqs = dbStore.getFaqs(bizId);
    const aiResult = await processCustomerMessageWithAI({
      customerMessage: parsed.text,
      customerName: customer.name,
      business: biz,
      services,
      faqs,
    });

    await whatsAppCloudService.sendMessage({
      to: parsed.from || '',
      text: aiResult.responseText,
    });

    res.status(200).json({ status: 'processed', aiResult });
  } catch (err: any) {
    console.error('Error handling WhatsApp webhook:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 6. WHATSAPP SIMULATOR & HYBRID AI ENGINE
// ==========================================

app.post('/api/simulator/send-message', async (req: Request, res: Response) => {
  const { customerMessage, customerName, customerPhone, conversationId } = req.body;
  const bizId = req.businessId;

  const biz = dbStore.getBusiness(bizId);
  if (!biz) return res.status(404).json({ error: 'Business not found' });

  // 1. Check AI Usage Limits & Entitlement!
  const sub = dbStore.getSubscription(bizId);
  const usage = dbStore.getUsage(bizId);
  const usageCheck = subscriptionService.checkUsageLimit(sub, usage, 'ai_conversations');

  if (usageCheck.isAtLimit) {
    return res.status(403).json({
      error: 'ai_limit_reached',
      message: 'Monthly AI conversation limit reached for your plan.',
      requiresUpgrade: true,
      currentUsage: usageCheck.current,
      limit: usageCheck.limit,
      plan: sub.planId,
    });
  }

  // 2. Find or create customer
  let customers = dbStore.getCustomers(bizId);
  let customer = customers.find((c) => c.phone === (customerPhone || '+91 98451 23456'));
  if (!customer) {
    customer = dbStore.addCustomer(bizId, {
      name: customerName || 'Simulator Guest',
      phone: customerPhone || '+91 98451 23456',
      tags: ['Simulator', 'Lead'],
      firstContactedAt: new Date().toISOString(),
      lastContactedAt: new Date().toISOString(),
      totalOrders: 0,
      totalSpend: 0,
      appointmentsCount: 0,
      pendingPayment: 0,
      notes: 'Engaged via interactive WhatsApp simulator.',
      aiSummary: 'New lead exploring services via conversation simulator.',
    });
  } else {
    customer.lastContactedAt = new Date().toISOString();
  }

  // 3. Find or create conversation
  let convId = conversationId;
  let conversations = dbStore.getConversations(bizId);
  let conv = conversations.find((c) => c.id === convId);

  if (!conv) {
    convId = `conv_${Date.now()}`;
    conv = {
      id: convId,
      businessId: bizId,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      status: 'ai_handling',
      lastMessage: customerMessage,
      lastMessageTimestamp: new Date().toISOString(),
      unreadCount: 0,
      channel: 'whatsapp_simulator',
      sentiment: 'positive',
    };
    conversations.unshift(conv);
    dbStore.conversations.set(bizId, conversations);
  }

  // Record customer message
  dbStore.addMessage(convId, {
    sender: 'customer',
    text: customerMessage,
    timestamp: new Date().toISOString(),
    status: 'read',
  });

  // Check if conversation was taken over by human
  if (conv.status === 'human_required' || conv.status === 'resolved') {
    // If Human is active, do not auto-reply, mark notification
    return res.json({
      status: 'human_takeover_active',
      conversation: conv,
      customer,
      message: 'AI did not reply because human takeover is active.',
    });
  }

  // 4. Invoke AI Engine (Gemini 3.8 Flash + Rules)
  const services = dbStore.getServices(bizId);
  const faqs = dbStore.getFaqs(bizId);
  const history = dbStore.getMessages(convId).slice(-6).map((m) => ({ sender: m.sender, text: m.text }));

  const aiResult = await processCustomerMessageWithAI({
    customerMessage,
    customerName: customer.name,
    business: biz,
    services,
    faqs,
    recentHistory: history,
  });

  // Increment usage count
  dbStore.incrementAiUsage(bizId);

  // 5. Automatic Business Workflow Side-Effects (Leads, Appointments, Human Escalation)
  if (aiResult.requiresHuman) {
    conv.status = 'human_required';
  }

  if (aiResult.intent === 'appointment_booking' && aiResult.extractedData?.requestedTime) {
    // Tentative appointment or slot hold
    dbStore.addAppointment(bizId, {
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      serviceId: services[0]?.id || 'srv_1',
      serviceName: aiResult.extractedData.serviceOrItem || services[0]?.name || 'Consultation',
      date: aiResult.extractedData.requestedDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      time: aiResult.extractedData.requestedTime,
      staffName: 'Assigned Stylist',
      status: 'confirmed',
      price: services[0]?.price || 300,
      notes: 'Auto-booked by ReplyFlow AI',
    });
  }

  // Add lead if new
  const leads = dbStore.getLeads(bizId);
  if (!leads.some((l) => l.customerId === customer.id)) {
    dbStore.addLead(bizId, {
      customerId: customer.id,
      name: customer.name,
      phone: customer.phone,
      source: 'WhatsApp Simulator',
      status: 'qualified',
      estimatedValue: 1200,
      interest: aiResult.intent,
    });
  }

  // Record AI response message
  const aiMessage = dbStore.addMessage(convId, {
    sender: 'ai',
    text: aiResult.responseText,
    timestamp: new Date().toISOString(),
    status: 'delivered',
    metadata: {
      intent: aiResult.intent,
      confidence: aiResult.confidence,
      actionTaken: aiResult.actionTaken,
      requiresHuman: aiResult.requiresHuman,
      languageDetected: aiResult.languageDetected as any,
    },
  });

  res.json({
    aiMessage,
    aiResult,
    conversation: conv,
    customer,
    usage: dbStore.getUsage(bizId),
  });
});

// ==========================================
// 7. CORE CRM & RESOURCE APIS
// ==========================================

// Customers
app.get('/api/customers', (req: Request, res: Response) => {
  res.json(dbStore.getCustomers(req.businessId));
});

app.post('/api/customers', (req: Request, res: Response) => {
  const cust = dbStore.addCustomer(req.businessId, req.body);
  res.status(201).json(cust);
});

// Conversations & Messages
app.get('/api/conversations', (req: Request, res: Response) => {
  res.json(dbStore.getConversations(req.businessId));
});

app.get('/api/conversations/:id/messages', (req: Request, res: Response) => {
  res.json(dbStore.getMessages(req.params.id));
});

app.post('/api/conversations/:id/messages', (req: Request, res: Response) => {
  const { text, sender } = req.body;
  const msg = dbStore.addMessage(req.params.id, {
    text,
    sender: sender || 'agent',
    timestamp: new Date().toISOString(),
    status: 'sent',
  });
  res.status(201).json(msg);
});

// Human takeover toggle
app.post('/api/conversations/:id/takeover', (req: Request, res: Response) => {
  const updated = dbStore.updateConversationStatus(req.businessId, req.params.id, 'human_required');
  res.json({ success: true, conversation: updated });
});

// Return to AI
app.post('/api/conversations/:id/resume-ai', (req: Request, res: Response) => {
  const updated = dbStore.updateConversationStatus(req.businessId, req.params.id, 'ai_handling');
  res.json({ success: true, conversation: updated });
});

// Services / Products
app.get('/api/services', (req: Request, res: Response) => {
  res.json(dbStore.getServices(req.businessId));
});

app.post('/api/services', (req: Request, res: Response) => {
  const srv = dbStore.addService(req.businessId, req.body);
  res.status(201).json(srv);
});

// Appointments
app.get('/api/appointments', (req: Request, res: Response) => {
  res.json(dbStore.getAppointments(req.businessId));
});

app.post('/api/appointments', (req: Request, res: Response) => {
  const apt = dbStore.addAppointment(req.businessId, req.body);
  res.status(201).json(apt);
});

// Orders
app.get('/api/orders', (req: Request, res: Response) => {
  res.json(dbStore.getOrders(req.businessId));
});

app.post('/api/orders', (req: Request, res: Response) => {
  const ord = dbStore.addOrder(req.businessId, req.body);
  res.status(201).json(ord);
});

// Automations
app.get('/api/automations', (req: Request, res: Response) => {
  res.json(dbStore.getAutomations(req.businessId));
});

// FAQs / Knowledge Base
app.get('/api/faqs', (req: Request, res: Response) => {
  res.json(dbStore.getFaqs(req.businessId));
});

app.post('/api/faqs', (req: Request, res: Response) => {
  const faq = dbStore.addFaq(req.businessId, req.body);
  res.status(201).json(faq);
});

// Leads
app.get('/api/leads', (req: Request, res: Response) => {
  res.json(dbStore.getLeads(req.businessId));
});

// Analytics Dashboard
app.get('/api/analytics', (req: Request, res: Response) => {
  const bizId = req.businessId;
  const usage = dbStore.getUsage(bizId);
  const sub = dbStore.getSubscription(bizId);
  const plan = subscriptionService.getPlan(sub.planId);
  const convs = dbStore.getConversations(bizId);
  const orders = dbStore.getOrders(bizId);
  const apts = dbStore.getAppointments(bizId);
  const leads = dbStore.getLeads(bizId);

  const pendingPayments = orders
    .filter((o) => o.paymentStatus === 'pending')
    .reduce((sum, o) => sum + o.totalAmount, 0) + 7220; // baseline realistic pending

  res.json({
    todayConversations: 128,
    aiResolutionRate: 91,
    newLeads: leads.length || 24,
    ordersCount: orders.length || 18,
    appointmentsCount: apts.length || 13,
    pendingPaymentsAmount: pendingPayments,
    aiUsageMonthly: usage.aiConversationsUsed,
    aiMonthlyLimit: plan.limits.aiConversationsMonthly,
    customerGrowthRate: 18.4,
    averageResponseTimeSeconds: 2.1,
  });
});

// Admin Platform Overview
app.get('/api/admin/overview', (_req: Request, res: Response) => {
  const businesses = Array.from(dbStore.businesses.values()).map((b) => {
    const sub = dbStore.getSubscription(b.id);
    const usage = dbStore.getUsage(b.id);
    return {
      ...b,
      planId: sub.planId,
      status: sub.status,
      aiConversationsUsed: usage.aiConversationsUsed,
    };
  });

  const totalMRR = businesses.reduce((sum, b) => {
    const plan = subscriptionService.getPlan(b.planId);
    return b.status === 'active' ? sum + plan.priceMonthly : sum;
  }, 0);

  res.json({
    totalBusinesses: businesses.length,
    activeSubscribers: businesses.filter((b) => b.status === 'active').length,
    trialSubscribers: businesses.filter((b) => b.status === 'trial').length,
    freeUsers: businesses.filter((b) => b.status === 'free').length,
    totalMRR,
    businesses,
  });
});

// ==========================================
// 8. FRONTEND SERVER / VITE INTEGRATION
// ==========================================

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  function serveStaticDist() {
    let distPath = path.resolve(__dirname, 'dist');
    if (!fs.existsSync(path.join(distPath, 'index.html'))) {
      distPath = path.resolve(process.cwd(), 'dist');
    }
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!isProd) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn('Vite dev middleware not available, falling back to static dist:', e);
      serveStaticDist();
    }
  } else {
    serveStaticDist();
  }

  const server = app.listen(Number(PORT), HOST, () => {
    console.log(`🚀 ReplyFlow AI SaaS server running on http://${HOST}:${PORT}`);
  });

  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE' && PORT !== 3000) {
      console.warn(`[Server] Port ${PORT} already in use. Retrying on port 3000...`);
      app.listen(3000, HOST, () => {
        console.log(`🚀 ReplyFlow AI SaaS server running on http://${HOST}:3000`);
      });
    } else {
      throw err;
    }
  });
}

startServer();
