/**
 * Real-Time Testing Utilities
 * 
 * This module provides utilities for testing the real-time capabilities of the FinTrack application.
 * It includes functions for:
 * 1. Simulating WebSocket events
 * 2. Monitoring state changes
 * 3. Validating the full real-time loop
 */

import { store } from '../state/index.js';
import { webSocketService } from '../services/webSocketService.js';
import { wsStoreSync } from '../services/wsStoreSync.js';

class RealTimeTestUtils {
  constructor() {
    // Singleton pattern
    if (RealTimeTestUtils.instance) {
      return RealTimeTestUtils.instance;
    }
    
    RealTimeTestUtils.instance = this;
    
    // Test state
    this.testState = {
      stateChanges: [],
      webSocketEvents: [],
      isRunning: false,
      startTime: null
    };
    
    // Event mapping
    this.eventMap = {
      // Transaction events
      'transaction:add': 'transaction:added',
      'transaction:update': 'transaction:updated',
      'transaction:delete': 'transaction:deleted',
      
      // Budget events
      'budget:add': 'budget:added',
      'budget:update': 'budget:updated',
      'budget:delete': 'budget:deleted',
      
      // Savings goal events
      'savingsGoal:add': 'savingsGoal:added',
      'savingsGoal:update': 'savingsGoal:updated',
      'savingsGoal:delete': 'savingsGoal:deleted'
    };
    
    // Initialize
    this.initialize();
  }
  
  /**
   * Initialize test utilities
   */
  initialize() {
    console.log('Initializing Real-Time Test Utilities');
    
    // Add test methods to window for easy access from console
    window.testRealTime = {
      startTest: this.startTest.bind(this),
      stopTest: this.stopTest.bind(this),
      simulateTransactionAdd: this.simulateTransactionAdd.bind(this),
      simulateTransactionUpdate: this.simulateTransactionUpdate.bind(this),
      simulateTransactionDelete: this.simulateTransactionDelete.bind(this),
      simulateBudgetAdd: this.simulateBudgetAdd.bind(this),
      simulateBudgetUpdate: this.simulateBudgetUpdate.bind(this),
      simulateBudgetDelete: this.simulateBudgetDelete.bind(this),
      simulateSavingsGoalAdd: this.simulateSavingsGoalAdd.bind(this),
      simulateSavingsGoalUpdate: this.simulateSavingsGoalUpdate.bind(this),
      simulateSavingsGoalDelete: this.simulateSavingsGoalDelete.bind(this),
      getTestResults: this.getTestResults.bind(this),
      clearTestResults: this.clearTestResults.bind(this),
      testConnectionDropAndReconnect: this.testConnectionDropAndReconnect.bind(this),
      testFullRealTimeLoop: this.testFullRealTimeLoop.bind(this)
    };
  }
  
  /**
   * Start test monitoring
   */
  startTest() {
    if (this.testState.isRunning) {
      console.warn('Test is already running');
      return;
    }
    
    console.log('Starting real-time test monitoring');
    
    // Reset test state
    this.clearTestResults();
    
    // Set test state
    this.testState.isRunning = true;
    this.testState.startTime = Date.now();
    
    // Set up state change monitoring
    this.unsubscribeTransactions = store.subscribe('transactions:updated', (data) => {
      this.recordStateChange('transactions:updated', data);
    });
    
    this.unsubscribeBudgets = store.subscribe('budgets:updated', (data) => {
      this.recordStateChange('budgets:updated', data);
    });
    
    this.unsubscribeSavingsGoals = store.subscribe('savingsGoals:updated', (data) => {
      this.recordStateChange('savingsGoals:updated', data);
    });
    
    // Set up WebSocket event monitoring
    this.originalHandleMessage = webSocketService.handleMessage;
    webSocketService.handleMessage = (message) => {
      this.recordWebSocketEvent(message.event, message.data);
      this.originalHandleMessage.call(webSocketService, message);
    };
    
    return 'Test monitoring started';
  }
  
  /**
   * Stop test monitoring
   */
  stopTest() {
    if (!this.testState.isRunning) {
      console.warn('No test is running');
      return;
    }
    
    console.log('Stopping real-time test monitoring');
    
    // Unsubscribe from state changes
    this.unsubscribeTransactions && this.unsubscribeTransactions();
    this.unsubscribeBudgets && this.unsubscribeBudgets();
    this.unsubscribeSavingsGoals && this.unsubscribeSavingsGoals();
    
    // Restore original WebSocket handler
    if (this.originalHandleMessage) {
      webSocketService.handleMessage = this.originalHandleMessage;
      this.originalHandleMessage = null;
    }
    
    // Set test state
    this.testState.isRunning = false;
    
    return 'Test monitoring stopped';
  }
  
