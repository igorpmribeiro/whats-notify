import axios from 'axios';
import dotenv from 'dotenv';

class ChatProClient {
  constructor(baseUrl, instanceId, apiKey) {
    this.baseUrl = 'https://v5.chatpro.com.br/';
    this.instanceId = instanceId;
    this.apiKey = apiKey;
  }

  async sendMessage(to, message) {
    try {
      const options = {
        method: 'POST',
        url: `${this.baseUrl}${this.instanceId}/api/v1/send_message`,
        headers: {
          accept:'application/json',
          'Authorization': `${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        data: {number: to, message: message
        },
      };
      const response = await axios(options);
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
}

export { ChatProClient };