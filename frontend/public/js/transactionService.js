// TransactionService to manage transactions state across pages
class TransactionService {
    constructor() {
        this.transactions = [];
        this.subscribers = [];
        this.apiUrl = '/api/transactions'; // API endpoint
        this.token = localStorage.getItem('token');
        
        // Load initial data
        this.fetchTransactions();
    }
    
    // Subscribe to transaction updates
    subscribe(callback) {
        this.subscribers.push(callback);
        callback(this.transactions); // Initial call with current data
    }

    // Notify all subscribers of changes
    notifySubscribers() {
        this.subscribers.forEach(callback => callback(this.transactions));
    }
    
    // Fetch transactions from the API
    async fetchTransactions() {
        try {
            const response = await fetch(this.apiUrl, {
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch transactions');
            }
            
            this.transactions = await response.json();
            this.notifySubscribers();
        } catch (error) {
            console.error('Error fetching transactions:', error);
            this.transactions = [];
            this.notifySubscribers();
        }
    }

    // Add new transaction
    async addTransaction(transaction) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(transaction)
            });
            
            if (!response.ok) {
                throw new Error('Failed to add transaction');
            }
            
            const newTransaction = await response.json();
            this.transactions.unshift(newTransaction);
            this.notifySubscribers();
            
            return newTransaction;
        } catch (error) {
            console.error('Error adding transaction:', error);
            return null;
        }
    }
}

// Create global instance
window.transactionService = new TransactionService();
