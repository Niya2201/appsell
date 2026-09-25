export interface WhatsAppOutgoingMessage {
  to: string; // phone number e.g. "919845123456"
  text: string;
  previewUrl?: boolean;
}

export interface WhatsAppIncomingWebhookPayload {
  object: string;
  entry?: Array<{
    id: string;
    changes?: Array<{
      value: {
        messaging_product: string;
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: Array<{
          profile: { name: string };
          wa_id: string;
        }>;
        messages?: Array<{
          from: string;
          id: string;
          timestamp: string;
          text?: { body: string };
          type: string;
        }>;
        statuses?: Array<{
          id: string;
          status: 'sent' | 'delivered' | 'read' | 'failed';
          timestamp: string;
          recipient_id: string;
        }>;
      };
      field: string;
    }>;
  }>;
}

export class WhatsAppCloudApiService {
  private accessToken: string | undefined;
  private verifyToken: string;
  private phoneNumberId: string | undefined;
  private processedMessageIds: Set<string> = new Set(); // Idempotency check

  constructor() {
    this.accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    this.verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'replyflow_secure_webhook_verify_token_2026';
    this.phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  }

  public isConfigured(): boolean {
    return !!(this.accessToken && this.phoneNumberId);
  }

  public verifyWebhookChallenge(mode?: string, token?: string, challenge?: string): string | null {
    if (mode === 'subscribe' && token === this.verifyToken) {
      console.log('[WhatsApp Webhook] Verification successful for Meta challenge');
      return challenge || null;
    }
    console.warn('[WhatsApp Webhook] Verification failed: token mismatch');
    return null;
  }

  public parseIncomingWebhook(payload: WhatsAppIncomingWebhookPayload): {
    isMessage: boolean;
    messageId?: string;
    from?: string;
    senderName?: string;
    text?: string;
    isDuplicate: boolean;
  } {
    const entry = payload.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const msg = value?.messages?.[0];

    if (!msg || !msg.text?.body) {
      return { isMessage: false, isDuplicate: false };
    }

    const messageId = msg.id;
    if (this.processedMessageIds.has(messageId)) {
      console.log(`[WhatsApp Cloud API] Duplicate message ${messageId} ignored (idempotent)`);
      return { isMessage: true, messageId, isDuplicate: true };
    }

    this.processedMessageIds.add(messageId);
    // Keep set bounded
    if (this.processedMessageIds.size > 5000) {
      const first = this.processedMessageIds.values().next().value;
      if (first) this.processedMessageIds.delete(first);
    }

    const contact = value?.contacts?.[0];

    return {
      isMessage: true,
      messageId,
      from: msg.from,
      senderName: contact?.profile?.name || 'Customer',
      text: msg.text.body,
      isDuplicate: false,
    };
  }

  public async sendMessage(message: WhatsAppOutgoingMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured()) {
      console.log('[WhatsApp Cloud API] Credentials not configured. Simulated send to', message.to);
      return {
        success: true,
        messageId: `wamid_sim_${Date.now()}`,
      };
    }

    try {
      const url = `https://graph.facebook.com/v19.0/${this.phoneNumberId}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: message.to.replace(/\D/g, ''),
          type: 'text',
          text: {
            preview_url: !!message.previewUrl,
            body: message.text,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[WhatsApp Cloud API] Error sending message:', errorText);
        return { success: false, error: errorText };
      }

      const resData = await response.json();
      return {
        success: true,
        messageId: resData.messages?.[0]?.id,
      };
    } catch (err: any) {
      console.error('[WhatsApp Cloud API] Exception in sendMessage:', err);
      return { success: false, error: err.message };
    }
  }
}

export const whatsAppCloudService = new WhatsAppCloudApiService();
