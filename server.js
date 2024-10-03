// server.js
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { OAuth2Client } = require('google-auth-library');

// Replace with your Google OAuth Client ID
const client = new OAuth2Client('771472830027-ls01kb7d3c8alfump1ppfi4so723cvun.apps.googleusercontent.com');

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

app.use(bodyParser.json());

// API to handle Google OAuth2 authentication
// API to handle Google OAuth2 authentication
app.post('/api/auth/google', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(400).json({ status: 'Failure', error: 'Authorization header missing' });
  }
  const token = authHeader.split(' ')[1];
  
    try {
      // Verify the Google OAuth2 token
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: '771472830027-ls01kb7d3c8alfump1ppfi4so723cvun.apps.googleusercontent.com',  // Replace with the actual client ID
      });
      const payload = ticket.getPayload();
      
      // Extract Google ID and email
      const googleId = payload.sub; // Google user ID
      const email = payload.email;
  
      // Check if user exists in Pocketbase or create new user
      const user = await authenticateWithPocketbase(token);
  
      res.status(200).json({ status: 'Success', user });
    } catch (error) {
      res.status(400).json({ status: 'Failure', error: error.message });
    }
  });
  

  
const axios = require('axios');

async function getUserFromPocketbase(googleId) {
    try {
      const response = await axios.get(`https://3jx8jtwq-8090.uks1.devtunnels.ms/api/collections/_pb_users_auth_/records?filter=oauthGoogleId='${googleId}'`);
      const users = response.data.items;
      
      if (users.length > 0) {
        return users[0]; // User found
      } else {
        return null; // User not found
      }
    } catch (error) {
      console.error('Error fetching user from Pocketbase:', error.response ? error.response.data : error.message);
      return null;
    }
  }
  

// Google OAuth token verification
async function verifyGoogleToken(idToken) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: '771472830027-ls01kb7d3c8alfump1ppfi4so723cvun.apps.googleusercontent.com',
    });
    return ticket.getPayload(); // User information from Google
  } catch (error) {
    throw new Error('Invalid token');
  }
}

// Authenticate or register the user
async function authenticateWithPocketbase(idToken) {
    try {
      // Verify Google token
      const payload = await verifyGoogleToken(idToken);
      const googleId = payload.sub;
      const email = payload.email;
  
      // Check if the user exists in Pocketbase
      let user = await getUserFromPocketbase(googleId);
      if (!user) {
        // User not found, create a new one
        await createUserInPocketbase(email, googleId);
        user = await getUserFromPocketbase(googleId); // Fetch the newly created user
      }
  
      console.log('Authenticated user:', user);
      return user;
    } catch (error) {
      console.error('Authentication failed:', error.message);
    }
  }
  
  // Get user from Pocketbase
  async function getUserFromPocketbase(googleId) {
    try {
      const response = await axios.get(`https://3jx8jtwq-8090.uks1.devtunnels.ms/api/collections/_pb_users_auth_/records?filter=oauthGoogleId='${googleId}'`);
      const users = response.data.items;
  
      if (users.length > 0) {
        return users[0]; // User found
      } else {
        return null; // User not found
      }
    } catch (error) {
      console.error('Error fetching user from Pocketbase:', error.response ? error.response.data : error.message);
      return null;
    }
  }
  
  // Create user in Pocketbase
  async function createUserInPocketbase(email, googleId) {
    try {
      const response = await axios.post('https://3jx8jtwq-8090.uks1.devtunnels.ms/api/collections/_pb_users_auth_/records', {
        email: email,
        password: 'randomGeneratedPassword',
        oauthGoogleId: googleId, // Use valid field name for Google ID
      });
      console.log('User created in Pocketbase:', response.data);
    } catch (error) {
      console.error('Error creating user in Pocketbase:', error.response ? error.response.data : error.message);
    }
  }
  
