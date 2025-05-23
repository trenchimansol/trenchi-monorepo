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
    getPotentialMatches: (walletAddress) => `${API_BASE_URL}/api/matches/potential/${walletAddress}`,
    getMatches: (walletAddress) => `${API_BASE_URL}/api/matches/${walletAddress}`,
    like: (walletAddress) => `${API_BASE_URL}/api/matches/like/${walletAddress}`,
    dislike: (walletAddress) => `${API_BASE_URL}/api/matches/dislike/${walletAddress}`,
    unmatch: (walletAddress) => `${API_BASE_URL}/api/matches/unmatch/${walletAddress}`,
    
    // Leaderboard endpoint
    leaderboard: `${API_BASE_URL}/api/leaderboard`,

    // Subscription endpoints
    getSubscription: (walletAddress) => `${API_BASE_URL}/api/subscription/${walletAddress}`,
    updateSubscription: (walletAddress) => `${API_BASE_URL}/api/subscription/${walletAddress}`,
};

export default api;
