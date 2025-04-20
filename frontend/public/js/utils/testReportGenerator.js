/**
 * Test Report Generator for FinTrack
 * 
 * This utility generates comprehensive test reports for the real-time functionality
 * of the FinTrack application. It runs all tests and produces a formatted report
 * that can be used for documentation or demo purposes.
 */

import { realTimeTest } from './realTimeTest.js';
import { transactionDebugger } from './transactionDebugger.js';
import { webSocketService } from '../services/webSocketService.js';

class TestReportGenerator {
  constructor() {
    // Singleton pattern
    if (TestReportGenerator.instance) {
      return TestReportGenerator.instance;
    }
    
    TestReportGenerator.instance = this;
    
    // Report state
    this.report = {
      timestamp: new Date().toISOString(),
      environment: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        webSocketStatus: webSocketService.getStatus()
      },
      tests: {
        api: { status: 'pending', details: null },
        webSocket: { status: 'pending', details: null },
        store: { status: 'pending', details: null },
        ui: { status: 'pending', details: null },
        fullFlow: { status: 'pending', details: null },
        multiTab: { status: 'pending', details: null },
        authentication: { status: 'pending', details: null }
      },
      summary: {
        passed: 0,
        failed: 0,
        pending: 7,
        total: 7
      }
    };
    
