/**
 * Real-Time Test Script for FinTrack
 * 
 * This script provides a comprehensive testing suite for verifying
 * the real-time transaction functionality in FinTrack.
 */

// Import required modules
import { store } from '../state/index.js';
import { webSocketService } from '../services/webSocketService.js';
import { ApiService } from '../state/apiService.js';

const apiService = new ApiService();

class RealTimeTest {
  constructor() {
    // Singleton pattern
    if (RealTimeTest.instance) {
      return RealTimeTest.instance;
    }
    
    RealTimeTest.instance = this;
    
    // Test state
    this.testState = {
      apiTests: [],
      webSocketTests: [],
      storeTests: [],
      uiTests: [],
      errors: []
    };
    
    // Initialize
    this.initialize();
  }
  
  /**
   * Initialize the test script
   */
  initialize() {
    console.log('Real-Time Test Script initialized');
    
    // Add test methods to window for easy access from console
    window.realTimeTest = {
      testAPI: this.testAPI.bind(this),
      testWebSocket: this.testWebSocket.bind(this),
      testStore: this.testStore.bind(this),
      testUI: this.testUI.bind(this),
      testFullFlow: this.testFullFlow.bind(this),
      testMultiTab: this.testMultiTab.bind(this),
      getTestResults: this.getTestResults.bind(this),
      clearTestResults: this.clearTestResults.bind(this)
    };
  }
  
