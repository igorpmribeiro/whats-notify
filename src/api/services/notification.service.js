class INotificationService {
  sendWhatsAppNotification(phoneNumber, message) {
    throw new Error('Method not implemented');
  }
}

class WhatsNotificationService extends INotificationService {
  constructor(whatsAppClient) {
    super();
    this.whatsAppClient = whatsAppClient;
  }

  async sendWhatsAppNotification(phoneNumber, message) {
    try {
      await this.whatsAppClient.sendMessage(phoneNumber, message);
      console.log(`WhatsApp message sent to ${phoneNumber}: ${message}`);
    } catch (error) {
      console.error('Error sending WhatsApp notification:', error);
      throw new Error('Failed to send WhatsApp notification');
    }
  }
}

export { INotificationService, WhatsNotificationService };