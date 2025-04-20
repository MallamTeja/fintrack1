/**
 * Logout Handler
 * Attaches event listener to logout button to handle user logout
 */

import { store } from '../state/index.js';

function setupLogout() {
  const logoutButton = document.getElementById('logoutButton');
  if (!logoutButton) return;

  logoutButton.addEventListener('click', (e) => {
    e.stopPropagation();
    console.log('Logout clicked');

    // Remove token from localStorage
    localStorage.removeItem('token');

    // Reset state via store
    if (store) {
      store.dispatch('user:logout');
    }

    // Redirect to login page
    window.location.href = '/login.html';
  });
}

// Setup logout on DOMContentLoaded
document.addEventListener('DOMContentLoaded', setupLogout);

// Export for ES modules
export { setupLogout };

// For non-module scripts
window.setupLogout = setupLogout;
