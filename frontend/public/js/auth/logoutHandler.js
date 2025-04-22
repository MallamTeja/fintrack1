/**
 * Logout Handler
 * Attaches event listener to logout button to handle user logout
 */

import { store } from '../state/index.js';

function setupLogout() {
  const attachListener = () => {
    const logoutButton = document.getElementById('logoutButton');
    if (!logoutButton) return;

    // Remove any existing listener to avoid duplicates
    logoutButton.removeEventListener('click', handleLogout);

    logoutButton.addEventListener('click', handleLogout);
  };

  const handleLogout = (e) => {
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
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachListener);
  } else {
    // DOM already loaded
    attachListener();
  }
}

// Setup logout on script load
setupLogout();

// Export for ES modules
export { setupLogout };

// For non-module scripts
window.setupLogout = setupLogout;
