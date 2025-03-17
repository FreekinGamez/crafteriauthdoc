/**
 * CrafteriAuth Token Verification Examples
 * 
 * This file contains examples of how to verify CrafteriAuth tokens in different 
 * programming languages and frameworks.
 */

// -----------------------------------------------------------------------------
// Node.js Example (Express)
// -----------------------------------------------------------------------------

const express = require('express');
const axios = require('axios');
const app = express();

// Set your API key received from Crafteri Auth
const API_KEY = 'your_api_key_here';

// Route that handles the callback from Crafteri Auth
app.get('/crafteriauth/return', async (req, res) => {
  try {
    // Get token from query parameters
    const token = req.query.token;
    
    if (!token) {
      return res.status(400).send('Token is missing');
    }
    
    // Verify token with Crafteri Auth API
    const response = await axios.post(
      'https://auth.crafteri.net/api/verify-token',
      { payload: token }, // Note: Token must be in 'payload' field
      { headers: { 'API-Key': API_KEY } }
    );
    
    const userData = response.data;
    
    // Check if token is valid
    if (userData.valid) {
      // Token is valid, user is authenticated
      
      // Example: Find or create user in your database
      let user = await findUserByEmail(userData.email);
      
      if (!user) {
        // Create new user if they don't exist
        user = await createUser({
          email: userData.email,
          username: userData.username,
          externalId: userData.id,
          // Add any other fields you need
        });
      }
      
      // Create a session for the user
      req.session.userId = user.id;
      req.session.isLoggedIn = true;
      
      // Redirect to dashboard or home page
      res.redirect('/dashboard');
    } else {
      // Token is invalid
      console.error('Invalid token:', userData.error);
      res.status(401).send('Authentication failed: ' + userData.error);
    }
  } catch (error) {
    console.error('Verification error:', error.message);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    res.status(500).send('Authentication error');
  }
});

// Helper function to find user by email
async function findUserByEmail(email) {
  // This is just a placeholder - implement your database logic here
  // Example with MongoDB:
  // return await User.findOne({ email });
  return null;
}

// Helper function to create a new user
async function createUser(userData) {
  // This is just a placeholder - implement your database logic here
  // Example with MongoDB:
  // return await User.create(userData);
  return { id: 'new-user-id', ...userData };
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// -----------------------------------------------------------------------------
// Python Example (Flask)
// -----------------------------------------------------------------------------

/* 
import os
import requests
from flask import Flask, request, redirect, session

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "your-secret-key")

# Set your API key received from Crafteri Auth
API_KEY = "your_api_key_here"

@app.route("/crafteriauth/return")
def crafteri_callback():
    # Get token from query parameters
    token = request.args.get("token")
    
    if not token:
        return "Token is missing", 400
    
    try:
        # Verify token with Crafteri Auth API
        response = requests.post(
            "https://auth.crafteri.net/api/verify-token",
            headers={"API-Key": API_KEY},
            json={"payload": token}  # Note: Token must be in 'payload' field
        )
        
        # Check if the request was successful
        response.raise_for_status()
        
        # Parse the response
        user_data = response.json()
        
        # Check if token is valid
        if user_data.get("valid", False):
            # Token is valid, user is authenticated
            
            # Store user data in session
            session["user_id"] = user_data["id"]
            session["username"] = user_data["username"]
            session["email"] = user_data["email"]
            
            # Redirect to dashboard
            return redirect("/dashboard")
        else:
            # Token is invalid
            error = user_data.get("error", "Unknown error")
            return f"Authentication failed: {error}", 401
            
    except requests.exceptions.RequestException as e:
        # Handle request errors
        print(f"Verification error: {str(e)}")
        return "Authentication error", 500

if __name__ == "__main__":
    app.run(debug=True)
*/

// -----------------------------------------------------------------------------
// Example Error Handling
// -----------------------------------------------------------------------------

/**
 * This function demonstrates how to handle the various error responses
 * that might be returned from the CrafteriAuth API
 */
async function handleCrafteriAuthErrors(token) {
  try {
    const response = await axios.post(
      'https://auth.crafteri.net/api/verify-token',
      { payload: token },
      { headers: { 'API-Key': API_KEY } }
    );
    
    const data = response.data;
    
    if (data.valid) {
      // Success case - token is valid
      return {
        success: true,
        user: {
          id: data.id,
          username: data.username,
          email: data.email
        }
      };
    } else {
      // Token is invalid but we got a response
      console.log('Token validation failed:', data.error);
      
      // Handle different error types
      switch (data.error) {
        case 'Token expired':
          return {
            success: false,
            reason: 'EXPIRED',
            message: 'Your login session has expired. Please login again.'
          };
          
        case 'Invalid token: Signature verification failed':
          return {
            success: false,
            reason: 'INVALID_SIGNATURE',
            message: 'Invalid authentication token.'
          };
          
        case 'Invalid token: Not enough segments':
          return {
            success: false,
            reason: 'MALFORMED',
            message: 'Malformed authentication token.'
          };
          
        default:
          return {
            success: false,
            reason: 'UNKNOWN',
            message: 'Authentication failed for unknown reason.'
          };
      }
    }
  } catch (error) {
    // Request failed completely
    if (error.response && error.response.data.error === 'Unauthorized') {
      return {
        success: false,
        reason: 'UNAUTHORIZED',
        message: 'Invalid API key or unauthorized request.'
      };
    }
    
    return {
      success: false,
      reason: 'REQUEST_FAILED',
      message: 'Failed to connect to authentication server.'
    };
  }
}
