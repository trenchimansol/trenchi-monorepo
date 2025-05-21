import axios from 'axios';
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export const getConversations = async (walletAddress) => {
  const response = await axios.get(`${API_BASE_URL}/api/messages/conversations/${walletAddress}`);
  return response.data;
};

export const getChatHistory = async (walletAddress, otherWalletAddress) => {
  const response = await axios.get(`${API_BASE_URL}/api/messages/history/${walletAddress}/${otherWalletAddress}`);
  return response.data;
};

export const sendMessage = async (senderId, receiverId, content) => {
  const response = await axios.post(`${API_BASE_URL}/api/messages/send`, {
    senderId,
    receiverId,
    content
  });
  return response.data;
};
