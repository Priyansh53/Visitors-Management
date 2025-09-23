// app.js - Main Application Controller
let stream = null;
let photoData = null;
let allVisitors = [];
let displayedVisitors = [];
let currentGatePassVisitor = null;
const companyLogoUrl = './logo.png';
let currentPage = 1;
const visitorsPerPage = 10;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    VisitorManager.loadVisitors();
    StatsManager.updateStats();
    DateManager.setDefaultDate();
    EventManager.initializeEventListeners();
    AutoCheckoutManager.initialize();
});

// Global utility functions
function showToast(message, isError = false) {
    ToastManager.show(message, isError);
}

function openModal(modalId) {
    ModalManager.open(modalId);
}

function closeModal(modalId) {
    ModalManager.close(modalId);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'p':
                e.preventDefault();
                PDFManager.generatePDF();
                break;
            case 'f':
                e.preventDefault();
                FilterManager.filterVisitors();
                break;
            case 'r':
                e.preventDefault();
                FilterManager.resetFilters();
                break;
        }
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});