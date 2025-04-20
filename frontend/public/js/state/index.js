/**
 * State Management System - Entry point
 * 
 * This file exports all state management components for easy importing
 * and provides a consistent interface for the application.
 * Initializes WebSocket-Store sync service for real-time updates.
 */

// Import and re-export all state management components
import { store } from './stateManager.js';
import { ApiService } from './apiService.js';
import { StorageService } from './storageService.js';

// Import WebSocket service and WebSocket-Store sync service
import { webSocketService } from '../services/webSocketService.js';

// Initialize WebSocket connection when the state is loaded
webSocketService.connect()
  .then(() => console.log('WebSocket connected'))
  .catch(error => console.error('WebSocket connection failed:', error));

// Export the singleton store instance as default
export default store;

// Export individual services
export {
  store,
  ApiService,
  StorageService,
  webSocketService
};

// For non-module scripts, expose to global window object
window.FinTrackState = {
  store,
  ApiService,
  StorageService,
  webSocketService
};

// Import and initialize WebSocket-Store sync service
// This must be imported after the store is exported to avoid circular dependencies
import '../services/wsStoreSync.js';
