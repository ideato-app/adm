/**
 * Prismic API Configuration
 * This file contains configuration for interacting with Prismic's Content Management API (CMA)
 */

// CORS proxy URL - for handling CORS issues when accessing Prismic API
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

// Replace these values with your actual Prismic repository information
const PRISMIC_CONFIG = {
    // Your Prismic repository name
    repoName: 'zaheb',

    // Your Prismic CMA token (Access Token with content management permissions)
    // WARNING: For a production app, you should store this securely and not expose it in client-side code
    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoibWFjaGluZTJtYWNoaW5lIiwiZGJpZCI6InphaGViLThlMmFhYzBlLTY3MDUtNDI2OS05MjJlLTQ3NDljMWM5NDU2YV81IiwiZGF0ZSI6MTc0ODkzNjUxMywiZG9tYWluIjoiemFoZWIiLCJhcHBOYW1lIjoiemFoZWIiLCJpYXQiOjE3NDg5MzY1MTN9.wppUUDN2z9eAKJsvCbY4N1pP55SqSGPNho3GSZWQ6Fo',

    // API Endpoints
    endpoints: {
        // Repository API endpoint
        repository: 'https://zaheb.cdn.prismic.io/api/v2/',

        // Document API endpoint for searching documents
        documents: 'https://zaheb.cdn.prismic.io/api/v2/documents/search',

        // CMA endpoints for creating, updating, and deleting documents
        cma: {
            base: 'https://customtypes.prismic.io',
            documents: 'https://customtypes.prismic.io/documents',
        }
    },

    // Default headers for API requests
    defaultHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },

    // Default document language
    defaultLanguage: 'en-us',

    // Supported content types in your repository
    contentTypes: {
        'blog-post': {
            name: 'Blog Post',
            fields: {
                title: { type: 'Text', required: true },
                content: { type: 'StructuredText', required: true }
            }
        }
        // Add more content types as needed
    }
};

// Add proxied endpoints for use with CORS proxy
PRISMIC_CONFIG.proxiedEndpoints = {
    repository: `${CORS_PROXY}${PRISMIC_CONFIG.endpoints.repository}`,
    documents: `${CORS_PROXY}${PRISMIC_CONFIG.endpoints.documents}`,
    cma: {
        base: `${CORS_PROXY}${PRISMIC_CONFIG.endpoints.cma.base}`,
        documents: `${CORS_PROXY}${PRISMIC_CONFIG.endpoints.cma.documents}`
    }
};

// Load configuration from localStorage if it exists (for demo purposes)
const loadConfig = () => {
    const savedConfig = localStorage.getItem('prismic_config');
    if (savedConfig) {
        try {
            const parsedConfig = JSON.parse(savedConfig);
            Object.assign(PRISMIC_CONFIG, parsedConfig);
        } catch (error) {
            console.error('Failed to parse saved config:', error);
        }
    }
};

// Initialize configuration
loadConfig(); 