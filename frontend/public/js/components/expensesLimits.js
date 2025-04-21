import { store } from '../state/index.js';

class ExpensesLimits {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.noLimitsMessage = document.getElementById('noLimitsMessage');
    this.limitModal = document.getElementById('limitModal');
    this.limitForm = document.getElementById('limitForm');
    this.cancelButton = document.getElementById('cancelButton');
    this.limitIdField = document.getElementById('limitId');
    this.categorySelect = document.getElementById('category');
    this.otherCategoryField = document.getElementById('otherCategoryField');

    this.init();
  }

  init() {
    // Subscribe to budget updates
    store.subscribe('budgets:updated', this.render.bind(this));
    // Fetch budgets
    store.dispatch('budgets:fetch');

    // Form handlers
    this.limitForm.addEventListener('submit', this.handleFormSubmit.bind(this));
    this.cancelButton.addEventListener('click', () => this.hideModal());
    this.categorySelect.addEventListener('change', this.handleCategoryChange.bind(this));

    // Add Limit button
    const addBtn = document.getElementById('addLimitButton');
    if (addBtn) addBtn.addEventListener('click', () => this.openAddModal());
  }

  render(budgets) {
    this.container.innerHTML = '';
    if (!budgets || budgets.length === 0) {
      this.noLimitsMessage.classList.remove('hidden');
      return;
    }
    this.noLimitsMessage.classList.add('hidden');
    budgets.forEach(b => this.createCard(b));
  }

  createCard(budget) {
    const card = document.createElement('div');
    card.className = 'limit-card';
    const limit = budget.limit;
    const spent = budget.current_spending || 0;
    const perc = Math.min((spent / limit) * 100, 100);
    card.innerHTML = `
      <h4 class="text-lg font-semibold">${this.formatCategory(budget.category)}</h4>
      <p>Limit: ₹${limit}</p>
      <p>Spent: ₹${spent}</p>
      <div class="progress-bar my-2">
        <div class="progress-fill" style="width:${perc}%; background:var(--primary)"></div>
      </div>
      <div class="flex gap-2 mt-2">
        <button class="edit-btn text-sm text-blue-500" data-id="${budget._id}">Edit</button>
        <button class="delete-btn text-sm text-red-500" data-id="${budget._id}">Delete</button>
      </div>
    `;
    card.querySelector('.edit-btn').addEventListener('click', () => this.openEditModal(budget));
    card.querySelector('.delete-btn').addEventListener('click', () => {
      if (confirm('Delete this expense limit?')) store.dispatch('budget:delete', budget._id);
    });
    this.container.appendChild(card);
  }

  formatCategory(cat) {
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  }

  handleCategoryChange(e) {
    if (e.target.value === 'other') this.otherCategoryField.classList.remove('hidden');
    else this.otherCategoryField.classList.add('hidden');
  }

  openAddModal() {
    this.limitForm.reset();
    this.limitIdField.value = '';
    document.getElementById('modalTitle').textContent = 'Add New Expense Limit';
    this.otherCategoryField.classList.add('hidden');
    this.limitModal.classList.remove('hidden');
  }

  openEditModal(budget) {
    this.limitForm.reset();
    this.limitIdField.value = budget._id;
    document.getElementById('modalTitle').textContent = 'Edit Expense Limit';

    if (this.categorySelect.querySelector(`option[value="${budget.category}"]`)) {
      this.categorySelect.value = budget.category;
      this.otherCategoryField.classList.add('hidden');
    } else {
      this.categorySelect.value = 'other';
      this.otherCategoryField.classList.remove('hidden');
      document.getElementById('customCategory').value = budget.category;
    }
    document.getElementById('amount').value = budget.limit;
    this.limitModal.classList.remove('hidden');
  }

  hideModal() {
    this.limitModal.classList.add('hidden');
  }

  handleFormSubmit(e) {
    e.preventDefault();
    let category = this.categorySelect.value;
    if (category === 'other') category = document.getElementById('customCategory').value.trim();
    const limitVal = parseFloat(document.getElementById('amount').value);
    if (!category || isNaN(limitVal) || limitVal <= 0) {
      alert('Please provide a valid category and limit amount.');
      return;
    }
    const id = this.limitIdField.value;
    if (id) {
      store.dispatch('budget:update', { id, data: { limit: limitVal } });
    } else {
      store.dispatch('budget:add', { category, limit: limitVal });
    }
    this.hideModal();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new ExpensesLimits('limitsContainer');
});
