import axios from 'axios';

// Vite exposes environment variables prefixed with VITE_ via import.meta.env
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const fetchLatestReadings = async () => {
  try {
    const res = await client.get('/api/readings/latest');
    return res.data.readings || [];
  } catch (err) {
    console.error('Error fetching latest readings:', err);
    throw err;
  }
};

export const fetchSummary = async () => {
  try {
    const res = await client.get('/api/readings/summary');
    return res.data.summary || null;
  } catch (err) {
    console.error('Error fetching data summary:', err);
    throw err;
  }
};

export const fetchAllReadings = async () => {
  try {
    const res = await client.get('/api/readings/all');
    return res.data.readings || [];
  } catch (err) {
    console.error('Error fetching all readings:', err);
    throw err;
  }
};

export const sendChatMessage = async (message) => {
  try {
    const res = await client.post('/api/chat', { message });
    return res.data.response || 'No response received from the server.';
  } catch (err) {
    console.error('Error in chatbot communication:', err);
    return 'Unable to connect to the assistant at this time.';
  }
};
