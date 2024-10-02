// server.js
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { OAuth2Client } = require('google-auth-library');

// Replace with your Google OAuth Client ID
const client = new OAuth2Client('771472830027-ls01kb7d3c8alfump1ppfi4so723cvun.apps.googleusercontent.com');

app.use(bodyParser.json());

// API to handle Google OAuth2 authentication
app.post('/api/auth/google', async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  
  try {
    // Verify the Google OAuth2 token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: '771472830027-ls01kb7d3c8alfump1ppfi4so723cvun.apps.googleusercontent.com',  // Replace with the actual client ID
    });
    const payload = ticket.getPayload();

    // The payload contains information about the authenticated user
    // For example, the user's email, name, and Google ID
    const userId = payload.sub; // Google user ID
    const email = payload.email;

    // Here you can check if the user exists in Pocketbase or create a new account
    // You can send this information to Pocketbase for further processing

    res.status(200).json({ status: 'Success', payload });
  } catch (error) {
    res.status(400).json({ status: 'Failure', error: error.message });
  }
});

const axios = require('axios');


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


// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
