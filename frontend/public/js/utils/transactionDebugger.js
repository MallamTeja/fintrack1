/**
 * Transaction Debugger Utility
 * 
 * This utility helps debug transaction-related issues by:
 * 1. Logging detailed information about transaction operations
 * 2. Validating transaction data structure
 * 3. Testing the full transaction flow (API → WebSocket → Store → UI)
 */

import { store } from '../state/index.js';
import { webSocketService } from '../services/webSocketService.js';
import { apiService } from '../state/apiService.js';

class TransactionDebugger {
  constructor() {
    // Singleton pattern
    if (TransactionDebugger.instance) {
      return TransactionDebugger.instance;
    }
    
    TransactionDebugger.instance = this;
    
    // Debug state
    this.debugState = {
      apiCalls: [],
      webSocketEvents: [],
      storeUpdates: [],
      errors: []
    };
    
    // Initialize
    this.initialize();
  }
  
  /**
   * Initialize the debugger
   */
  initialize() {
    console.log('Transaction Debugger initialized');
    
    // Add debug methods to window for easy access from console
    window.transactionDebugger = {
      testAddTransaction: this.testAddTransaction.bind(this),
      validateTransactionModel: this.validateTransactionModel.bind(this),
      monitorTransactionFlow: this.monitorTransactionFlow.bind(this),
      getDebugState: this.getDebugState.bind(this),
      clearDebugState: this.clearDebugState.bind(this),
      fixTransactionIssues: this.fixTransactionIssues.bind(this)
    };
  }
  
  /**
   * Test adding a transaction with detailed logging
   * @param {Object} transaction - Transaction data
   */
  async testAddTransaction(transaction = null) {
    this.clearDebugState();
    console.log('Testing transaction addition with detailed logging');
    
    const testTransaction = transaction || {
      type: 'expense',
      category: 'food',
      amount: 25.99,
      description: 'Test transaction',
      date: new Date().toISOString()
    };
    
    try {
      // 1. Log transaction data
      console.log('Transaction data:', testTransaction);
      this.debugState.apiCalls.push({
        type: 'request',
        endpoint: '/transactions',
        method: 'POST',
        data: testTransaction,
        timestamp: Date.now()
      });
      
      // 2. Make direct API call
      console.log('Making direct API call to add transaction...');
      const response = await apiService.post('/transactions', testTransaction);
      
      this.debugState.apiCalls.push({
        type: 'response',
        endpoint: '/transactions',
        method: 'POST',
        data: response,
        timestamp: Date.now()
      });
      
      console.log('API response:', response);
      
      // 3. Check if WebSocket event was received
      console.log('Waiting for WebSocket event...');
      
      // Set up temporary WebSocket event listener
      const wsPromise = new Promise(resolve => {
        const unsubscribe = webSocketService.on('transaction:added', data => {
          this.debugState.webSocketEvents.push({
            event: 'transaction:added',
            data,
            timestamp: Date.now()
          });
          
          console.log('WebSocket event received:', data);
          unsubscribe();
          resolve(data);
        });
        
        // Timeout after 5 seconds
        setTimeout(() => {
          unsubscribe();
          resolve(null);
        }, 5000);
      });
      
      const wsEvent = await wsPromise;
      
      if (!wsEvent) {
        console.warn('No WebSocket event received within timeout period');
        this.debugState.errors.push({
          type: 'websocket',
          message: 'No WebSocket event received within timeout period',
          timestamp: Date.now()
        });
      }
      
      // 4. Check if store was updated
      console.log('Checking store state...');
      const transactions = store.getState('transactions');
      
      this.debugState.storeUpdates.push({
        type: 'transactions',
        count: transactions.length,
        data: transactions,
        timestamp: Date.now()
      });
      
      const foundTransaction = transactions.find(t => 
        t.description === testTransaction.description && 
        t.amount === testTransaction.amount
      );
      
      if (foundTransaction) {
        console.log('Transaction found in store:', foundTransaction);
      } else {
        console.warn('Transaction not found in store');
        this.debugState.errors.push({
          type: 'store',
          message: 'Transaction not found in store',
          timestamp: Date.now()
        });
      }
      
      // 5. Return debug results
      return {
        success: !!foundTransaction,
        apiResponse: response,
        webSocketEvent: wsEvent,
        storeTransaction: foundTransaction,
        debugState: this.debugState
      };
    } catch (error) {
      console.error('Error in transaction test:', error);
      
      this.debugState.errors.push({
        type: 'api',
        message: error.message,
        stack: error.stack,
        timestamp: Date.now()
      });
      
      return {
        success: false,
        error: error.message,
        debugState: this.debugState
      };
    }
  }
  
