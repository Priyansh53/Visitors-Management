// utils.js - Utility functions and helpers
class DateManager {
    static setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('fromDate').value = today;
        document.getElementById('toDate').value = today;
    }
}

class ToastManager {
    static show(message, isError = false) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = isError ? 'toast error' : 'toast';
        toast.style.display = 'block';

        setTimeout(() => {
            toast.style.display = 'none';
        }, 3000);
    }
}

class ModalManager {
    static open(modalId) {
        document.getElementById(modalId).style.display = 'flex';
    }

    static close(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }
}

class AutoCheckoutManager {
    static initialize() {
        this.autoCheckOut();
    }

    static autoCheckOut() {
        const now = new Date();
        const currentDate = now.toISOString().split('T')[0];

        let visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
        let updated = false;

        visitors.forEach(visitor => {
            if (visitor.status === 'active' && visitor.date < currentDate) {
                const endOfDay = new Date(visitor.date + 'T23:59:59');
                visitor.checkOutTime = endOfDay.toISOString();
                visitor.status = 'completed';
                updated = true;
            }
        });

        if (updated) {
            localStorage.setItem('visitors', JSON.stringify(visitors));
            VisitorManager.loadVisitors();
            StatsManager.updateStats();
        }
    }
}

class EventManager {
    static initializeEventListeners() {
        // Form submission
        document.getElementById('visitorForm').addEventListener('submit', function(e) {
            e.preventDefault();

            const editId = document.getElementById('editId').value;

            if (!photoData && !editId) {
                showToast("Please capture a photo before submitting", true);
                return;
            }

            if (editId) {
                VisitorManager.updateVisitor(editId);
            } else {
                VisitorManager.registerVisitor();
            }
        });

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                FilterManager.searchVisitors(e.target.value);
            });
        }
    }
}