  /**
   * Test the API for adding transactions
   * @param {Object} transaction - Transaction data
   * @returns {Promise<Object>} Test results
   */
  async testAPI(transaction = null) {
    console.log('Testing transaction API...');
    
    const testTransaction = transaction || {
      type: 'expense',
      category: 'food',
      amount: 45.99,
      description: 'API Test: Lunch at cafe',
      date: new Date().toISOString()
    };
    
    try {
      // Make direct API call
      console.log('Making direct API call to add transaction:', testTransaction);
      
      // Get authentication token
      const token = store.getState('user')?.token;
      if (!token) {
        throw new Error('No authentication token found. Please log in first.');
      }
      
      // Set up headers
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };
      
      // Make API call
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers,
        body: JSON.stringify(testTransaction)
      });
      
      // Parse response
      const data = await response.json();
      
      // Log results
      console.log('API response:', data);
      
      // Store test results
      this.testState.apiTests.push({
        type: 'add',
        request: testTransaction,
        response: data,
        success: response.ok,
        timestamp: Date.now()
      });
      
      return {
        success: response.ok,
        data,
        transaction: testTransaction
      };
    } catch (error) {
      console.error('API test failed:', error);
      
      // Store error
      this.testState.errors.push({
        type: 'api',
        message: error.message,
        stack: error.stack,
        timestamp: Date.now()
      });
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Test WebSocket event emission and reception
   * @param {Object} transaction - Transaction data
   * @returns {Promise<Object>} Test results
   */
  async testWebSocket(transaction = null) {
    console.log('Testing WebSocket event emission and reception...');
    
    const testTransaction = transaction || {
      type: 'expense',
      category: 'food',
      amount: 35.99,
      description: 'WebSocket Test: Dinner',
      date: new Date().toISOString()
    };
    
    try {
      // Check WebSocket connection
      if (!webSocketService.isConnected()) {
        console.warn('WebSocket not connected. Attempting to connect...');
        await webSocketService.connect();
      }
      
      // Set up event listener
      const eventPromise = new Promise((resolve) => {
        const unsubscribe = webSocketService.on('transaction:added', (data) => {
          console.log('WebSocket event received:', data);
          
          // Store test results
          this.testState.webSocketTests.push({
            type: 'receive',
            event: 'transaction:added',
            data,
            timestamp: Date.now()
          });
          
          unsubscribe();
          resolve(data);
        });
        
        // Timeout after 5 seconds
        setTimeout(() => {
          unsubscribe();
          resolve(null);
        }, 5000);
      });
      
      // Add transaction via API to trigger WebSocket event
      console.log('Adding transaction via API to trigger WebSocket event...');
      const apiResult = await this.testAPI(testTransaction);
      
      if (!apiResult.success) {
        throw new Error(`API call failed: ${apiResult.error}`);
      }
      
      // Wait for WebSocket event
      console.log('Waiting for WebSocket event...');
      const eventData = await eventPromise;
      
      if (!eventData) {
        throw new Error('No WebSocket event received within timeout period');
      }
      
      return {
        success: true,
        apiResult,
        eventData
      };
    } catch (error) {
      console.error('WebSocket test failed:', error);
      
      // Store error
      this.testState.errors.push({
        type: 'websocket',
        message: error.message,
        stack: error.stack,
        timestamp: Date.now()
      });
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Test store updates from WebSocket events
   * @returns {Promise<Object>} Test results
   */
  async testStore() {
    console.log('Testing store updates from WebSocket events...');
    
    try {
      // Get initial transaction count
      const initialTransactions = store.getState('transactions');
      const initialCount = initialTransactions.length;
      
      console.log(`Initial transaction count: ${initialCount}`);
      
      // Set up store subscription
      const storePromise = new Promise((resolve) => {
        const unsubscribe = store.subscribe('transactions:updated', (transactions) => {
          console.log('Store updated:', transactions);
          
          // Store test results
          this.testState.storeTests.push({
            type: 'update',
            count: transactions.length,
            timestamp: Date.now()
          });
          
          unsubscribe();
          resolve(transactions);
        });
        
        // Timeout after 5 seconds
        setTimeout(() => {
          unsubscribe();
          resolve(null);
        }, 5000);
      });
      
      // Test WebSocket to trigger store update
      console.log('Testing WebSocket to trigger store update...');
      const wsResult = await this.testWebSocket();
      
      if (!wsResult.success) {
        throw new Error(`WebSocket test failed: ${wsResult.error}`);
      }
      
      // Wait for store update
      console.log('Waiting for store update...');
      const updatedTransactions = await storePromise;
      
      if (!updatedTransactions) {
        throw new Error('No store update received within timeout period');
      }
      
      // Check if transaction count increased
      const newCount = updatedTransactions.length;
      const countIncreased = newCount > initialCount;
      
      console.log(`New transaction count: ${newCount} (${countIncreased ? 'increased' : 'unchanged'})`);
      
      return {
        success: countIncreased,
        initialCount,
        newCount,
        wsResult
      };
    } catch (error) {
      console.error('Store test failed:', error);
      
      // Store error
      this.testState.errors.push({
        type: 'store',
        message: error.message,
        stack: error.stack,
        timestamp: Date.now()
      });
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Test UI updates from store changes
   * @returns {Promise<Object>} Test results
   */
  async testUI() {
    console.log('Testing UI updates from store changes...');
    
    try {
      // Find transaction list element
      const transactionList = document.querySelector('.transaction-list') || 
                             document.querySelector('#transaction-list') ||
                             document.querySelector('[data-transactions]');
      
      if (!transactionList) {
        throw new Error('Transaction list element not found in the DOM');
      }
      
      // Get initial transaction count in UI
      const initialCount = transactionList.querySelectorAll('li, tr, .transaction-item').length;
      
      console.log(`Initial UI transaction count: ${initialCount}`);
      
      // Create a mutation observer to detect DOM changes
      const uiPromise = new Promise((resolve) => {
        const observer = new MutationObserver((mutations) => {
          // Check if transaction list has changed
          const newCount = transactionList.querySelectorAll('li, tr, .transaction-item').length;
          
          if (newCount !== initialCount) {
            console.log(`UI updated: ${initialCount} -> ${newCount} transactions`);
            
            // Store test results
            this.testState.uiTests.push({
              type: 'update',
              initialCount,
              newCount,
              timestamp: Date.now()
            });
            
            observer.disconnect();
            resolve(newCount);
          }
        });
        
        // Start observing
        observer.observe(transactionList, { 
          childList: true, 
          subtree: true 
        });
        
        // Timeout after 5 seconds
        setTimeout(() => {
          observer.disconnect();
          resolve(null);
        }, 5000);
      });
      
      // Test store to trigger UI update
      console.log('Testing store to trigger UI update...');
      const storeResult = await this.testStore();
      
      if (!storeResult.success) {
        throw new Error(`Store test failed: ${storeResult.error}`);
      }
      
      // Wait for UI update
      console.log('Waiting for UI update...');
      const newCount = await uiPromise;
      
      if (newCount === null) {
        throw new Error('No UI update detected within timeout period');
      }
      
      return {
        success: newCount > initialCount,
        initialCount,
        newCount,
        storeResult
      };
    } catch (error) {
      console.error('UI test failed:', error);
      
      // Store error
      this.testState.errors.push({
        type: 'ui',
        message: error.message,
        stack: error.stack,
        timestamp: Date.now()
      });
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Test the full real-time flow from API to UI
   * @returns {Promise<Object>} Test results
   */
  async testFullFlow() {
    console.log('Testing full real-time flow from API to UI...');
    
    try {
      // Clear test results
      this.clearTestResults();
      
      // Test UI updates
      const uiResult = await this.testUI();
      
      if (!uiResult.success) {
        throw new Error(`UI test failed: ${uiResult.error}`);
      }
      
      // Compile results
      const results = {
        success: true,
        api: this.testState.apiTests[0],
        websocket: this.testState.webSocketTests[0],
        store: this.testState.storeTests[0],
        ui: this.testState.uiTests[0]
      };
      
      console.log('Full flow test completed successfully:', results);
      
      return results;
    } catch (error) {
      console.error('Full flow test failed:', error);
      
      return {
        success: false,
        error: error.message,
        testState: this.testState
      };
    }
  }
  
  /**
   * Test multi-tab functionality
   * @returns {Object} Instructions for multi-tab testing
   */
  testMultiTab() {
    console.log('Testing multi-tab functionality...');
    
    // Generate a unique transaction description
    const uniqueId = Date.now();
    const description = `Multi-tab test: ${uniqueId}`;
    
    // Create test transaction
    const testTransaction = {
      type: 'expense',
      category: 'entertainment',
      amount: 55.99,
      description,
      date: new Date().toISOString()
    };
    
    // Log instructions
    console.log('Multi-tab test instructions:');
    console.log('1. Open another tab with FinTrack');
    console.log('2. In this tab, run the following command:');
    console.log(`   realTimeTest.testAPI(${JSON.stringify(testTransaction, null, 2)})`);
    console.log('3. Switch to the other tab and check if the transaction appears automatically');
    
    return {
      instructions: 'Follow the instructions in the console',
      testTransaction
    };
  }
  
  /**
   * Get current test results
   * @returns {Object} Test results
   */
  getTestResults() {
    return { ...this.testState };
  }
  
  /**
   * Clear test results
   */
  clearTestResults() {
    this.testState = {
      apiTests: [],
      webSocketTests: [],
      storeTests: [],
      uiTests: [],
      errors: []
    };
    
    return 'Test results cleared';
  }
}

// Create and export singleton instance
export const realTimeTest = new RealTimeTest();

// For backwards compatibility with non-module scripts
window.realTimeTest = realTimeTest;
