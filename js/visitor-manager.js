// visitor-manager.js - Handles visitor CRUD operations
class VisitorManager {
    static loadVisitors() {
        try {
            allVisitors = JSON.parse(localStorage.getItem('visitors') || '[]');
            displayedVisitors = allVisitors;
            currentPage = 1;
            DisplayManager.displayVisitors(displayedVisitors);
        } catch (error) {
            showToast("Error loading visitor data", true);
            allVisitors = [];
        }
    }

    static registerVisitor() {
        const visitor = {
            id: Date.now(),
            photo: photoData,
            name: document.getElementById('name').value.trim(),
            company: document.getElementById('company').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            email: document.getElementById('email').value.trim(),
            purpose: document.getElementById('purpose').value,
            toMeet: document.getElementById('toMeet').value.trim(),
            department: document.getElementById('department').value.trim(),
            checkInTime: new Date().toISOString(),
            checkOutTime: null,
            date: new Date().toISOString().split('T')[0],
            status: 'active'
        };

        try {
            let visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
            visitors.unshift(visitor);
            localStorage.setItem('visitors', JSON.stringify(visitors));

            allVisitors = visitors;
            displayedVisitors = allVisitors;
            currentPage = 1;
            DisplayManager.displayVisitors(displayedVisitors);
            StatsManager.updateStats();

            document.getElementById('visitorForm').reset();
            photoData = null;
            document.getElementById('capturedImage').style.display = 'none';
            document.getElementById('videoElement').style.display = 'block';

            showToast(`${visitor.name} registered successfully!`);
        } catch (error) {
            showToast("Error saving visitor data", true);
        }
    }

    static updateVisitor(id) {
        try {
            let visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
            const visitorIndex = visitors.findIndex(v => v.id == id);

            if (visitorIndex !== -1) {
                visitors[visitorIndex].name = document.getElementById('name').value.trim();
                visitors[visitorIndex].company = document.getElementById('company').value.trim();
                visitors[visitorIndex].phone = document.getElementById('phone').value.trim();
                visitors[visitorIndex].email = document.getElementById('email').value.trim();
                visitors[visitorIndex].purpose = document.getElementById('purpose').value;
                visitors[visitorIndex].toMeet = document.getElementById('toMeet').value.trim();
                visitors[visitorIndex].department = document.getElementById('department').value.trim();

                if (photoData) {
                    visitors[visitorIndex].photo = photoData;
                }

                localStorage.setItem('visitors', JSON.stringify(visitors));
                allVisitors = visitors;
                displayedVisitors = allVisitors;
                currentPage = 1;
                DisplayManager.displayVisitors(displayedVisitors);

                document.getElementById('visitorForm').reset();
                document.getElementById('editId').value = '';
                document.getElementById('formButtons').innerHTML = `
                    <button type="submit" class="btn btn-primary" style="width: 100%;">
                        <i class="fas fa-user-check"></i> Register Visitor
                    </button>
                `;

                photoData = null;
                document.getElementById('capturedImage').style.display = 'none';
                document.getElementById('videoElement').style.display = 'block';

                closeModal('editModal');
                showToast('Visitor updated successfully!');
            }
        } catch (error) {
            showToast("Error updating visitor data", true);
        }
    }

    static checkOutVisitor(visitorId) {
        try {
            let visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
            const visitorIndex = visitors.findIndex(v => v.id === visitorId);

            if (visitorIndex !== -1) {
                visitors[visitorIndex].checkOutTime = new Date().toISOString();
                visitors[visitorIndex].status = 'completed';

                localStorage.setItem('visitors', JSON.stringify(visitors));
                allVisitors = visitors;
                displayedVisitors = allVisitors;
                DisplayManager.displayVisitors(displayedVisitors);
                StatsManager.updateStats();

                showToast('Visitor checked out successfully');
            }
        } catch (error) {
            showToast("Error checking out visitor", true);
        }
    }

