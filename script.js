// ToDo List Application with Local Storage
class TodoApp {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.editingTaskId = null;
        this.init();
    }

    // Initialize the application
    init() {
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
        this.updateEmptyState();
    }

    // Bind all event listeners
    bindEvents() {
        // Add task
        document.getElementById('addBtn').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.setFilter(e.target.dataset.filter));
        });

        // Bulk actions
        document.getElementById('clearCompleted').addEventListener('click', () => {
            this.showConfirmModal('Are you sure you want to clear all completed tasks?', () => {
                this.clearCompleted();
            });
        });

        document.getElementById('clearAll').addEventListener('click', () => {
            this.showConfirmModal('Are you sure you want to clear ALL tasks? This action cannot be undone.', () => {
                this.clearAllTasks();
            });
        });

        // Modal events
        this.bindModalEvents();
    }

    // Bind modal event listeners
    bindModalEvents() {
        // Edit modal
        const editModal = document.getElementById('editModal');
        const confirmModal = document.getElementById('confirmModal');

        // Close modals
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                editModal.style.display = 'none';
                confirmModal.style.display = 'none';
            });
        });

        // Edit modal buttons
        document.getElementById('cancelEdit').addEventListener('click', () => {
            editModal.style.display = 'none';
        });

        document.getElementById('saveEdit').addEventListener('click', () => {
            this.saveEditTask();
        });

        document.getElementById('editTaskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveEditTask();
        });

        // Confirm modal buttons
        document.getElementById('cancelConfirm').addEventListener('click', () => {
            confirmModal.style.display = 'none';
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === editModal) editModal.style.display = 'none';
            if (e.target === confirmModal) confirmModal.style.display = 'none';
        });
    }

    // Load tasks from localStorage
    loadTasks() {
        try {
            const tasks = localStorage.getItem('todoTasks');
            return tasks ? JSON.parse(tasks) : [];
        } catch (error) {
            console.error('Error loading tasks from localStorage:', error);
            return [];
        }
    }

    // Save tasks to localStorage
    saveTasks() {
        try {
            localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving tasks to localStorage:', error);
            this.showNotification('Error saving tasks!', 'error');
        }
    }

    // Generate unique ID for tasks
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Add new task
    addTask() {
        const input = document.getElementById('taskInput');
        const text = input.value.trim();

        if (!text) {
            this.showNotification('Please enter a task!', 'warning');
            input.focus();
            return;
        }

        if (text.length > 200) {
            this.showNotification('Task is too long! Maximum 200 characters.', 'warning');
            return;
        }

        const newTask = {
            id: this.generateId(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.tasks.unshift(newTask); // Add to beginning for better UX
        this.saveTasks();
        input.value = '';
        input.focus();

        this.renderTasks();
        this.updateStats();
        this.updateEmptyState();
        this.showNotification('Task added successfully!', 'success');
    }

    // Toggle task completion
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.updatedAt = new Date().toISOString();
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            
            const message = task.completed ? 'Task completed!' : 'Task marked as pending!';
            this.showNotification(message, 'success');
        }
    }

    // Show edit modal
    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            this.editingTaskId = id;
            const editInput = document.getElementById('editTaskInput');
            editInput.value = task.text;
            document.getElementById('editModal').style.display = 'block';
            editInput.focus();
            editInput.select();
        }
    }

    // Save edited task
    saveEditTask() {
        const editInput = document.getElementById('editTaskInput');
        const text = editInput.value.trim();

        if (!text) {
            this.showNotification('Task cannot be empty!', 'warning');
            editInput.focus();
            return;
        }

        if (text.length > 200) {
            this.showNotification('Task is too long! Maximum 200 characters.', 'warning');
            return;
        }

        const task = this.tasks.find(t => t.id === this.editingTaskId);
        if (task) {
            task.text = text;
            task.updatedAt = new Date().toISOString();
            this.saveTasks();
            this.renderTasks();
            document.getElementById('editModal').style.display = 'none';
            this.showNotification('Task updated successfully!', 'success');
        }
    }

    // Delete task with confirmation
    deleteTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            this.showConfirmModal(`Are you sure you want to delete "${task.text}"?`, () => {
                this.tasks = this.tasks.filter(t => t.id !== id);
                this.saveTasks();
                this.renderTasks();
                this.updateStats();
                this.updateEmptyState();
                this.showNotification('Task deleted successfully!', 'success');
            });
        }
    }

    // Set filter
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update filter button styles
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderTasks();
    }

    // Get filtered tasks
    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            default:
                return this.tasks;
        }
    }

    // Render tasks
    renderTasks() {
        const taskList = document.getElementById('taskList');
        const filteredTasks = this.getFilteredTasks();

        taskList.innerHTML = '';

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                       onchange="todoApp.toggleTask('${task.id}')">
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <div class="task-actions">
                    <button class="action-btn edit-btn" onclick="todoApp.editTask('${task.id}')" 
                            title="Edit task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="todoApp.deleteTask('${task.id}')" 
                            title="Delete task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            taskList.appendChild(li);
        });

        this.updateEmptyState();
    }

    // Update statistics
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const pending = total - completed;

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('pendingTasks').textContent = pending;
    }

    // Update empty state visibility
    updateEmptyState() {
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();
        
        if (filteredTasks.length === 0) {
            emptyState.classList.remove('hidden');
            
            // Update empty state message based on filter
            const icon = emptyState.querySelector('i');
            const title = emptyState.querySelector('h3');
            const description = emptyState.querySelector('p');
            
            switch (this.currentFilter) {
                case 'completed':
                    icon.className = 'fas fa-check-circle';
                    title.textContent = 'No completed tasks!';
                    description.textContent = 'Complete some tasks to see them here';
                    break;
                case 'pending':
                    icon.className = 'fas fa-clock';
                    title.textContent = 'No pending tasks!';
                    description.textContent = 'All tasks are completed! Great job!';
                    break;
                default:
                    icon.className = 'fas fa-clipboard-list';
                    title.textContent = 'No tasks yet!';
                    description.textContent = 'Add your first task to get started';
                    break;
            }
        } else {
            emptyState.classList.add('hidden');
        }
    }

    // Clear completed tasks
    clearCompleted() {
        const completedCount = this.tasks.filter(task => task.completed).length;
        this.tasks = this.tasks.filter(task => !task.completed);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.updateEmptyState();
        this.showNotification(`${completedCount} completed tasks cleared!`, 'success');
    }

    // Clear all tasks
    clearAllTasks() {
        const taskCount = this.tasks.length;
        this.tasks = [];
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.updateEmptyState();
        this.showNotification(`${taskCount} tasks cleared!`, 'success');
    }

    // Show confirmation modal
    showConfirmModal(message, onConfirm) {
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmModal').style.display = 'block';
        
        // Remove any existing event listeners and add new one
        const confirmBtn = document.getElementById('confirmAction');
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        newConfirmBtn.addEventListener('click', () => {
            onConfirm();
            document.getElementById('confirmModal').style.display = 'none';
        });
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notification if any
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 1001;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;

        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 3000);
    }

    // Get notification icon based on type
    getNotificationIcon(type) {
        switch (type) {
            case 'success': return 'fa-check-circle';
            case 'error': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            default: return 'fa-info-circle';
        }
    }

    // Get notification color based on type
    getNotificationColor(type) {
        switch (type) {
            case 'success': return '#28a745';
            case 'error': return '#dc3545';
            case 'warning': return '#ffc107';
            default: return '#17a2b8';
        }
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Export tasks to JSON
    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `todo-tasks-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        this.showNotification('Tasks exported successfully!', 'success');
    }

    // Import tasks from JSON file
    importTasks(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedTasks = JSON.parse(e.target.result);
                if (Array.isArray(importedTasks)) {
                    this.tasks = [...this.tasks, ...importedTasks];
                    this.saveTasks();
                    this.renderTasks();
                    this.updateStats();
                    this.updateEmptyState();
                    this.showNotification(`${importedTasks.length} tasks imported!`, 'success');
                } else {
                    throw new Error('Invalid file format');
                }
            } catch (error) {
                this.showNotification('Error importing tasks! Please check the file format.', 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Add notification animations to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
    }
`;
document.head.appendChild(style);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + N to focus on new task input
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            document.getElementById('taskInput').focus();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            document.getElementById('editModal').style.display = 'none';
            document.getElementById('confirmModal').style.display = 'none';
        }
    });
});

// Service Worker registration for offline support (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