  /**
   * Record state change
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  recordStateChange(event, data) {
    if (!this.testState.isRunning) {
      return;
    }
    
    this.testState.stateChanges.push({
      event,
      data,
      timestamp: Date.now(),
      timeSinceStart: Date.now() - this.testState.startTime
    });
    
    console.log(`State change recorded: ${event}`);
  }
  
  /**
   * Record WebSocket event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  recordWebSocketEvent(event, data) {
    if (!this.testState.isRunning) {
      return;
    }
    
    this.testState.webSocketEvents.push({
      event,
      data,
      timestamp: Date.now(),
      timeSinceStart: Date.now() - this.testState.startTime
    });
    
    console.log(`WebSocket event recorded: ${event}`);
  }
  
  /**
   * Get test results
   * @returns {Object} Test results
   */
  getTestResults() {
    return {
      stateChanges: this.testState.stateChanges,
      webSocketEvents: this.testState.webSocketEvents,
      isRunning: this.testState.isRunning,
      startTime: this.testState.startTime,
      duration: this.testState.isRunning ? Date.now() - this.testState.startTime : null
    };
  }
  
  /**
   * Clear test results
   */
  clearTestResults() {
    this.testState.stateChanges = [];
    this.testState.webSocketEvents = [];
    this.testState.startTime = null;
    
    return 'Test results cleared';
  }
  
  /**
   * Simulate a transaction add event
   * @param {Object} transaction - Transaction data
   */
  simulateTransactionAdd(transaction = null) {
    const mockTransaction = transaction || {
      _id: `test_${Date.now()}`,
      type: 'expense',
      category: 'food',
      amount: 25.99,
      description: 'Test transaction',
      date: new Date().toISOString()
    };
    
    console.log('Simulating transaction:added event', mockTransaction);
    
    // Simulate WebSocket event
    webSocketService.notifyHandlers('transaction:added', mockTransaction);
    
    return 'Transaction add event simulated';
  }
  
  /**
   * Simulate a transaction update event
   * @param {Object} transaction - Transaction data
   */
  simulateTransactionUpdate(transaction = null) {
    // Get a transaction from the store if none provided
    if (!transaction) {
      const transactions = store.getState().transactions;
      if (transactions.length === 0) {
        console.warn('No transactions available to update');
        return 'No transactions available to update';
      }
      
      transaction = { ...transactions[0] };
      transaction.amount = transaction.amount + 10;
      transaction.description = `Updated: ${transaction.description}`;
    }
    
    console.log('Simulating transaction:updated event', transaction);
    
    // Simulate WebSocket event
    webSocketService.notifyHandlers('transaction:updated', transaction);
    
    return 'Transaction update event simulated';
  }
  
  /**
   * Simulate a transaction delete event
   * @param {Object} transaction - Transaction data
   */
  simulateTransactionDelete(transaction = null) {
    // Get a transaction from the store if none provided
    if (!transaction) {
      const transactions = store.getState().transactions;
      if (transactions.length === 0) {
        console.warn('No transactions available to delete');
        return 'No transactions available to delete';
      }
      
      transaction = transactions[0];
    }
    
    console.log('Simulating transaction:deleted event', transaction);
    
    // Simulate WebSocket event
    webSocketService.notifyHandlers('transaction:deleted', transaction);
    
    return 'Transaction delete event simulated';
  }
  
  /**
   * Simulate a budget add event
   * @param {Object} budget - Budget data
   */
  simulateBudgetAdd(budget = null) {
    const mockBudget = budget || {
      _id: `test_${Date.now()}`,
      category: 'entertainment',
      limit: 100,
      current_spending: 0
    };
    
    console.log('Simulating budget:added event', mockBudget);
    
    // Simulate WebSocket event
    webSocketService.notifyHandlers('budget:added', mockBudget);
    
    return 'Budget add event simulated';
  }
  
  /**
   * Simulate a budget update event
   * @param {Object} budget - Budget data
   */
  simulateBudgetUpdate(budget = null) {
    // Get a budget from the store if none provided
    if (!budget) {
      const budgets = store.getState().budgets;
      if (budgets.length === 0) {
        console.warn('No budgets available to update');
        return 'No budgets available to update';
      }
      
      budget = { ...budgets[0] };
      budget.limit = budget.limit + 50;
    }
    
    console.log('Simulating budget:updated event', budget);
    
    // Simulate WebSocket event
    webSocketService.notifyHandlers('budget:updated', budget);
    
    return 'Budget update event simulated';
  }
  
  /**
   * Simulate a budget delete event
   * @param {Object} budget - Budget data
   */
  simulateBudgetDelete(budget = null) {
    // Get a budget from the store if none provided
    if (!budget) {
      const budgets = store.getState().budgets;
      if (budgets.length === 0) {
        console.warn('No budgets available to delete');
        return 'No budgets available to delete';
      }
      
      budget = budgets[0];
    }
    
    console.log('Simulating budget:deleted event', budget);
    
    // Simulate WebSocket event
    webSocketService.notifyHandlers('budget:deleted', budget);
    
    return 'Budget delete event simulated';
  }
  
