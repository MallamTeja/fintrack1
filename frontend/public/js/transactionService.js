// TransactionService to manage transactions state across pages
class TransactionService {
    constructor() {
        this.transactions = [];
        this.subscribers = [];
        this.apiUrl = '/api/transactions'; // Adjust if your API endpoint is different
        this.token = localStorage.getItem('token');
        
        // Load initial data
        this.fetchTransactions();
        
        // Set up WebSocket connection for real-time updates if available
        this.setupWebSocketConnection();
    }
    
    // Set up WebSocket connection if the service is available
    setupWebSocketConnection() {
        if (window.websocketService) {
            window.websocketService.subscribe('transaction_update', () => {
                this.fetchTransactions();
            });
        }
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
            // Fallback to localStorage if API fails
            this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
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
                body: JSON.stringify({
                    ...transaction,
                    date: transaction.date || new Date().toISOString().split('T')[0]
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to add transaction');
            }
            
            const newTransaction = await response.json();
            this.transactions.unshift(newTransaction);
            this.notifySubscribers();
            
            // Backup to localStorage
            localStorage.setItem('transactions', JSON.stringify(this.transactions));
            
            return newTransaction;
        } catch (error) {
            console.error('Error adding transaction:', error);
            
            // Fallback to local storage if API fails
            const fallbackTransaction = {
                id: Date.now(),
                ...transaction,
                date: transaction.date || new Date().toISOString().split('T')[0]
            };
            
            this.transactions.unshift(fallbackTransaction);
            localStorage.setItem('transactions', JSON.stringify(this.transactions));
            this.notifySubscribers();
            
            return fallbackTransaction;
        }
    }

    // Delete transaction
    async deleteTransaction(id) {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete transaction');
            }
            
            this.transactions = this.transactions.filter(t => t._id !== id && t.id !== id);
            localStorage.setItem('transactions', JSON.stringify(this.transactions));
            this.notifySubscribers();
        } catch (error) {
            console.error('Error deleting transaction:', error);
            
            // Fallback to local operation if API fails
            this.transactions = this.transactions.filter(t => t._id !== id && t.id !== id);
            localStorage.setItem('transactions', JSON.stringify(this.transactions));
            this.notifySubscribers();
        }
    }

    // Edit transaction
    async editTransaction(id, updatedTransaction) {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedTransaction)
            });
            
            if (!response.ok) {
                throw new Error('Failed to update transaction');
            }
            
            const updated = await response.json();
            this.transactions = this.transactions.map(t => 
                (t._id === id || t.id === id) ? { ...t, ...updated } : t
            );
            
            localStorage.setItem('transactions', JSON.stringify(this.transactions));
            this.notifySubscribers();
        } catch (error) {
            console.error('Error updating transaction:', error);
            
            // Fallback to local operation if API fails
            this.transactions = this.transactions.map(t => 
                (t._id === id || t.id === id) ? { ...t, ...updatedTransaction } : t
            );
            localStorage.setItem('transactions', JSON.stringify(this.transactions));
            this.notifySubscribers();
        }
    }

    // Get transaction by ID
    getTransaction(id) {
        return this.transactions.find(t => t._id === id || t.id === id);
    }

    // Get all transactions
    getAllTransactions() {
        return this.transactions;
    }

    // Calculate total balance
    getTotalBalance() {
        return this.transactions.reduce((sum, t) => {
            const amount = parseFloat(t.amount);
            return t.type === 'income' ? sum + amount : sum - amount;
        }, 0);
    }

    // Get spending by category
    getSpendingByCategory() {
        return this.transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                const amount = parseFloat(t.amount);
                acc[t.category] = (acc[t.category] || 0) + amount;
                return acc;
            }, {});
    }
}

// Create global instance
window.transactionService = new TransactionService();
