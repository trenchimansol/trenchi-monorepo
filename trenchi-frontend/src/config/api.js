const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'https://trenchi-monorepo.onrender.com';

export const api = {
    baseURL: API_BASE_URL,
    // Auth endpoints
    register: `${API_BASE_URL}/api/register`,
    login: `${API_BASE_URL}/api/login`,
    
    // Profile endpoints
    getProfile: (walletAddress) => `${API_BASE_URL}/api/profile/${walletAddress}`,
    updateProfile: (walletAddress) => `${API_BASE_URL}/api/profile/${walletAddress}`,
    
    // Match endpoints
    getPotentialMatches: (userId) => `${API_BASE_URL}/api/potential-matches?userId=${userId}`,
    getMatches: (userId) => `${API_BASE_URL}/api/matches?userId=${userId}`,
    like: (id) => `${API_BASE_URL}/api/like/${id}`,
    dislike: (id) => `${API_BASE_URL}/api/dislike/${id}`,
    unmatch: (id) => `${API_BASE_URL}/api/unmatch/${id}`,
    
    // Leaderboard endpoint
    leaderboard: `${API_BASE_URL}/api/leaderboard`,

    // Subscription endpoints
    getSubscription: (walletAddress) => `${API_BASE_URL}/api/subscription/${walletAddress}`,
    updateSubscription: (walletAddress) => `${API_BASE_URL}/api/subscription/${walletAddress}`,
};

export default api;
