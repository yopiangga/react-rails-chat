import axios from "axios";
import { handleAxiosError } from "./errors";
import { railsUrl } from "src/configs";
import { Message } from "src/types/message";

export class MessageServices {
  async getMessages() {
    try {
      const response = await axios.get(`${railsUrl}/messages`);
      return response.data;
    } catch (error) {
      handleAxiosError(error);
    }
  }

  async sendMessage({ message }: { message: Message }) {
    try {
      const response = await axios.post(`${railsUrl}/messages`, {
        id: message.timestamp,
        body: JSON.stringify(message),
      });
      return response.data;
    } catch (error) {
      handleAxiosError(error);
    }
  }

  async resetMessages() {
    try {
      const response = await axios.delete(`${railsUrl}/messages`);
      return response.data;
    } catch (error) {
      handleAxiosError(error);
    }
  }
}
