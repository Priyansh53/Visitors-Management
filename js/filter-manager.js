// filter-manager.js - Handles filtering and search functionality
class FilterManager {
    static filterVisitors() {
        const fromDate = document.getElementById('fromDate').value;
        const toDate = document.getElementById('toDate').value;
        const purposeFilter = document.getElementById('purposeFilter').value;

        let filteredVisitors = [...allVisitors];

        if (fromDate && toDate) {
            filteredVisitors = filteredVisitors.filter(v => {
                return v.date >= fromDate && v.date <= toDate;
            });
        }

        if (purposeFilter) {
            filteredVisitors = filteredVisitors.filter(v => v.purpose === purposeFilter);
        }

        displayedVisitors = filteredVisitors;
        currentPage = 1;
        DisplayManager.displayVisitors(displayedVisitors);
        showToast(`Found ${filteredVisitors.length} visitors matching criteria`);
    }

    static resetFilters() {
        document.getElementById('fromDate').value = '';
        document.getElementById('toDate').value = '';
        document.getElementById('purposeFilter').value = '';
        displayedVisitors = allVisitors;
        currentPage = 1;
        DisplayManager.displayVisitors(displayedVisitors);
        showToast('Filters reset');
    }

    static searchVisitors(query) {
        const filteredVisitors = allVisitors.filter(visitor =>
            visitor.name.toLowerCase().includes(query.toLowerCase()) ||
            visitor.company.toLowerCase().includes(query.toLowerCase()) ||
            visitor.phone.includes(query) ||
            visitor.toMeet.toLowerCase().includes(query.toLowerCase()) ||
            visitor.purpose.toLowerCase().includes(query.toLowerCase())
        );
        displayedVisitors = filteredVisitors;
        currentPage = 1;
        DisplayManager.displayVisitors(displayedVisitors);
    }
}