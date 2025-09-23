// display-manager.js - Handles UI display and pagination
class DisplayManager {
    static displayVisitors(visitors) {
        const tbody = document.getElementById('visitorList');
        const emptyState = document.getElementById('emptyState');
        const pagination = document.getElementById('pagination');
        const table = document.getElementById('visitorTable');

        if (visitors.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            table.style.display = 'none';
            pagination.style.display = 'none';
            return;
        }

        emptyState.style.display = 'none';
        table.style.display = 'table';
        pagination.style.display = 'flex';
        tbody.innerHTML = '';

        const totalPages = Math.ceil(visitors.length / visitorsPerPage);
        const startIndex = (currentPage - 1) * visitorsPerPage;
        const endIndex = Math.min(startIndex + visitorsPerPage, visitors.length);
        const paginatedVisitors = visitors.slice(startIndex, endIndex);

        paginatedVisitors.forEach(visitor => {
            const row = tbody.insertRow();

            DisplayManager.createPhotoCell(row, visitor);
            DisplayManager.createTextCell(row, visitor.name, true);
            DisplayManager.createTextCell(row, visitor.company || 'N/A');
            DisplayManager.createTextCell(row, visitor.phone);
            DisplayManager.createTextCell(row, visitor.purpose);
            DisplayManager.createTextCell(row, visitor.toMeet);
            DisplayManager.createCheckInCell(row, visitor);
            DisplayManager.createCheckOutCell(row, visitor);
            DisplayManager.createStatusCell(row, visitor);
            DisplayManager.createActionsCell(row, visitor);
        });

        document.getElementById('pageInfo').textContent = `${currentPage} of ${totalPages}`;
    }

    static createPhotoCell(row, visitor) {
        const photoCell = row.insertCell();
        photoCell.className = 'photo-cell';
        if (visitor.photo) {
            const img = document.createElement('img');
            img.src = visitor.photo;
            photoCell.appendChild(img);
        } else {
            photoCell.innerHTML = '<i class="fas fa-user-circle" style="font-size: 2rem; color: #ccc;"></i>';
        }
    }

    static createTextCell(row, text, bold = false) {
        const cell = row.insertCell();
        cell.textContent = text;
        if (bold) {
            cell.innerHTML = `<strong>${text}</strong>`;
        }
    }

    static createCheckInCell(row, visitor) {
        const cell = row.insertCell();
        const checkInTime = new Date(visitor.checkInTime);
        cell.textContent = checkInTime.toLocaleString();
    }

    static createCheckOutCell(row, visitor) {
        const cell = row.insertCell();
        if (visitor.checkOutTime) {
            const checkOutTime = new Date(visitor.checkOutTime);
            cell.textContent = checkOutTime.toLocaleString();
        } else {
            cell.textContent = 'Still inside';
        }
    }

    static createStatusCell(row, visitor) {
        const cell = row.insertCell();
        const statusBadge = document.createElement('span');
        statusBadge.className = `status-badge ${visitor.status === 'active' ? 'status-active' : 'status-completed'}`;
        statusBadge.textContent = visitor.status === 'active' ? 'Inside' : 'Completed';
        cell.appendChild(statusBadge);
    }

    static createActionsCell(row, visitor) {
        const cell = row.insertCell();
        cell.className = 'action-buttons';

        if (visitor.status === 'active') {
            cell.appendChild(this.createButton('btn-warning', 'fas fa-sign-out-alt', 'Check Out',
                () => VisitorManager.checkOutVisitor(visitor.id)));
        }

        cell.appendChild(this.createButton('btn-primary', 'fas fa-eye', 'View Details',
            () => VisitorManager.showVisitorDetails(visitor.id)));
        cell.appendChild(this.createButton('btn-info', 'fas fa-edit', 'Edit',
            () => VisitorManager.editVisitor(visitor.id)));
        cell.appendChild(this.createButton('btn-danger', 'fas fa-trash', 'Delete',
            () => VisitorManager.deleteVisitor(visitor.id)));
        cell.appendChild(this.createButton('btn-success', 'fas fa-id-card', 'Generate Gate Pass',
            () => GatePassManager.generateGatePass(visitor.id)));
    }

    static createButton(className, icon, title, onClick) {
        const button = document.createElement('button');
        button.className = `btn ${className} action-btn`;
        button.innerHTML = `<i class="${icon}"></i>`;
        button.title = title;
        button.onclick = onClick;
        return button;
    }

    static prevPage() {
        if (currentPage > 1) {
            currentPage--;
            DisplayManager.displayVisitors(displayedVisitors);
        }
    }

    static nextPage() {
        const totalPages = Math.ceil(displayedVisitors.length / visitorsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            DisplayManager.displayVisitors(displayedVisitors);
        }
    }
}