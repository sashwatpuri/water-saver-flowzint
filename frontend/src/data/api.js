import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const fetchLocations = async () => {
  try {
    const res = await client.get('/api/locations');
    return res.data || { locations: [], active_alerts_total: 0 };
  } catch (err) {
    console.error('Error fetching locations metadata:', err);
    throw err;
  }
};

export const fetchLatestReadings = async (location = 'Sector A') => {
  try {
    const res = await client.get(`/api/readings/latest?location=${encodeURIComponent(location)}`);
    return res.data.readings || [];
  } catch (err) {
    console.error('Error fetching latest readings:', err);
    throw err;
  }
};

export const fetchSummary = async (location = 'Sector A') => {
  try {
    const res = await client.get(`/api/readings/summary?location=${encodeURIComponent(location)}`);
    return res.data.summary || null;
  } catch (err) {
    console.error('Error fetching data summary:', err);
    throw err;
  }
};

export const fetchAllReadings = async (location = 'Sector A') => {
  try {
    const res = await client.get(`/api/readings/all?location=${encodeURIComponent(location)}`);
    return res.data.readings || [];
  } catch (err) {
    console.error('Error fetching all readings:', err);
    throw err;
  }
};

export const fetchForecast = async (location = 'Sector A') => {
  try {
    const res = await client.get(`/api/ai/forecast?location=${encodeURIComponent(location)}`);
    return res.data.forecast || [];
  } catch (err) {
    console.error('Error fetching forecast:', err);
    return [];
  }
};

export const fetchSourceAnalysis = async (location = 'Sector A') => {
  try {
    const res = await client.get(`/api/ai/source-analysis?location=${encodeURIComponent(location)}`);
    return res.data || { sources: [], explanation: '' };
  } catch (err) {
    console.error('Error fetching source analysis:', err);
    return { sources: [], explanation: '' };
  }
};

export const fetchRecommendations = async (location = 'Sector A') => {
  try {
    const res = await client.get(`/api/ai/recommendations?location=${encodeURIComponent(location)}`);
    return res.data.recommendations || [];
  } catch (err) {
    console.error('Error fetching recommendations:', err);
    return [];
  }
};

export const fetchSensorHealth = async () => {
  try {
    const res = await client.get('/api/sensor/health');
    return res.data || { online_sensors: 0, offline_sensors: 0, total_sensors: 0, sensors: [] };
  } catch (err) {
    console.error('Error fetching sensor health:', err);
    return { online_sensors: 0, offline_sensors: 0, total_sensors: 0, sensors: [] };
  }
};

export const fetchAiInsights = async () => {
  try {
    const res = await client.get('/api/ai/insights');
    return res.data.timeline || [];
  } catch (err) {
    console.error('Error fetching AI insights feed:', err);
    return [];
  }
};

export const sendChatMessage = async (message, location = 'Sector A') => {
  try {
    const res = await client.post('/api/chat', { message, location });
    return res.data.response || 'No response received from the server.';
  } catch (err) {
    console.error('Error in chatbot communication:', err);
    return 'Unable to connect to the assistant at this time.';
  }
};
