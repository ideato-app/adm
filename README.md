# Prismic Admin Dashboard

A simple admin dashboard to manage content in Prismic CMS using the Content Management API (CMA).

## Project Overview

This project provides a clean and intuitive admin interface to manage content in a Prismic repository. It allows you to view, create, edit, and delete documents directly through the Prismic CMA (Content Management API) using vanilla JavaScript.

### Features

- Display documents from selected content types
- Create new documents with a simple form
- Edit existing documents
- Delete documents
- Real-time feedback with status messages

## Project Structure

```
admin-dashboard/
│
├── index.html             # Main dashboard UI
├── css/
│   └── style.css          # Custom styles for the dashboard
├── js/
│   ├── config.js          # Configuration (API token, repo name, base URLs)
│   └── main.js            # Main logic: fetch, update, delete content via API
│
├── assets/                # Images, icons, or logos (optional)
│
└── README.md              # Instructions for setup and usage
```

## Setup Instructions

### 1. Configuration

Before using the dashboard, you need to configure your Prismic repository settings in `js/config.js`:

```javascript
const PRISMIC_CONFIG = {
    // Your Prismic repository name
    repoName: 'your-repository-name',
    
    // Your Prismic CMA token (Access Token with content management permissions)
    accessToken: 'your-access-token',
    
    // ... other config
};
```

### 2. Get Your Prismic API Token

To use the Content Management API, you need an access token with the appropriate permissions:

1. Go to your Prismic repository dashboard
2. Navigate to Settings > API & Security
3. Create a new permanent access token with content management permissions
4. Copy the token and paste it in your `config.js` file

### 3. Running the Project

This is a static HTML/JS/CSS project, so you can run it locally:

- Using a local server like XAMPP, WAMP, or any other web server
- Using the `live-server` npm package
- Using VSCode's Live Server extension

Simply place the files in your web server's directory or start a local development server in the project directory.

## API Request Examples

### GET - Fetch Documents

```javascript
const response = await fetch(
    `https://your-repo-name.cdn.prismic.io/api/v2/documents/search?ref=${masterRef}&q=[[at(document.type,"blog-post")]]`,
    {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }
);
```

### POST - Create Document

```javascript
const response = await fetch(
    'https://customtypes.prismic.io/documents',
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            id: 'unique-id',
            type: 'blog-post',
            lang: 'en-us',
            data: {
                title: [{ type: 'heading1', text: 'New Post Title' }],
                content: [{ type: 'paragraph', text: 'Content goes here' }]
            }
        })
    }
);
```

### PATCH - Update Document

```javascript
const response = await fetch(
    `https://customtypes.prismic.io/documents/${documentId}`,
    {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            id: documentId,
            ref: documentRef,
            data: {
                title: [{ type: 'heading1', text: 'Updated Title' }],
                content: [{ type: 'paragraph', text: 'Updated content' }]
            }
        })
    }
);
```

### DELETE - Delete Document

```javascript
const response = await fetch(
    `https://customtypes.prismic.io/documents/${documentId}`,
    {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }
);
```

## Prismic CMA Limitations & Rate Limits

- **Rate Limits**: Prismic may impose rate limits on API requests. Be mindful of making too many requests in a short period.
- **Token Permissions**: Ensure your access token has the necessary permissions for content management.
- **Document Structure**: The document structure must match your custom type definition in Prismic.
- **API Changes**: The Prismic API may change over time. Check their documentation for the latest information.

## Browser Support

This dashboard works with all modern browsers that support ES6+ features:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Security Considerations

This dashboard exposes your Prismic CMA token in client-side code. For production use, consider:

- Implementing a backend proxy to handle API requests securely
- Adding user authentication to restrict access to the dashboard
- Using environment variables to store sensitive information

## Resources

- [Prismic API Documentation](https://prismic.io/docs/api)
- [Prismic Content Management API](https://prismic.io/docs/api/v2/cma-api-overview) 