    // Initialize
    this.initialize();
  }
  
  /**
   * Initialize the report generator
   */
  initialize() {
    console.log('Test Report Generator initialized');
    
    // Add report methods to window for easy access from console
    window.testReport = {
      generateReport: this.generateReport.bind(this),
      runAllTests: this.runAllTests.bind(this),
      getReport: this.getReport.bind(this),
      clearReport: this.clearReport.bind(this),
      exportReport: this.exportReport.bind(this),
      displayReport: this.displayReport.bind(this)
    };
  }
  
  /**
   * Run all tests and generate a report
   * @returns {Promise<Object>} Test report
   */
  async runAllTests() {
    console.log('Running all tests...');
    
    // Clear previous report
    this.clearReport();
    
    // Update environment info
    this.report.environment = {
      userAgent: navigator.userAgent,
      url: window.location.href,
      webSocketStatus: webSocketService.getStatus(),
      timestamp: new Date().toISOString()
    };
    
    try {
      // Test API
      console.log('Testing API...');
      const apiResult = await realTimeTest.testAPI();
      this.report.tests.api = {
        status: apiResult.success ? 'passed' : 'failed',
        details: apiResult
      };
      this.updateSummary();
      
      // Test WebSocket
      console.log('Testing WebSocket...');
      const wsResult = await realTimeTest.testWebSocket();
      this.report.tests.webSocket = {
        status: wsResult.success ? 'passed' : 'failed',
        details: wsResult
      };
      this.updateSummary();
      
      // Test Store
      console.log('Testing Store...');
      const storeResult = await realTimeTest.testStore();
      this.report.tests.store = {
        status: storeResult.success ? 'passed' : 'failed',
        details: storeResult
      };
      this.updateSummary();
      
      // Test UI
      console.log('Testing UI...');
      const uiResult = await realTimeTest.testUI();
      this.report.tests.ui = {
        status: uiResult.success ? 'passed' : 'failed',
        details: uiResult
      };
      this.updateSummary();
      
      // Test Full Flow
      console.log('Testing Full Flow...');
      const fullFlowResult = await realTimeTest.testFullFlow();
      this.report.tests.fullFlow = {
        status: fullFlowResult.success ? 'passed' : 'failed',
        details: fullFlowResult
      };
      this.updateSummary();
      
      // Test Authentication
      console.log('Testing Authentication...');
      const authResult = await this.testAuthentication();
      this.report.tests.authentication = {
        status: authResult.success ? 'passed' : 'failed',
        details: authResult
      };
      this.updateSummary();
      
      // Multi-Tab test can only be instructional
      this.report.tests.multiTab = {
        status: 'manual',
        details: {
          instructions: 'Open another tab with FinTrack and run realTimeTest.testMultiTab() to verify cross-tab updates'
        }
      };
      this.updateSummary();
      
      // Generate final report
      console.log('All tests completed');
      return this.getReport();
    } catch (error) {
      console.error('Error running tests:', error);
      return {
        error: error.message,
        report: this.report
      };
    }
  }
  
  /**
   * Update summary statistics
   */
  updateSummary() {
    const tests = this.report.tests;
    const statuses = Object.values(tests).map(test => test.status);
    
    this.report.summary = {
      passed: statuses.filter(status => status === 'passed').length,
      failed: statuses.filter(status => status === 'failed').length,
      pending: statuses.filter(status => status === 'pending').length,
      manual: statuses.filter(status => status === 'manual').length,
      total: Object.keys(tests).length
    };
  }
  
  /**
   * Test authentication
   * @returns {Promise<Object>} Authentication test result
   */
  async testAuthentication() {
    try {
      // Check if token exists
      const token = localStorage.getItem('token');
      if (!token) {
        return {
          success: false,
          error: 'No authentication token found'
        };
      }
      
      // Try to make an authenticated API call
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status === 401 || response.status === 403) {
        return {
          success: false,
          error: `Authentication failed with status ${response.status}`
        };
      }
      
      return {
        success: true,
        user: await response.json().catch(() => ({}))
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Generate a formatted test report
   * @returns {Object} Formatted test report
   */
  generateReport() {
    // Update summary
    this.updateSummary();
    
    // Format report
    const formattedReport = {
      title: 'FinTrack Real-Time Functionality Test Report',
      timestamp: new Date().toLocaleString(),
      summary: {
        ...this.report.summary,
        overallStatus: this.report.summary.failed > 0 ? 'FAILED' : 'PASSED'
      },
      environment: this.report.environment,
      testResults: Object.entries(this.report.tests).map(([name, test]) => ({
        name,
        status: test.status,
        details: test.details
      })),
      recommendations: this.generateRecommendations()
    };
    
    return formattedReport;
  }
  
  /**
   * Generate recommendations based on test results
   * @returns {Array<string>} List of recommendations
   */
  generateRecommendations() {
    const recommendations = [];
    const tests = this.report.tests;
    
    // API recommendations
    if (tests.api.status === 'failed') {
      recommendations.push('Check API endpoint configuration and authentication');
      recommendations.push('Verify MongoDB connection and transaction schema');
    }
    
    // WebSocket recommendations
    if (tests.webSocket.status === 'failed') {
      recommendations.push('Ensure WebSocket server is running and accessible');
      recommendations.push('Verify WebSocket event names match between backend and frontend');
    }
    
    // Store recommendations
    if (tests.store.status === 'failed') {
      recommendations.push('Check store subscription and dispatch mechanisms');
      recommendations.push('Verify WebSocket-Store sync service is properly initialized');
    }
    
    // UI recommendations
    if (tests.ui.status === 'failed') {
      recommendations.push('Ensure UI components are subscribed to store changes');
      recommendations.push('Check that components re-render when state changes');
    }
    
    // Authentication recommendations
    if (tests.authentication.status === 'failed') {
      recommendations.push('Verify JWT token is being stored and attached to API requests');
      recommendations.push('Check token expiration and refresh mechanisms');
    }
    
    // General recommendations
    recommendations.push('Consider implementing offline mode for better user experience');
    recommendations.push('Add visual indicators for real-time updates');
    recommendations.push('Extend real-time functionality to budgets and savings goals');
    
    return recommendations;
  }
  
  /**
   * Get current test report
   * @returns {Object} Test report
   */
  getReport() {
    return this.generateReport();
  }
  
  /**
   * Clear test report
   */
  clearReport() {
    this.report = {
      timestamp: new Date().toISOString(),
      environment: {
        userAgent: navigator.userAgent,
        url: window.location.href,
        webSocketStatus: webSocketService.getStatus()
      },
      tests: {
        api: { status: 'pending', details: null },
        webSocket: { status: 'pending', details: null },
        store: { status: 'pending', details: null },
        ui: { status: 'pending', details: null },
        fullFlow: { status: 'pending', details: null },
        multiTab: { status: 'pending', details: null },
        authentication: { status: 'pending', details: null }
      },
      summary: {
        passed: 0,
        failed: 0,
        pending: 7,
        total: 7
      }
    };
    
    return 'Test report cleared';
  }
  
  /**
   * Export report as JSON
   * @returns {string} JSON string
   */
  exportReport() {
    const report = this.generateReport();
    const jsonString = JSON.stringify(report, null, 2);
    
    // Create a download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fintrack-test-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return 'Report exported as JSON';
  }
  
  /**
   * Display report in the UI
   */
  displayReport() {
    const report = this.generateReport();
    
    // Create report container
    const container = document.createElement('div');
    container.id = 'test-report-container';
    container.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto';
    
    // Create report content
    const content = document.createElement('div');
    content.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-auto';
    
    // Create report header
    const header = document.createElement('div');
    header.className = 'flex justify-between items-center mb-6';
    header.innerHTML = `
      <h2 class="text-2xl font-bold">${report.title}</h2>
      <div class="flex space-x-2">
        <button id="export-report-btn" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Export</button>
        <button id="close-report-btn" class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Close</button>
      </div>
    `;
    
    // Create summary section
    const summary = document.createElement('div');
    summary.className = 'mb-6 p-4 rounded border';
    summary.innerHTML = `
      <h3 class="text-xl font-semibold mb-2">Summary</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div class="p-3 bg-green-100 dark:bg-green-900 rounded">
          <div class="text-2xl font-bold">${report.summary.passed}</div>
          <div class="text-sm">Passed</div>
        </div>
        <div class="p-3 bg-red-100 dark:bg-red-900 rounded">
          <div class="text-2xl font-bold">${report.summary.failed}</div>
          <div class="text-sm">Failed</div>
        </div>
        <div class="p-3 bg-yellow-100 dark:bg-yellow-900 rounded">
          <div class="text-2xl font-bold">${report.summary.pending}</div>
          <div class="text-sm">Pending</div>
        </div>
        <div class="p-3 bg-blue-100 dark:bg-blue-900 rounded">
          <div class="text-2xl font-bold">${report.summary.total}</div>
          <div class="text-sm">Total</div>
        </div>
      </div>
      <div class="text-center p-2 rounded ${report.summary.overallStatus === 'PASSED' ? 'bg-green-500' : 'bg-red-500'} text-white font-bold">
        Overall Status: ${report.summary.overallStatus}
      </div>
    `;
    
    // Create test results section
    const results = document.createElement('div');
    results.className = 'mb-6';
    results.innerHTML = `
      <h3 class="text-xl font-semibold mb-2">Test Results</h3>
      <div class="overflow-x-auto">
        <table class="w-full border-collapse">
          <thead>
            <tr class="bg-gray-100 dark:bg-gray-700">
              <th class="p-2 text-left border">Test</th>
              <th class="p-2 text-left border">Status</th>
              <th class="p-2 text-left border">Details</th>
            </tr>
          </thead>
          <tbody>
            ${report.testResults.map(test => `
              <tr>
                <td class="p-2 border font-medium">${test.name}</td>
                <td class="p-2 border">
                  <span class="px-2 py-1 rounded ${
                    test.status === 'passed' ? 'bg-green-500' : 
                    test.status === 'failed' ? 'bg-red-500' : 
                    test.status === 'manual' ? 'bg-blue-500' : 'bg-yellow-500'
                  } text-white">${test.status}</span>
                </td>
                <td class="p-2 border text-sm">
                  ${test.status === 'manual' ? 
                    test.details.instructions : 
                    test.details ? 
                      (test.details.error ? 
                        `Error: ${test.details.error}` : 
                        'Test completed successfully') : 
                      'No details available'}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    
    // Create recommendations section
    const recommendations = document.createElement('div');
    recommendations.className = 'mb-6';
    recommendations.innerHTML = `
      <h3 class="text-xl font-semibold mb-2">Recommendations</h3>
      <ul class="list-disc pl-5 space-y-1">
        ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
      </ul>
    `;
    
    // Create environment section
    const environment = document.createElement('div');
    environment.className = 'mb-6';
    environment.innerHTML = `
      <h3 class="text-xl font-semibold mb-2">Environment</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-2 border rounded">
          <div class="font-medium">WebSocket Status</div>
          <div>${report.environment.webSocketStatus}</div>
        </div>
        <div class="p-2 border rounded">
          <div class="font-medium">Timestamp</div>
          <div>${report.timestamp}</div>
        </div>
        <div class="p-2 border rounded md:col-span-2">
          <div class="font-medium">URL</div>
          <div>${report.environment.url}</div>
        </div>
      </div>
    `;
    
    // Assemble report
    content.appendChild(header);
    content.appendChild(summary);
    content.appendChild(results);
    content.appendChild(recommendations);
    content.appendChild(environment);
    container.appendChild(content);
    
    // Add to document
    document.body.appendChild(container);
    
    // Add event listeners
    document.getElementById('export-report-btn').addEventListener('click', () => {
      this.exportReport();
    });
    
    document.getElementById('close-report-btn').addEventListener('click', () => {
      document.body.removeChild(container);
    });
    
    return 'Report displayed in UI';
  }
}

// Create and export singleton instance
export const testReportGenerator = new TestReportGenerator();

// For backwards compatibility with non-module scripts
window.testReportGenerator = testReportGenerator;
