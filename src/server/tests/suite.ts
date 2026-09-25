import { SaaSDataStore } from '../db/store';
import { SubscriptionService } from '../services/subscriptionService';
import { PaymentManager } from '../services/paymentService';
import { WhatsAppCloudApiService } from '../services/whatsappService';
import { processCustomerMessageWithAI } from '../gemini';

async function runTestSuite() {
  console.log('🧪 Starting ReplyFlow AI SaaS Automated Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // TEST 1: Multi-tenant Data Store Isolation
  console.log('1. Testing Multi-tenant Isolation');
  const store = new SaaSDataStore();
  const glowCusts = store.getCustomers('biz_glow_salon');
  const freeCusts = store.getCustomers('biz_free_demo');

  assert(glowCusts.length > 0, 'Business A has its own customers');
  assert(glowCusts.every((c) => c.businessId === 'biz_glow_salon'), 'All Business A customer records contain tenant ID');
  assert(freeCusts.every((c) => c.businessId === 'biz_free_demo'), 'Business B only contains Business B tenant records');

  // TEST 2: Subscription Entitlement Checks
  console.log('\n2. Testing Subscription Entitlements');
  const subService = new SubscriptionService();
  const freeSub = store.getSubscription('biz_free_demo');
  const growthSub = store.getSubscription('biz_glow_salon');

  const freeCheckFollowups = subService.canUseFeature(freeSub, 'automatedFollowups');
  assert(!freeCheckFollowups.allowed, 'Free plan user is blocked from automatedFollowups');
  assert(freeCheckFollowups.requiredPlan === 'growth', 'Free plan user is told Growth plan is required');

  const growthCheckFollowups = subService.canUseFeature(growthSub, 'automatedFollowups');
  assert(growthCheckFollowups.allowed, 'Growth plan user has access to automatedFollowups');

  // TEST 3: Usage Limits & Paywall Triggers
  console.log('\n3. Testing Usage Limits & Paywall Triggers');
  const freeUsage = store.getUsage('biz_free_demo');
  freeUsage.aiConversationsUsed = 48; // Limit is 50
  const checkNearLimit = subService.checkUsageLimit(freeSub, freeUsage, 'ai_conversations');
  assert(checkNearLimit.isApproachingLimit, 'Flagged as approaching limit at 48/50 (96%)');

  freeUsage.aiConversationsUsed = 50; // At limit
  const checkAtLimit = subService.checkUsageLimit(freeSub, freeUsage, 'ai_conversations');
  assert(checkAtLimit.isAtLimit, 'Flagged as at limit at 50/50 (100%)');
  assert(!checkAtLimit.allowed, 'AI conversations blocked once limit is reached');

  // TEST 4: Hybrid AI Engine Intent & Booking
  console.log('\n4. Testing Hybrid AI Engine');
  const glowBiz = store.getBusiness('biz_glow_salon')!;
  const services = store.getServices('biz_glow_salon');
  const faqs = store.getFaqs('biz_glow_salon');

  const bookingRes = await processCustomerMessageWithAI({
    customerMessage: 'Can I book a haircut tomorrow at 5 PM?',
    customerName: 'Anu',
    business: glowBiz,
    services,
    faqs,
  });
  assert(bookingRes.intent === 'appointment_booking', 'Correctly identified appointment_booking intent');
  assert(bookingRes.extractedData?.requestedTime === '17:00', 'Extracted 17:00 time slot correctly');
  assert(!bookingRes.requiresHuman, 'Standard booking does not require human escalation');

  // TEST 5: Multilingual Intent Detection
  console.log('\n5. Testing Multilingual Detection (Malayalam & Hindi)');
  const mlRes = await processCustomerMessageWithAI({
    customerMessage: 'നാളെ 5 മണിക്ക് appointment ഉണ്ടോ?',
    customerName: 'Meera',
    business: glowBiz,
    services,
    faqs,
  });
  assert(mlRes.languageDetected === 'ml', 'Malayalam language script detected accurately');
  assert(mlRes.responseText.includes('സ്ലോട്ട') || mlRes.responseText.includes('നമസ്കാരം'), 'Responded warmly in Malayalam');

  // TEST 6: Human Handoff Escalation
  console.log('\n6. Testing Human Handoff Safeguards');
  const handoffRes = await processCustomerMessageWithAI({
    customerMessage: 'I have an urgent complaint about billing and need to talk to the human manager right now.',
    customerName: 'Rahul',
    business: glowBiz,
    services,
    faqs,
  });
  assert(handoffRes.requiresHuman === true, 'Detected escalation and set requiresHuman = true');
  assert(handoffRes.intent === 'human_handoff', 'Intent classified as human_handoff');

  // TEST 7: Payment Provider Abstraction
  console.log('\n7. Testing Payment Provider Abstraction');
  const paymentMgr = new PaymentManager();
  const upiProvider = paymentMgr.getProvider('web_payment_india');
  const checkout = await upiProvider.createCheckoutSession({
    businessId: 'biz_glow_salon',
    planId: 'growth',
    billingCycle: 'monthly',
    amount: 999,
    currency: 'INR',
    customerEmail: 'priya@glowsalon.in',
    customerName: 'Priya Sharma',
  });
  assert(checkout.provider === 'web_payment_india', 'Created Indian Web Payment session with UPI');
  assert(checkout.amount === 999, 'Session amount matches ₹999 Growth plan');

  // TEST 8: WhatsApp Cloud API Idempotency
  console.log('\n8. Testing WhatsApp Cloud API Idempotency');
  const wa = new WhatsAppCloudApiService();
  const dummyPayload: any = {
    object: 'whatsapp_business_account',
    entry: [
      {
        id: 'waba_1',
        changes: [
          {
            value: {
              messaging_product: 'whatsapp',
              metadata: { display_phone_number: '919876543210', phone_number_id: 'phone_1' },
              contacts: [{ profile: { name: 'Customer Test' }, wa_id: '919888888888' }],
              messages: [{ from: '919888888888', id: 'wamid.HBgLMTIzNDU2', timestamp: '1727280000', text: { body: 'Hello' }, type: 'text' }],
            },
            field: 'messages',
          },
        ],
      },
    ],
  };
  const parse1 = wa.parseIncomingWebhook(dummyPayload);
  assert(parse1.isMessage && !parse1.isDuplicate, 'First delivery of message is processed');
  const parse2 = wa.parseIncomingWebhook(dummyPayload);
  assert(parse2.isDuplicate === true, 'Duplicate webhook event is discarded safely (idempotent)');

  console.log(`\n🎉 Test Suite Complete: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTestSuite().catch((err) => {
  console.error('Test Suite encountered error:', err);
  process.exit(1);
});