  /**
   * Validate transaction model against backend requirements
   * @param {Object} transaction - Transaction to validate
   * @returns {Object} Validation results
   */
  validateTransactionModel(transaction) {
    const validationResults = {
      isValid: true,
      errors: [],
      warnings: [],
      fixedTransaction: { ...transaction }
    };
    
    // Required fields
    if (!transaction.type) {
      validationResults.isValid = false;
      validationResults.errors.push('Missing required field: type');
      validationResults.fixedTransaction.type = 'expense'; // Default value
    } else if (!['income', 'expense'].includes(transaction.type)) {
      validationResults.isValid = false;
      validationResults.errors.push('Invalid transaction type. Must be "income" or "expense"');
      validationResults.fixedTransaction.type = 'expense'; // Default value
    }
    
    if (!transaction.category) {
      validationResults.isValid = false;
      validationResults.errors.push('Missing required field: category');
      validationResults.fixedTransaction.category = 'other'; // Default value
    }
    
    if (!transaction.amount) {
      validationResults.isValid = false;
      validationResults.errors.push('Missing required field: amount');
      validationResults.fixedTransaction.amount = 0; // Default value
    } else if (isNaN(parseFloat(transaction.amount)) || parseFloat(transaction.amount) <= 0) {
      validationResults.isValid = false;
      validationResults.errors.push('Invalid amount. Must be a positive number');
      validationResults.fixedTransaction.amount = 1; // Default value
    }
    
    // Optional fields with defaults
    if (!transaction.description) {
      validationResults.warnings.push('Missing optional field: description');
      validationResults.fixedTransaction.description = ''; // Default value
    }
    
    if (!transaction.date) {
      validationResults.warnings.push('Missing optional field: date');
      validationResults.fixedTransaction.date = new Date().toISOString(); // Default value
    }
    
    // Check for extra fields that might cause issues
    const allowedFields = ['type', 'category', 'amount', 'description', 'date', 'user', '_id', 'id'];
    const extraFields = Object.keys(transaction).filter(key => !allowedFields.includes(key));
    
    if (extraFields.length > 0) {
      validationResults.warnings.push(`Extra fields found: ${extraFields.join(', ')}`);
      
      // Remove extra fields from fixed transaction
      extraFields.forEach(field => {
        delete validationResults.fixedTransaction[field];
      });
    }
    
    return validationResults;
  }
  
  /**
   * Monitor the full transaction flow
   */
  monitorTransactionFlow() {
    this.clearDebugState();
    console.log('Monitoring transaction flow...');
    
    // Monitor API calls
    const originalApiPost = apiService.post;
    apiService.post = (url, data) => {
      if (url.includes('/transaction')) {
        this.debugState.apiCalls.push({
          type: 'request',
          endpoint: url,
          method: 'POST',
          data,
          timestamp: Date.now()
        });
      }
      
      return originalApiPost.call(apiService, url, data)
        .then(response => {
          if (url.includes('/transaction')) {
            this.debugState.apiCalls.push({
              type: 'response',
              endpoint: url,
              method: 'POST',
              data: response,
              timestamp: Date.now()
            });
          }
          
          return response;
        })
        .catch(error => {
          if (url.includes('/transaction')) {
            this.debugState.errors.push({
              type: 'api',
              endpoint: url,
              method: 'POST',
              message: error.message,
              timestamp: Date.now()
            });
          }
          
          throw error;
        });
    };
    
    // Monitor WebSocket events
    webSocketService.on('transaction:added', data => {
      this.debugState.webSocketEvents.push({
        event: 'transaction:added',
        data,
        timestamp: Date.now()
      });
    });
    
    // Monitor store updates
    store.subscribe('transactions:updated', data => {
      this.debugState.storeUpdates.push({
        type: 'transactions:updated',
        count: data.length,
        timestamp: Date.now()
      });
    });
    
    store.subscribe('transaction:added', data => {
      this.debugState.storeUpdates.push({
        type: 'transaction:added',
        data,
        timestamp: Date.now()
      });
    });
    
    console.log('Transaction flow monitoring active. Add a transaction to see the flow.');
    
    return 'Transaction flow monitoring active. Add a transaction to see the flow.';
  }
  
  /**
   * Get current debug state
   * @returns {Object} Debug state
   */
  getDebugState() {
    return { ...this.debugState };
  }
  
  /**
   * Clear debug state
   */
  clearDebugState() {
    this.debugState = {
      apiCalls: [],
      webSocketEvents: [],
      storeUpdates: [],
      errors: []
    };
    
    return 'Debug state cleared';
  }
  
  /**
   * Fix common transaction issues
   */
  fixTransactionIssues() {
    console.log('Applying fixes for common transaction issues...');
    
    // Fix 1: Ensure WebSocket service is properly connected
    if (!webSocketService.isConnected()) {
      console.log('WebSocket not connected. Attempting to connect...');
      webSocketService.connect()
        .then(() => console.log('WebSocket connected successfully'))
        .catch(error => console.error('Failed to connect WebSocket:', error));
    }
    
    // Fix 2: Ensure API service has authentication token
    const user = store.getState('user');
    if (user && user.token) {
      console.log('Setting authentication token in API service...');
      apiService.setToken(user.token);
      webSocketService.setToken(user.token);
    } else {
      console.warn('No user token found. Authentication may fail.');
    }
    
    // Fix 3: Ensure transaction model is consistent
    console.log('Patching transaction model handling...');
    
    // Patch store's addTransaction method to validate transactions
    const originalAddTransaction = store.addTransaction;
    store.addTransaction = async (transaction) => {
      console.log('Validating transaction before adding:', transaction);
      
      // Validate and fix transaction
      const validation = this.validateTransactionModel(transaction);
      
      if (!validation.isValid) {
        console.warn('Transaction validation failed:', validation.errors);
        console.log('Using fixed transaction:', validation.fixedTransaction);
        
        // Use fixed transaction
        return originalAddTransaction.call(store, validation.fixedTransaction);
      }
      
      return originalAddTransaction.call(store, transaction);
    };
    
    return 'Transaction fixes applied. Try adding a transaction now.';
  }
}

// Create and export singleton instance
export const transactionDebugger = new TransactionDebugger();

// For backwards compatibility with non-module scripts
window.transactionDebugger = transactionDebugger;
