// export-manager.js - Handles data export functionality
class ExportManager {
    static exportToCSV() {
        const visitors = allVisitors;
        if (visitors.length === 0) {
            showToast("No data to export", true);
            return;
        }

        const headers = ['Name', 'Company', 'Phone', 'Email', 'Purpose', 'Host', 'Department', 'Check In', 'Check Out', 'Status'];
        const csvContent = [
            headers.join(','),
            ...visitors.map(visitor => [
                `"${visitor.name}"`,
                `"${visitor.company || ''}"`,
                `"${visitor.phone}"`,
                `"${visitor.email || ''}"`,
                `"${visitor.purpose}"`,
                `"${visitor.toMeet}"`,
                `"${visitor.department || ''}"`,
                `"${new Date(visitor.checkInTime).toLocaleString()}"`,
                visitor.checkOutTime ? `"${new Date(visitor.checkOutTime).toLocaleString()}"` : '"Still inside"',
                `"${visitor.status}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `visitors-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        showToast('Data exported to CSV successfully!');
    }
}