  /**
   * Simulate a savings goal add event
   * @param {Object} savingsGoal - Savings goal data
   */
  simulateSavingsGoalAdd(savingsGoal = null) {
    const mockSavingsGoal = savingsGoal || {
      _id: `test_${Date.now()}`,
      name: 'Test Savings Goal',
      target_amount: 1000,
      current_amount: 0,
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    console.log('Simulating savingsGoal:added event', mockSavingsGoal);
    
    // Simulate WebSocket event
    webSocketService.notifyHandlers('savingsGoal:added', mockSavingsGoal);
    
    return 'Savings goal add event simulated';
  }
  
  /**
   * Simulate a savings goal update event
   * @param {Object} savingsGoal - Savings goal data
   */
  simulateSavingsGoalUpdate(savingsGoal = null) {
    // Get a savings goal from the store if none provided
    if (!savingsGoal) {
      const savingsGoals = store.getState().savingsGoals;
      if (savingsGoals.length === 0) {
        console.warn('No savings goals available to update');
        return 'No savings goals available to update';
      }
      
      savingsGoal = { ...savingsGoals[0] };
      savingsGoal.current_amount = savingsGoal.current_amount + 100;
    }
    
    console.log('Simulating savingsGoal:updated event', savingsGoal);
    
    // Simulate WebSocket event
    webSocketService.notifyHandlers('savingsGoal:updated', savingsGoal);
    
    return 'Savings goal update event simulated';
  }
  
  /**
   * Simulate a savings goal delete event
   * @param {Object} savingsGoal - Savings goal data
   */
  simulateSavingsGoalDelete(savingsGoal = null) {
    // Get a savings goal from the store if none provided
    if (!savingsGoal) {
      const savingsGoals = store.getState().savingsGoals;
      if (savingsGoals.length === 0) {
        console.warn('No savings goals available to delete');
        return 'No savings goals available to delete';
      }
      
      savingsGoal = savingsGoals[0];
    }
    
    console.log('Simulating savingsGoal:deleted event', savingsGoal);
    
    // Simulate WebSocket event
    webSocketService.notifyHandlers('savingsGoal:deleted', savingsGoal);
    
    return 'Savings goal delete event simulated';
  }
  
  /**
   * Test connection drop and reconnect
   */
  async testConnectionDropAndReconnect() {
    console.log('Testing connection drop and reconnect');
    
    // Start test monitoring
    this.startTest();
    
    // Disconnect WebSocket
    console.log('Disconnecting WebSocket...');
    webSocketService.disconnect();
    
    // Wait for 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reconnect WebSocket
    console.log('Reconnecting WebSocket...');
    await webSocketService.connect();
    
    // Wait for 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Stop test monitoring
    this.stopTest();
    
    // Get test results
    const results = this.getTestResults();
    
    // Log results
    console.log('Connection drop and reconnect test results:', results);
    
    return results;
  }
  
  /**
   * Test full real-time loop
   */
  async testFullRealTimeLoop() {
    console.log('Testing full real-time loop');
    
    // Start test monitoring
    this.startTest();
    
    // Simulate a transaction add event
    this.simulateTransactionAdd();
    
    // Wait for 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate a budget update event
    this.simulateBudgetUpdate();
    
    // Wait for 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate a savings goal add event
    this.simulateSavingsGoalAdd();
    
    // Wait for 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Stop test monitoring
    this.stopTest();
    
    // Get test results
    const results = this.getTestResults();
    
    // Log results
    console.log('Full real-time loop test results:', results);
    
    // Validate results
    const validation = this.validateFullRealTimeLoopResults(results);
    
    return {
      results,
      validation
    };
  }
  
  /**
   * Validate full real-time loop test results
   * @param {Object} results - Test results
   * @returns {Object} Validation results
   */
  validateFullRealTimeLoopResults(results) {
    const validation = {
      success: true,
      messages: []
    };
    
    // Check if WebSocket events were received
    if (results.webSocketEvents.length === 0) {
      validation.success = false;
      validation.messages.push('No WebSocket events were received');
    }
    
    // Check if state changes were recorded
    if (results.stateChanges.length === 0) {
      validation.success = false;
      validation.messages.push('No state changes were recorded');
    }
    
    // Check if WebSocket events match state changes
    const webSocketEventTypes = results.webSocketEvents.map(event => event.event);
    const stateChangeTypes = results.stateChanges.map(change => change.event);
    
    // Check for transaction events
    if (webSocketEventTypes.includes('transaction:added') && 
        !stateChangeTypes.includes('transactions:updated')) {
      validation.success = false;
      validation.messages.push('Transaction add event did not trigger state update');
    }
    
    // Check for budget events
    if (webSocketEventTypes.includes('budget:updated') && 
        !stateChangeTypes.includes('budgets:updated')) {
      validation.success = false;
      validation.messages.push('Budget update event did not trigger state update');
    }
    
    // Check for savings goal events
    if (webSocketEventTypes.includes('savingsGoal:added') && 
        !stateChangeTypes.includes('savingsGoals:updated')) {
      validation.success = false;
      validation.messages.push('Savings goal add event did not trigger state update');
    }
    
    // Add success message if all checks passed
    if (validation.success) {
      validation.messages.push('All real-time loop tests passed successfully');
    }
    
    return validation;
  }
}

// Create and export singleton instance
export const realTimeTestUtils = new RealTimeTestUtils();

// For backwards compatibility with non-module scripts
window.realTimeTestUtils = realTimeTestUtils;
