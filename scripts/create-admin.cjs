const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const { cert, getApps, initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD for this one-time command.');
}

if (password.length < 12) {
  throw new Error('ADMIN_PASSWORD must contain at least 12 characters.');
}

const app = getApps()[0] || initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: String(process.env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, '\n'),
  }),
});

async function provision() {
  const auth = getAuth(app);
  let user;
  try {
    user = await auth.getUserByEmail(email);
    await auth.updateUser(user.uid, { password });
  } catch (error) {
    if (error.code !== 'auth/user-not-found') throw error;
    user = await auth.createUser({ email, password, emailVerified: true });
  }

  await auth.setCustomUserClaims(user.uid, { admin: true });
  console.log(`Administrator provisioned: ${user.email}`);
  console.log('Sign out and sign in again to refresh the admin claim.');
}

provision().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
