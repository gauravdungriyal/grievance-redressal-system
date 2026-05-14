const getApiBase = () => {
    const { hostname, protocol, port } = window.location;
    // If running on localhost (any port), or if the server is serving the client directly
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `${protocol}//${hostname}:5000/api`;
    }
    // Fallback for production or relative paths
    return '/api';
};

const API_BASE = getApiBase();

export const api = {
    async fetch(endpoint, options = {}) {
        const url = `${API_BASE}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options
        };

        // Include cookies if needed
        defaultOptions.credentials = 'include';

        try {
            const response = await fetch(url, defaultOptions);
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Something went wrong');
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    auth: {
        login: (credentials) => api.fetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
        logout: () => api.fetch('/auth/logout', { method: 'POST' }),
        me: () => api.fetch('/auth/me')
    },

    complaints: {
        submit: (complaint) => api.fetch('/complaints', { method: 'POST', body: JSON.stringify(complaint) }),
        getMy: () => api.fetch('/complaints/my'),
        getAll: () => api.fetch('/complaints/all'),
        update: (id, updates) => api.fetch(`/complaints/${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
    }
};
