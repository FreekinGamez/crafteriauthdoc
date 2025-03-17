# CrafteriAuth Documentation 🔐

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Overview

CrafteriAuth is an authentication system that allows users to log into third-party applications using their Crafteri account credentials. Similar to "Login with Google" or "Login with Facebook", CrafteriAuth provides a simple way to authenticate users across different platforms.

## How It Works 🔄

### Authentication Flow

1. User clicks on the "Login with Crafteri" button on your website
2. User is redirected to `auth.crafteri.net/login?service=yourwebsite`
3. User logs in with their Crafteri credentials
4. After successful login, user is redirected back to your specified endpoint with a token
5. Your server verifies this token with Crafteri Auth API
6. If valid, user information is returned and you can create/update user in your database

## Integration Guide 📚

### Step 1: Register Your Application 📝

Before integrating CrafteriAuth, you need to request an API key from the Crafteri team. This key uniquely identifies your application and allows token verification.

To request an API key, please contact us at [info@crafteri.net](mailto:info@crafteri.net) with the following information:
- Your application name
- Your website domain
- The redirect URL where users will be sent after authentication

### Step 2: Add the Login Button ✨

Add the "Login with Crafteri" button to your website. We provide sleek, modern buttons in both light and dark themes.

**HTML Example:**
```html
<a href="https://auth.crafteri.net/login?service=https://yourwebsite.com/crafteriauth/return" class="crafteri-btn crafteri-btn-light">
    <div class="crafteri-btn-content">
        <img src="crafteri-logo.png" alt="Crafteri Logo" class="crafteri-logo">
        <span class="crafteri-btn-text">Sign in with Crafteri</span>
    </div>
</a>
```

For more button styles and options, including circular icon buttons and dark theme variants, check out our [example buttons](examples/login-button-examples.html). We provide ready-to-use CSS styles for all buttons.

> **Important**: Replace `https://yourwebsite.com/crafteriauth/return` with your actual callback endpoint where users will be redirected after authentication.

### Step 3: Handle the Callback 🔙

When a user successfully authenticates, they will be redirected to your callback URL with a token parameter:

```
https://yourwebsite.com/crafteriauth/return?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

You need to extract this token and verify it with the CrafteriAuth API.

### Step 4: Verify the Token 🔍

Send a POST request to CrafteriAuth's verification endpoint to validate the token and retrieve user information.

**Python Example:**
```python
import requests

def verify_token(token):
    response = requests.post(
        "https://auth.crafteri.net/api/verify-token",
        headers={"API-Key": "YOUR_API_KEY"},
        json={"payload": token}  # Note: Token goes in "payload" field
    )
    
    if response.status_code == 200:
        data = response.json()
        if data.get("valid", False):
            return data  # Contains user information
    
    return None  # Authentication failed

# In your callback handler
def callback_handler(request):
    token = request.GET.get('token')
    user_info = verify_token(token)
    
    if user_info:
        # User is authenticated, process the user information
        # e.g., create/update user in your database
        user_id = user_info.get('id')
        username = user_info.get('username')
        email = user_info.get('email')
        # ... handle user session, etc.
    else:
        # Authentication failed
        pass
```

**Node.js Example:**
```javascript
const axios = require('axios');

async function verifyToken(token) {
  try {
    const response = await axios.post('https://auth.crafteri.net/api/verify-token', 
      { payload: token },  // Note: Token goes in "payload" field
      { headers: { 'API-Key': 'YOUR_API_KEY' } }
    );
    
    if (response.data && response.data.valid) {
      return response.data; // Contains user information
    }
    return null;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// In your Express.js route handler
app.get('/crafteriauth/return', async (req, res) => {
  const token = req.query.token;
  const userInfo = await verifyToken(token);
  
  if (userInfo) {
    // User is authenticated, process the user information
    // e.g., create/update user in your database, start session, etc.
    const userId = userInfo.id;
    const username = userInfo.username;
    const email = userInfo.email;
    // ... handle user session, etc.
  } else {
    // Authentication failed
  }
});
```

### Example API Responses

When verifying a token, you may receive the following responses:

#### Successful Response
```json
{
  "email": "name@domain.com",
  "id": 69,
  "username": "randomguy123",
  "valid": true
}
```

#### Error Responses

**Invalid Token Signature**
```json
{
  "error": "Invalid token: Signature verification failed",
  "valid": false
}
```

**Expired Token**
```json
{
  "error": "Token expired",
  "valid": false
}
```

**Malformed Token**
```json
{
  "error": "Invalid token: Not enough segments",
  "valid": false
}
```

**Invalid API Key**
```json
{
  "error": "Unauthorized",
  "success": false
}
```

### Step 5: Store User Information 💾

Once you've verified the token and received the user information, you can:
1. Check if the user exists in your database
2. Create a new user record if they don't exist
3. Update their information if they do exist
4. Create a session for the user

## User Information Structure 📋

The verified token response will include the following user information:

```json
{
  "email": "john.doe@example.com",
  "id": 12345,
  "username": "johndoe",
  "valid": true
}
```

## Security Considerations 🔒

- Never share your API key in client-side code
- Always verify tokens on your server-side
- Use HTTPS for all authentication requests
- Store user data securely according to best practices and applicable regulations

## Troubleshooting 🛠️

### Common Issues

1. **Invalid Token Error**
   - Token may have expired (tokens are valid for 10 minutes)
   - Token may have been tampered with
   - Make sure you're sending the complete token without modifications

2. **API Key Issues**
   - Check that you're using the correct API key
   - Ensure the API key is included in the headers as `API-Key`
   - Your API key may have been revoked - contact support

3. **Redirect Problems**
   - Ensure your redirect URL exactly matches the one you registered
   - Check for URL encoding issues in the `service` parameter

For additional help, please contact us at [info@crafteri.net](mailto:info@crafteri.net).

## Custom Integration Options 🧩

If you need to customize the authentication flow or require additional features, please contact us to discuss custom integration options.

## Rate Limits and Usage 📊

The CrafteriAuth service is subject to the following rate limits:
- Token verification: 100 requests per minute per API key
- Login redirects: 1000 requests per hour per IP address

---

© 2025 Crafteri. All rights reserved.