// TransactionService to manage transactions state across pages
class TransactionService {
    constructor() {
        this.transactions = JSON.parse(localStorage.getItem('transactions')) || [];
        this.subscribers = [];
    }

    // Subscribe to transaction updates
    subscribe(callback) {
        this.subscribers.push(callback);
        callback(this.transactions); // Initial call with current data
    }

    // Notify all subscribers of changes
    notifySubscribers() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
        this.subscribers.forEach(callback => callback(this.transactions));
    }

    // Add new transaction
    addTransaction(transaction) {
        this.transactions.unshift({
            id: Date.now(), // Use timestamp as unique ID
            ...transaction,
            date: transaction.date || new Date().toISOString().split('T')[0]
        });
        this.notifySubscribers();
    }

    // Delete transaction
    deleteTransaction(id) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.notifySubscribers();
    }

    // Edit transaction
    editTransaction(id, updatedTransaction) {
        this.transactions = this.transactions.map(t => 
            t.id === id ? { ...t, ...updatedTransaction } : t
        );
        this.notifySubscribers();
    }

    // Get transaction by ID
    getTransaction(id) {
        return this.transactions.find(t => t.id === id);
    }

    // Get all transactions
    getAllTransactions() {
        return this.transactions;
    }

    // Calculate total balance
    getTotalBalance() {
        return this.transactions.reduce((sum, t) => sum + t.amount, 0);
    }

    // Get spending by category
    getSpendingByCategory() {
        return this.transactions
            .filter(t => t.amount < 0)
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
                return acc;
            }, {});
    }
}

// Create global instance
window.transactionService = new TransactionService();
