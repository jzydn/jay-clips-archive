
// API configuration for your VPS MySQL backend
export const API_CONFIG = {
  BASE_URL: "http://46.244.96.25:8086/api",
  ENDPOINTS: {
    UPLOAD_VIDEO: "/videos/upload",
    GET_USER_VIDEOS: "/videos/user",
    GET_VIDEO: "/videos",
    DELETE_VIDEO: "/videos",
    INCREMENT_VIEWS: "/videos/views",
    AUTH_LOGIN: "/auth/login"
  }
};

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string, params?: string) => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  return params ? `${url}/${params}` : url;
};
