/**
 * config.example.js - Template for Local Credentials Configuration
 * ZENITH Fine Art Gallery & Auction House
 *
 * Setup: Copy this file to `js/config.local.js` and fill in your local
 * credentials. `js/config.local.js` is excluded via `.gitignore`.
 */

window.ZENITH_LOCAL_CONFIG = {
  admin: {
    email: 'admin@example.com',
    password: 'CHANGE_ME_LOCAL_ADMIN_PASSWORD',
    securityCode: 'CHANGE_ME_CODE',
    authVersion: 2
  },
  demoUserPassword: 'CHANGE_ME_COLLECTOR_PASSWORD',
  demoArtistPassword: 'CHANGE_ME_ARTIST_PASSWORD'
};