    static deleteVisitor(visitorId) {
        if (confirm('Are you sure you want to delete this visitor record? This action cannot be undone.')) {
            try {
                let visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
                const visitorIndex = visitors.findIndex(v => v.id === visitorId);

                if (visitorIndex !== -1) {
                    const visitorName = visitors[visitorIndex].name;
                    visitors.splice(visitorIndex, 1);
                    localStorage.setItem('visitors', JSON.stringify(visitors));
                    allVisitors = visitors;
                    displayedVisitors = allVisitors;
                    currentPage = 1;
                    DisplayManager.displayVisitors(displayedVisitors);
                    StatsManager.updateStats();
                    showToast(`Visitor ${visitorName} deleted successfully`);
                }
            } catch (error) {
                showToast("Error deleting visitor", true);
            }
        }
    }

    static editVisitor(visitorId) {
        try {
            const visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
            const visitor = visitors.find(v => v.id === visitorId);

            if (visitor) {
                document.getElementById('editId').value = visitor.id;
                document.getElementById('name').value = visitor.name;
                document.getElementById('company').value = visitor.company || '';
                document.getElementById('phone').value = visitor.phone;
                document.getElementById('email').value = visitor.email || '';
                document.getElementById('purpose').value = visitor.purpose;
                document.getElementById('toMeet').value = visitor.toMeet;
                document.getElementById('department').value = visitor.department || '';

                document.getElementById('formButtons').innerHTML = `
                    <button type="submit" class="btn btn-primary" style="width: 100%; margin-bottom: 10px;">
                        <i class="fas fa-save"></i> Update Visitor
                    </button>
                    <button type="button" onclick="VisitorManager.cancelEdit()" class="btn btn-secondary" style="width: 100%;">
                        <i class="fas fa-times"></i> Cancel Edit
                    </button>
                `;

                document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });

                showToast(`Editing ${visitor.name}'s details`);
            }
        } catch (error) {
            showToast("Error loading visitor data for editing", true);
        }
    }

    static cancelEdit() {
        document.getElementById('visitorForm').reset();
        document.getElementById('editId').value = '';
        document.getElementById('formButtons').innerHTML = `
            <button type="submit" class="btn btn-primary" style="width: 100%;">
                <i class="fas fa-user-check"></i> Register Visitor
            </button>
        `;
        showToast('Edit cancelled');
    }

 static showVisitorDetails(visitorId) {
  try {
    const visitor = allVisitors.find(v => v.id === visitorId);
    if (visitor) {
      const detailsContent = document.getElementById('detailsContent');
      detailsContent.innerHTML = `
        <div class="visitor-card-header">
          <img src="${companyLogoUrl}" alt="Company Logo" class="company-logo">
          <img src="${visitor.photo || 'https://via.placeholder.com/120?text=No+Photo'}" alt="${visitor.name}" class="visitor-photo">
          <h3>${visitor.name}</h3>
          <p>${visitor.company || 'Independent Visitor'}</p>
        </div>
        <div class="visitor-card-body">
          <p><strong>Phone:</strong> ${visitor.phone}</p>
          <p><strong>Email:</strong> ${visitor.email || 'N/A'}</p>
          <p><strong>Purpose:</strong> ${visitor.purpose}</p>
          <p><strong>Host:</strong> ${visitor.toMeet}</p>
          <p><strong>Department:</strong> ${visitor.department || 'N/A'}</p>
          <p><strong>Check In:</strong> ${new Date(visitor.checkInTime).toLocaleString()}</p>
          <p><strong>Check Out:</strong> ${visitor.checkOutTime ? new Date(visitor.checkOutTime).toLocaleString() : 'Still inside'}</p>
          <p><strong>Status:</strong>
            <span class="status-badge ${visitor.status === 'active' ? 'status-active' : 'status-completed'}">
              ${visitor.status === 'active' ? 'Inside Premises' : 'Completed Visit'}
            </span>
          </p>
        </div>
      `;
      ModalManager.open('detailsModal');
    }
  } catch (error) {
    showToast("Error loading visitor details", true);
  }
}
}