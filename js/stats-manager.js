// stats-manager.js - Handles statistics and reporting
class StatsManager {
    static updateStats() {
        const visitors = allVisitors;
        const today = new Date().toISOString().split('T')[0];

        document.getElementById('totalVisitors').textContent = visitors.length;

        const todayVisitors = visitors.filter(v => v.date === today).length;
        document.getElementById('todayVisitors').textContent = todayVisitors;

        const activeVisitors = visitors.filter(v => v.status === 'active').length;
        document.getElementById('activeVisitors').textContent = activeVisitors;
    }
}