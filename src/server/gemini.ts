import { GoogleGenAI } from '@google/genai';
import { Business, ProductService, FAQItem } from '../types';

let aiInstance: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

export interface AIResponseOutput {
  intent:
    | 'faq'
    | 'appointment_booking'
    | 'appointment_confirmation'
    | 'product_inquiry'
    | 'order_request'
    | 'payment_inquiry'
    | 'refund_complaint'
    | 'human_handoff'
    | 'greeting'
    | 'other';
  confidence: number;
  customerName?: string;
  responseText: string;
  requiresHuman: boolean;
  languageDetected: string;
  actionTaken?: string;
  extractedData?: {
    requestedDate?: string;
    requestedTime?: string;
    serviceOrItem?: string;
    budget?: number;
  };
}

export async function processCustomerMessageWithAI(params: {
  customerMessage: string;
  customerName: string;
  business: Business;
  services: ProductService[];
  faqs: FAQItem[];
  recentHistory?: { sender: string; text: string }[];
}): Promise<AIResponseOutput> {
  const { customerMessage, customerName, business, services, faqs, recentHistory } = params;

  const ai = getAiClient();

  // If Gemini API is available, invoke gemini-3.8-flash with structured system instructions
  if (ai) {
    try {
      const servicesListStr = services
        .map((s) => `- ${s.name} (${s.type}): ₹${s.price}${s.durationMinutes ? `, ${s.durationMinutes} mins` : ''}. ${s.description}`)
        .join('\n');

      const faqsListStr = faqs
        .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
        .join('\n\n');

      const systemInstruction = `You are "ReplyFlow AI", an expert WhatsApp Business Assistant for "${business.name}" (${business.category}).
Location: ${business.location}
Phone: ${business.phone}
Email: ${business.email}
AI Tone: ${business.aiPersonality}
Primary Language: ${business.primaryLanguage}
Custom Instructions: ${business.customAiInstructions || 'Be helpful, accurate, polite, and aim to assist customer orders and bookings.'}

SERVICES & PRODUCTS AVAILABLE:
${servicesListStr}

OFFICIAL FAQS & POLICIES:
${faqsListStr}

CRITICAL RULES:
1. You are communicating with customer "${customerName}" on WhatsApp.
2. If customer speaks in Malayalam (e.g. "നാളെ 5 മണിക്ക് appointment ഉണ്ടോ?"), Hindi ("क्या कल का टाइम मिलेगा?"), Tamil, Telugu, Kannada, or English, detect it and respond naturally in the SAME language or conversational Hinglish/Manglish appropriate for WhatsApp.
3. Keep responses concise, warm, professional, and formatted for WhatsApp (use *bold* and occasional friendly emojis).
4. Never hallucinate unavailable services or false prices. If asked for custom discounts, severe complaints, or things not covered, politely state that you are escalating to the human manager and set "requiresHuman": true.
5. Return ONLY a valid JSON object matching the requested schema. No code fences.`;

      const prompt = `Customer Message: "${customerMessage}"
Recent Conversation Context:
${recentHistory?.map((h) => `${h.sender}: ${h.text}`).join('\n') || 'None'}

Analyze the message and produce a JSON response with:
{
  "intent": "appointment_booking" | "appointment_confirmation" | "product_inquiry" | "order_request" | "payment_inquiry" | "refund_complaint" | "human_handoff" | "faq" | "greeting" | "other",
  "confidence": number between 0.8 and 1.0,
  "customerName": "${customerName}",
  "responseText": "WhatsApp formatted message for the customer",
  "requiresHuman": boolean,
  "languageDetected": "en" | "hi" | "ml" | "ta" | "te" | "kn",
  "actionTaken": "string describing action",
  "extractedData": {
    "requestedDate": "YYYY-MM-DD or relative string",
    "requestedTime": "HH:mm",
    "serviceOrItem": "name",
    "budget": number
  }
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const responseText = response.text?.trim() || '';
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return {
          intent: parsed.intent || 'other',
          confidence: parsed.confidence || 0.95,
          customerName: parsed.customerName || customerName,
          responseText: parsed.responseText,
          requiresHuman: !!parsed.requiresHuman,
          languageDetected: parsed.languageDetected || 'en',
          actionTaken: parsed.actionTaken || 'ai_generated_response',
          extractedData: parsed.extractedData,
        };
      }
    } catch (err) {
      console.warn('Gemini API call failed or threw error, falling back to rule engine:', err);
    }
  }

  // Robust Rule-based Engine for Demo Mode / Zero Config execution
  return generateRuleBasedResponse({
    customerMessage,
    customerName,
    business,
    services,
    faqs,
  });
}

function generateRuleBasedResponse(params: {
  customerMessage: string;
  customerName: string;
  business: Business;
  services: ProductService[];
  faqs: FAQItem[];
}): AIResponseOutput {
  const msg = params.customerMessage.toLowerCase().trim();
  const name = params.customerName;

  // Language Detection
  const isMalayalam = /[\u0D00-\u0D7F]/.test(params.customerMessage);
  const isHindi = /[\u0900-\u097F]/.test(params.customerMessage);
  const isTamil = /[\u0B80-\u0BFF]/.test(params.customerMessage);
  const isTelugu = /[\u0C00-\u0C7F]/.test(params.customerMessage);
  const isKannada = /[\u0C80-\u0CFF]/.test(params.customerMessage);

  let lang = 'en';
  if (isMalayalam) lang = 'ml';
  else if (isHindi) lang = 'hi';
  else if (isTamil) lang = 'ta';
  else if (isTelugu) lang = 'te';
  else if (isKannada) lang = 'kn';

  // Check 1: Human handoff / Escalation requests
  if (
    msg.includes('human') ||
    msg.includes('agent') ||
    msg.includes('talk to someone') ||
    msg.includes('manager') ||
    msg.includes('owner') ||
    msg.includes('complaint') ||
    msg.includes('refund') ||
    msg.includes('manushyan') ||
    msg.includes('baat karni hai')
  ) {
    if (lang === 'ml') {
      return {
        intent: 'human_handoff',
        confidence: 0.98,
        customerName: name,
        responseText: `നമസ്കാരം ${name}, ശരിയായ വിവരം നിങ്ങൾക്ക് നൽകാൻ ഞങ്ങളുടെ ടീം അംഗം നിങ്ങളുമായി ഉടൻ ബന്ധപ്പെടും. ദയവായി അല്പം കാത്തിരിക്കൂ. 👩‍💼`,
        requiresHuman: true,
        languageDetected: 'ml',
        actionTaken: 'escalated_to_human_agent',
      };
    }
    if (lang === 'hi') {
      return {
        intent: 'human_handoff',
        confidence: 0.98,
        customerName: name,
        responseText: `नमस्ते ${name}, मैं आपको सही जानकारी सुनिश्चित करने के लिए हमारी टीम से जोड़ रहा हूँ। हमारा प्रतिनिधि आपसे जल्द ही बात करेगा। 👩‍💼`,
        requiresHuman: true,
        languageDetected: 'hi',
        actionTaken: 'escalated_to_human_agent',
      };
    }
    return {
      intent: 'human_handoff',
      confidence: 0.98,
      customerName: name,
      responseText: `Hello ${name}, I want to make sure I give you the exact details you need! I am connecting you directly with our manager/team right away. 👩‍💼`,
      requiresHuman: true,
      languageDetected: 'en',
      actionTaken: 'escalated_to_human_agent',
    };
  }

  // Check 2: Appointments / Bookings
  if (
    msg.includes('appointment') ||
    msg.includes('book') ||
    msg.includes('slot') ||
    msg.includes('tomorrow') ||
    msg.includes('today') ||
    msg.includes('naale') ||
    msg.includes('kal') ||
    msg.includes('time') ||
    msg.includes('5 pm') ||
    msg.includes('5pm')
  ) {
    if (lang === 'ml') {
      return {
        intent: 'appointment_booking',
        confidence: 0.95,
        customerName: name,
        responseText: `നമസ്കാരം ${name}! തീർച്ചയായും, നാളെ വൈകുന്നേരം 5:00 PM, 6:00 PM എന്നീ സമയങ്ങളിൽ സ്ലോട്ട് ലഭ്യമാണ്. നിങ്ങളുടെ സ്ലോട്ട് ഞങ്ങൾ ഉറപ്പിക്കട്ടെ? 💇‍♀️`,
        requiresHuman: false,
        languageDetected: 'ml',
        actionTaken: 'checked_slot_availability',
        extractedData: {
          requestedDate: '2026-09-26',
          requestedTime: '17:00',
        },
      };
    }
    if (lang === 'hi') {
      return {
        intent: 'appointment_booking',
        confidence: 0.96,
        customerName: name,
        responseText: `नमस्ते ${name}! हाँ, कल शाम 5:00 बजे और 6:00 बजे हमारे पास स्लॉट उपलब्ध हैं। क्या आप हेयरकट (₹300) या फेशियल बुक करना चाहेंगे? 💇‍♀️`,
        requiresHuman: false,
        languageDetected: 'hi',
        actionTaken: 'checked_slot_availability',
        extractedData: {
          requestedDate: '2026-09-26',
          requestedTime: '17:00',
        },
      };
    }
    return {
      intent: 'appointment_booking',
      confidence: 0.96,
      customerName: name,
      responseText: `Hello ${name}! ✨ Yes, we have openings at *5:00 PM* and *6:00 PM* tomorrow. Would you like to book a *Haircut & Styling (₹300)* or our *Moroccan Hair Spa (₹900)*?`,
      requiresHuman: false,
      languageDetected: 'en',
      actionTaken: 'checked_slot_availability',
      extractedData: {
        requestedDate: '2026-09-26',
        requestedTime: '17:00',
      },
    };
  }

  // Check 3: Pricing & Catalog inquiry
  if (
    msg.includes('price') ||
    msg.includes('rate') ||
    msg.includes('cost') ||
    msg.includes('service') ||
    msg.includes('menu') ||
    msg.includes('how much') ||
    msg.includes('vila') ||
    msg.includes('daam')
  ) {
    const serviceList = params.services
      .slice(0, 4)
      .map((s) => `• *${s.name}*: ₹${s.price}`)
      .join('\n');

    return {
      intent: 'product_inquiry',
      confidence: 0.94,
      customerName: name,
      responseText: `Here are our popular services and rates at *${params.business.name}*:\n\n${serviceList}\n\nAll services include consultation and complimentary herbal tea! ☕ Would you like to book a slot?`,
      requiresHuman: false,
      languageDetected: lang,
      actionTaken: 'provided_pricing_details',
    };
  }

  // Check 4: Payment methods / UPI
  if (
    msg.includes('upi') ||
    msg.includes('gpay') ||
    msg.includes('pay') ||
    msg.includes('card') ||
    msg.includes('cash') ||
    msg.includes('phonepe')
  ) {
    return {
      intent: 'payment_inquiry',
      confidence: 0.97,
      customerName: name,
      responseText: `Yes! We accept *Google Pay, PhonePe, Paytm, BHIM UPI*, all major credit/debit cards, and cash. You can also pay seamlessly after your service! 💳📱`,
      requiresHuman: false,
      languageDetected: lang,
      actionTaken: 'answered_payment_faq',
    };
  }

  // Check 5: Hours & Location
  if (
    msg.includes('open') ||
    msg.includes('timing') ||
    msg.includes('hour') ||
    msg.includes('close') ||
    msg.includes('sunday')
  ) {
    return {
      intent: 'faq',
      confidence: 0.95,
      customerName: name,
      responseText: `We are open *Monday to Friday from 10:00 AM to 8:00 PM*, and *Saturday & Sunday from 9:30 AM to 8:30 PM*. Let us know if you'd like to reserve a chair! ⏰`,
      requiresHuman: false,
      languageDetected: lang,
      actionTaken: 'answered_hours_faq',
    };
  }

  if (
    msg.includes('where') ||
    msg.includes('location') ||
    msg.includes('address') ||
    msg.includes('route') ||
    msg.includes('evide') ||
    msg.includes('kahan')
  ) {
    return {
      intent: 'faq',
      confidence: 0.96,
      customerName: name,
      responseText: `We are located at *${params.business.location}*. Valet parking is available right outside! 📍`,
      requiresHuman: false,
      languageDetected: lang,
      actionTaken: 'provided_location_details',
    };
  }

  // Default Greeting / Friendly reply
  return {
    intent: 'greeting',
    confidence: 0.91,
    customerName: name,
    responseText: `Hello ${name}! Welcome to *${params.business.name}*. How can I assist you today? You can ask about our *services, rates, opening hours*, or book an appointment directly here! 😊`,
    requiresHuman: false,
    languageDetected: lang,
    actionTaken: 'greeted_customer',
  };
}
