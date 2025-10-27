import { Auth0Client } from '@auth0/nextjs-auth0/server';

export const auth0 = new Auth0Client({
  routes: {
    login: '/api/auth/login',
    logout: '/api/auth/logout',
    callback: '/api/auth/callback',
    backChannelLogout: '/api/auth/backchannel-logout',
  },
});

// Get the refresh token from Auth0 session
export const getRefreshToken = async () => {
  const session = await auth0.getSession();
  const refreshToken = session?.tokenSet?.refreshToken;
  
  // Log for debugging - if null, user needs to authorize with offline_access
  if (!refreshToken) {
    console.warn('⚠️ No refresh token found in session - user needs to connect Google account with offline_access');
  }
  
  return refreshToken;
};

export const getUser = async () => {
  const session = await auth0.getSession();
  return session?.user;
};
