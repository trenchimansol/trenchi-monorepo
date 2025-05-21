const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

export const api = {
    // Auth endpoints
    register: `${API_BASE_URL}/api/register`,
    login: `${API_BASE_URL}/api/login`,
    
    // Profile endpoints
    getProfile: (walletAddress) => `${API_BASE_URL}/api/profile/${walletAddress}`,
    updateProfile: `${API_BASE_URL}/api/profile`,
    
    // Match endpoints
    getPotentialMatches: (userId) => `${API_BASE_URL}/api/potential-matches?userId=${userId}`,
    getMatches: (userId) => `${API_BASE_URL}/api/matches?userId=${userId}`,
    like: (id) => `${API_BASE_URL}/api/like/${id}`,
    dislike: (id) => `${API_BASE_URL}/api/dislike/${id}`,
    unmatch: (id) => `${API_BASE_URL}/api/unmatch/${id}`,
};

export default api;
