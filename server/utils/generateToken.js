import jwt from 'jsonwebtoken';

export const generateAccessToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET || 'kingsmart_super_secret_access_token_123!', 
    { expiresIn: '1d' } // Access token valid for 1 day in development
  );
};

export const generateRefreshToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_REFRESH_SECRET || 'kingsmart_super_secret_refresh_token_456!', 
    { expiresIn: '7d' } // Refresh token valid for 7 days
  );
};
