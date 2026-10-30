import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const logActivity = async (event_type, details) => {
  try {
    await axios.post(`${API_BASE}/activity/log`, { event_type, details });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};
