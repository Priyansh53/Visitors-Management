let stream = null;
let photoData = null;
let allVisitors = [];
let displayedVisitors = [];
let currentGatePassVisitor = null;
const companyLogoUrl = './logo.png'; // Placeholder for company logo
let currentPage = 1;
const visitorsPerPage = 10;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadVisitors();
    updateStats();
    setDefaultDate();
});

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fromDate').value = today;
    document.getElementById('toDate').value = today;
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = isError ? 'toast error' : 'toast';
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.display = 'none';
    }, 3000);
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

async function startCamera() {
    try {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480 }
        });

        const video = document.getElementById('videoElement');
        video.srcObject = stream;
        video.style.display = 'block';

        const canvas = document.getElementById('capturedImage');
        canvas.style.display = 'none';

        showToast('Camera started successfully');
    } catch (err) {
        console.error("Error accessing camera:", err);
        showToast("Error accessing camera. Please check permissions.", true);
    }
}

function capturePhoto() {
    const video = document.getElementById('videoElement');
    const canvas = document.getElementById('capturedImage');

    if (!video.srcObject) {
        showToast("Please start the camera first", true);
        return;
    }

    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    photoData = canvas.toDataURL('image/jpeg', 0.8);
    canvas.style.display = 'block';
    video.style.display = 'none';

    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }

    showToast('Photo captured successfully');
}

function retakePhoto() {
    photoData = null;
    document.getElementById('capturedImage').style.display = 'none';
    document.getElementById('videoElement').style.display = 'block';
    startCamera();
}

document.getElementById('visitorForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const editId = document.getElementById('editId').value;
    
    if (!photoData && !editId) {
        showToast("Please capture a photo before submitting", true);
        return;
    }

    if (editId) {
        updateVisitor(editId);
    } else {
        registerVisitor();
    }
});

function registerVisitor() {
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
        displayVisitors(displayedVisitors);
        updateStats();

        document.getElementById('visitorForm').reset();
        photoData = null;
        document.getElementById('capturedImage').style.display = 'none';
        document.getElementById('videoElement').style.display = 'block';

        showToast(`${visitor.name} registered successfully!`);
    } catch (error) {
        showToast("Error saving visitor data", true);
    }
}

function updateVisitor(id) {
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
            displayVisitors(displayedVisitors);

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

function loadVisitors() {
    try {
        allVisitors = JSON.parse(localStorage.getItem('visitors') || '[]');
        displayedVisitors = allVisitors;
        currentPage = 1;
        displayVisitors(displayedVisitors);
    } catch (error) {
        showToast("Error loading visitor data", true);
        allVisitors = [];
    }
}

function displayVisitors(visitors) {
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

        const photoCell = row.insertCell();
        photoCell.className = 'photo-cell';
        if (visitor.photo) {
            const img = document.createElement('img');
            img.src = visitor.photo;
            photoCell.appendChild(img);
        } else {
            photoCell.innerHTML = '<i class="fas fa-user-circle" style="font-size: 2rem; color: #ccc;"></i>';
        }

        const nameCell = row.insertCell();
        nameCell.innerHTML = `<strong>${visitor.name}</strong>`;

        const companyCell = row.insertCell();
        companyCell.textContent = visitor.company || 'N/A';

        const phoneCell = row.insertCell();
        phoneCell.textContent = visitor.phone;

        const purposeCell = row.insertCell();
        purposeCell.textContent = visitor.purpose;

        const hostCell = row.insertCell();
        hostCell.textContent = visitor.toMeet;

        const checkInCell = row.insertCell();
        const checkInTime = new Date(visitor.checkInTime);
        checkInCell.textContent = checkInTime.toLocaleString();

        const checkOutCell = row.insertCell();
        if (visitor.checkOutTime) {
            const checkOutTime = new Date(visitor.checkOutTime);
            checkOutCell.textContent = checkOutTime.toLocaleString();
        } else {
            checkOutCell.textContent = 'Still inside';
        }

        const statusCell = row.insertCell();
        const statusBadge = document.createElement('span');
        statusBadge.className = `status-badge ${visitor.status === 'active' ? 'status-active' : 'status-completed'}`;
        statusBadge.textContent = visitor.status === 'active' ? 'Inside' : 'Completed';
        statusCell.appendChild(statusBadge);

        const actionsCell = row.insertCell();
        actionsCell.className = 'action-buttons';
        
        if (visitor.status === 'active') {
            const checkOutBtn = document.createElement('button');
            checkOutBtn.className = 'btn btn-warning action-btn';
            checkOutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i>';
            checkOutBtn.title = 'Check Out';
            checkOutBtn.onclick = () => checkOutVisitor(visitor.id);
            actionsCell.appendChild(checkOutBtn);
        }

        const viewBtn = document.createElement('button');
        viewBtn.className = 'btn btn-primary action-btn';
        viewBtn.innerHTML = '<i class="fas fa-eye"></i>';
        viewBtn.title = 'View Details';
        viewBtn.onclick = () => showVisitorDetails(visitor.id);
        actionsCell.appendChild(viewBtn);

        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-info action-btn';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = 'Edit';
        editBtn.onclick = () => editVisitor(visitor.id);
        actionsCell.appendChild(editBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger action-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = 'Delete';
        deleteBtn.onclick = () => deleteVisitor(visitor.id);
        actionsCell.appendChild(deleteBtn);

        const gatePassBtn = document.createElement('button');
        gatePassBtn.className = 'btn btn-success action-btn';
        gatePassBtn.innerHTML = '<i class="fas fa-id-card"></i>';
        gatePassBtn.title = 'Generate Gate Pass';
        gatePassBtn.onclick = () => generateGatePass(visitor.id);
        actionsCell.appendChild(gatePassBtn);
    });

    document.getElementById('pageInfo').textContent = `${currentPage} of ${totalPages}`;
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayVisitors(displayedVisitors);
    }
}

function nextPage() {
    const totalPages = Math.ceil(displayedVisitors.length / visitorsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayVisitors(displayedVisitors);
    }
}

function showVisitorDetails(visitorId) {
    try {
        const visitor = allVisitors.find(v => v.id === visitorId);

        if (visitor) {
            const detailsContent = document.getElementById('detailsContent');
            detailsContent.innerHTML = `
                <div class="visitor-card-header">
                    <img src="${companyLogoUrl}" alt="Company Logo" class="company-logo">
                    <img src="${visitor.photo || 'https://via.placeholder.com/120?text=No+Photo'}" alt="${visitor.name}" class="visitor-photo">
                    <h3>${visitor.name}</h3>
                    <p>${visitor.company || 'N/A'}</p>
                </div>
                <div class="visitor-card-body">
                    <p><strong>Phone:</strong> ${visitor.phone}</p>
                    <p><strong>Email:</strong> ${visitor.email || 'N/A'}</p>
                    <p><strong>Purpose:</strong> ${visitor.purpose}</p>
                    <p><strong>Host:</strong> ${visitor.toMeet}</p>
                    <p><strong>Department:</strong> ${visitor.department || 'N/A'}</p>
                    <p><strong>Check In:</strong> ${new Date(visitor.checkInTime).toLocaleString()}</p>
                    <p><strong>Check Out:</strong> ${visitor.checkOutTime ? new Date(visitor.checkOutTime).toLocaleString() : 'Still inside'}</p>
                    <p><strong>Status:</strong> <span class="status-badge ${visitor.status === 'active' ? 'status-active' : 'status-completed'}">${visitor.status === 'active' ? 'Inside' : 'Completed'}</span></p>
                </div>
            `;
            openModal('detailsModal');
        }
    } catch (error) {
        showToast("Error loading visitor details", true);
    }
}

function checkOutVisitor(visitorId) {
    try {
        let visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
        const visitorIndex = visitors.findIndex(v => v.id === visitorId);

        if (visitorIndex !== -1) {
            visitors[visitorIndex].checkOutTime = new Date().toISOString();
            visitors[visitorIndex].status = 'completed';

            localStorage.setItem('visitors', JSON.stringify(visitors));
            allVisitors = visitors;
            displayedVisitors = allVisitors;
            displayVisitors(displayedVisitors);
            updateStats();

            showToast('Visitor checked out successfully');
        }
    } catch (error) {
        showToast("Error checking out visitor", true);
    }
}

function editVisitor(visitorId) {
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
                <button type="button" onclick="cancelEdit()" class="btn btn-secondary" style="width: 100%;">
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

function cancelEdit() {
    document.getElementById('visitorForm').reset();
    document.getElementById('editId').value = '';
    document.getElementById('formButtons').innerHTML = `
        <button type="submit" class="btn btn-primary" style="width: 100%;">
            <i class="fas fa-user-check"></i> Register Visitor
        </button>
    `;
    showToast('Edit cancelled');
}

function deleteVisitor(visitorId) {
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
                displayVisitors(displayedVisitors);
                updateStats();
                showToast(`Visitor ${visitorName} deleted successfully`);
            }
        } catch (error) {
            showToast("Error deleting visitor", true);
        }
    }
}

function generateGatePass(visitorId) {
    try {
        const visitors = JSON.parse(localStorage.getItem('visitors') || '[]');
        const visitor = visitors.find(v => v.id === visitorId);

        if (visitor) {
            currentGatePassVisitor = visitor;
            
            const gatePassContent = document.getElementById('gatePassContent');
            gatePassContent.innerHTML = `
                <div class="gate-pass-header">
                    <img src="${companyLogoUrl}" alt="Company Logo" class="company-logo">
                    <h2>VISITOR GATE PASS</h2>
                    <p>${new Date().toLocaleDateString()}</p>
                </div>
                <div class="gate-pass-body">
                    <div class="gate-pass-photo">
                        ${visitor.photo ? `<img src="${visitor.photo}" alt="${visitor.name}">` : 
                        '<i class="fas fa-user-circle" style="font-size: 5rem; color: #ccc;"></i>'}
                    </div>
                    <div class="gate-pass-info">
                        <p><strong>Name:</strong> ${visitor.name}</p>
                        <p><strong>Company:</strong> ${visitor.company || 'N/A'}</p>
                        <p><strong>Phone:</strong> ${visitor.phone}</p>
                        <p><strong>Purpose:</strong> ${visitor.purpose}</p>
                        <p><strong>Meeting:</strong> ${visitor.toMeet}</p>
                        <p><strong>Department:</strong> ${visitor.department || 'N/A'}</p>
                        <p><strong>Check-in:</strong> ${new Date(visitor.checkInTime).toLocaleString()}</p>
                    </div>
                </div>
                <div class="gate-pass-footer">
                    <div class="gate-pass-qr">
                        <i class="fas fa-qrcode" style="font-size: 3rem; color: #4f46e5;"></i>
                    </div>
                    <p>Please keep this pass visible at all times</p>
                    <p>Valid for: ${visitor.date}</p>
                </div>
            `;
            
            openModal('gatePassModal');
        }
    } catch (error) {
        showToast("Error generating gate pass", true);
    }
}

function downloadGatePass() {
    if (!currentGatePassVisitor) return;
    
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a6'
        });

        const width = doc.internal.pageSize.getWidth(); // 105mm for A6
        const centerX = width / 2;

        const primaryColor = [79, 70, 229];
        const secondaryColor = [124, 58, 237];
        const textColor = [17, 24, 39];
        const grayColor = [107, 114, 128];

        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, width, 20, 'F');
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text('VISITOR GATE PASS', centerX, 12, { align: 'center' });
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(...grayColor);
        doc.text(new Date().toLocaleDateString(), centerX, 25, { align: 'center' });

        doc.setDrawColor(209, 213, 219);
        doc.setLineWidth(0.5);
        doc.rect(10, 35, width - 20, 103, 'S');

        if (currentGatePassVisitor.photo) {
            try {
                doc.addImage(currentGatePassVisitor.photo, 'JPEG', centerX - 22.5, 40, 45, 45);
            } catch (e) {
                doc.setFontSize(30);
                doc.setTextColor(209, 213, 219);
                doc.text('👤', centerX, 65, { align: 'center' });
            }
        } else {
            doc.setFontSize(30);
            doc.setTextColor(209, 213, 219);
            doc.text('👤', centerX, 65, { align: 'center' });
        }

        doc.setTextColor(...textColor);
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        let yPosition = 90;
        const fields = [
            { label: 'Name:', value: currentGatePassVisitor.name },
            { label: 'Company:', value: currentGatePassVisitor.company || 'N/A' },
            { label: 'Phone:', value: currentGatePassVisitor.phone },
            { label: 'Purpose:', value: currentGatePassVisitor.purpose },
            { label: 'Meeting:', value: currentGatePassVisitor.toMeet },
            { label: 'Department:', value: currentGatePassVisitor.department || 'N/A' },
            { label: 'Check-in:', value: new Date(currentGatePassVisitor.checkInTime).toLocaleString() }
        ];

        fields.forEach(field => {
            doc.setFont(undefined, 'bold');
            doc.text(field.label, 15, yPosition);
            doc.setFont(undefined, 'normal');
            const valueLines = doc.splitTextToSize(field.value, 65);
            doc.text(valueLines, 35, yPosition);
            yPosition += 6 + (valueLines.length - 1) * 4;
        });

        doc.setFillColor(249, 250, 251);
        doc.rect(centerX - 17.5, yPosition, 35, 35, 'F');
        doc.setTextColor(...primaryColor);
        doc.setFontSize(10);
        doc.text('QR CODE', centerX, yPosition + 18, { align: 'center' });

        doc.setDrawColor(...primaryColor);
        doc.setLineWidth(0.3);
        doc.line(10, 135, width - 10, 135);
        doc.setTextColor(...grayColor);
        doc.setFontSize(9);
        doc.text('Please keep this pass visible at all times', centerX, 140, { align: 'center' });
        doc.text(`Valid for: ${currentGatePassVisitor.date}`, centerX, 145, { align: 'center' });

        const fileName = `gate_pass_${currentGatePassVisitor.name.replace(/\s+/g, '_')}_${currentGatePassVisitor.date}.pdf`;
        doc.save(fileName);
        
        showToast('Gate pass downloaded successfully!');
    } catch (error) {
        console.error('Error generating PDF:', error);
        showToast('Error generating gate pass PDF', true);
    }
}

function printGatePass() {
    if (!currentGatePassVisitor) return;

    const content = document.getElementById('gatePassContent').innerHTML;

    const printWindow = window.open('', '_blank', 'width=600,height=800');
    printWindow.document.write(`
        <html>
        <head>
            <title>Visitor Gate Pass</title>
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
            <link rel="stylesheet" href="./Visitors-management.css">
            <style>
                body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
                .gate-pass { margin: auto; }
            </style>
        </head>
        <body>
            <div class="gate-pass">
                ${content}
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    showToast('Gate pass sent to printer!');
}

function updateStats() {
    const visitors = allVisitors;
    const today = new Date().toISOString().split('T')[0];

    document.getElementById('totalVisitors').textContent = visitors.length;

    const todayVisitors = visitors.filter(v => v.date === today).length;
    document.getElementById('todayVisitors').textContent = todayVisitors;

    const activeVisitors = visitors.filter(v => v.status === 'active').length;
    document.getElementById('activeVisitors').textContent = activeVisitors;
}

function filterVisitors() {
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
    displayVisitors(displayedVisitors);
    showToast(`Found ${filteredVisitors.length} visitors matching criteria`);
}

function resetFilters() {
    document.getElementById('fromDate').value = '';
    document.getElementById('toDate').value = '';
    document.getElementById('purposeFilter').value = '';
    displayedVisitors = allVisitors;
    currentPage = 1;
    displayVisitors(displayedVisitors);
    showToast('Filters reset');
}

function generatePDF() {
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;
    const purposeFilter = document.getElementById('purposeFilter').value;

    let visitorsForPDF = [...allVisitors];

    if (fromDate && toDate) {
        visitorsForPDF = visitorsForPDF.filter(v => {
            return v.date >= fromDate && v.date <= toDate;
        });
    }

    if (purposeFilter) {
        visitorsForPDF = visitorsForPDF.filter(v => v.purpose === purposeFilter);
    }

    if (visitorsForPDF.length === 0) {
        showToast("No visitors found for the selected criteria", true);
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });

        const width = doc.internal.pageSize.getWidth(); // 297mm for A4 landscape
        const centerX = width / 2;

        const primaryColor = [79, 70, 229];
        const secondaryColor = [124, 58, 237];
        const textColor = [17, 24, 39];
        const grayColor = [107, 114, 128];
        const whiteColor = [255, 255, 255];

        function drawHeader(pageNumber, totalPages) {
            doc.setFillColor(...whiteColor);
            doc.rect(0, 0, width, 20, 'F');
            doc.setTextColor(0,0,0);
            doc.setFontSize(18);
            doc.setFont(undefined, 'bold');
            doc.text('VISITOR MANAGEMENT REPORT', centerX, 14, { align: 'center' });
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.addImage(companyLogoUrl, 'PNG', 20, 3.5, 30, 15);    
            doc.text(`Page ${pageNumber} of ${totalPages}`, width - 20, 14, { align: 'right' });
        }

        function drawFooter(pageNumber, totalPages) {
            doc.setDrawColor(...grayColor);
            doc.setLineWidth(0.3);
            doc.line(20, 190, width - 20, 190);
            doc.setTextColor(...grayColor);
            doc.setFontSize(9);
            doc.text('Professional Visitor Management System', 20, 195);
            doc.text(`Generated on ${new Date().toLocaleString()}`, 20, 200);
            doc.text('Confidential Document - For Internal Use Only', width - 20, 200, { align: 'right' });
        }

        doc.setTextColor(...textColor);
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        const reportDate = new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        let yPosition = 30;
        doc.text(`Report Generated: ${reportDate}`, 20, yPosition);
        yPosition += 7;
        doc.text(`Total Visitors: ${visitorsForPDF.length}`, 20, yPosition);
        if (fromDate && toDate) {
            yPosition += 7;
            doc.text(`Date Range: ${new Date(fromDate).toLocaleDateString()} to ${new Date(toDate).toLocaleDateString()}`, 20, yPosition);
        }
        if (purposeFilter) {
            yPosition += 7;
            doc.text(`Purpose Filter: ${purposeFilter}`, 20, yPosition);
        }

        const startY = yPosition + 10;
        let currentY = startY;
        const rowHeight = 12;
        const pageHeight = 210;
        const marginsBottom = 30;

        const headers = [
            { text: 'Photo', x: 20, width: 25 },
            { text: 'Name', x: 45, width: 40 },
            { text: 'Company', x: 85, width: 35 },
            { text: 'Phone', x: 120, width: 30 },
            { text: 'Purpose', x: 150, width: 30 },
            { text: 'Host', x: 180, width: 30 },
            { text: 'Check In', x: 210, width: 35 },
            { text: 'Check Out', x: 245, width: 35 },
            { text: 'Status', x: 280, width: 17 }
        ];

        function drawTableHeader(y) {
            doc.setFillColor(249, 250, 251);
            doc.rect(20, y - 5, width - 40, 10, 'F');
            doc.setDrawColor(...grayColor);
            doc.setLineWidth(0.3);
            doc.rect(20, y - 5, width - 40, 10);
            let currentX = 20;
            headers.forEach(header => {
                if (currentX > 20) {
                    doc.line(currentX, y - 5, currentX, y + 5);
                }
                currentX += header.width;
            });
            doc.setTextColor(...textColor);
            doc.setFontSize(10);
            doc.setFont(undefined, 'bold');
            headers.forEach(header => {
                doc.text(header.text, header.x + 2, y + 3);
            });
            return y + 10;
        }

        function drawTableRow(visitor, y, index) {
            if (index % 2 === 0) {
                doc.setFillColor(249, 250, 251);
                doc.rect(20, y, width - 40, rowHeight, 'F');
            }
            doc.setDrawColor(209, 213, 219);
            doc.setLineWidth(0.2);
            doc.rect(20, y, width - 40, rowHeight);
            let currentX = 20;
            headers.forEach(header => {
                if (currentX > 20) {
                    doc.line(currentX, y, currentX, y + rowHeight);
                }
                currentX += header.width;
            });

            if (visitor.photo) {
                try {
                    doc.addImage(visitor.photo, 'JPEG', 22, y + 1, 10, 10);
                } catch (e) {
                    doc.setTextColor(...grayColor);
                    doc.setFontSize(8);
                    doc.text('No Photo', 22, y + 8);
                }
            } else {
                doc.setTextColor(...grayColor);
                doc.setFontSize(8);
                doc.text('No Photo', 22, y + 8);
            }

            doc.setTextColor(...textColor);
            doc.setFontSize(9);
            doc.setFont(undefined, 'normal');

            doc.setFont(undefined, 'bold');
            const nameLines = doc.splitTextToSize(visitor.name, headers[1].width - 4);
            doc.text(nameLines, headers[1].x + 2, y + 6);
            doc.setFont(undefined, 'normal');

            const companyLines = doc.splitTextToSize(visitor.company || 'N/A', headers[2].width - 4);
            doc.text(companyLines, headers[2].x + 2, y + 6);

            const phoneLines = doc.splitTextToSize(visitor.phone, headers[3].width - 4);
            doc.text(phoneLines, headers[3].x + 2, y + 6);

            const purposeLines = doc.splitTextToSize(visitor.purpose, headers[4].width - 4);
            doc.text(purposeLines, headers[4].x + 2, y + 6);

            const hostLines = doc.splitTextToSize(visitor.toMeet, headers[5].width - 4);
            doc.text(hostLines, headers[5].x + 2, y + 6);

            const checkInTime = new Date(visitor.checkInTime).toLocaleString('en-US', {
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
            doc.text(checkInTime, headers[6].x + 2, y + 6);

            let checkOutText = 'Still Inside';
            let checkOutColor = [245, 158, 11];
            if (visitor.checkOutTime) {
                checkOutText = new Date(visitor.checkOutTime).toLocaleString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                checkOutColor = [16, 185, 129];
            }
            doc.setTextColor(...checkOutColor);
            doc.text(checkOutText, headers[7].x + 2, y + 6);
            doc.setTextColor(...textColor);

            const statusText = visitor.status === 'active' ? 'ACTIVE' : 'OUT';
            doc.setFontSize(8);
            const textWidth = doc.getTextWidth(statusText);
            const rectWidth = textWidth + 4;
            const statusColor = visitor.status === 'active' ? [22, 163, 74] : [220, 38, 38];
            const rectX = headers[8].x + (headers[8].width - rectWidth) / 2;
            const textX = rectX + 2;
            doc.setFillColor(...statusColor);
            doc.roundedRect(rectX, y + 3, rectWidth, 6, 3, 3, 'F');
            doc.setTextColor(255, 255, 255);
            doc.text(statusText, textX, y + 6.5);

            return y + rowHeight;
        }

        drawHeader(1, 1);
        currentY = drawTableHeader(currentY);

        let pageNumber = 1;
        visitorsForPDF.forEach((visitor, index) => {
            if (currentY + rowHeight > pageHeight - marginsBottom) {
                drawFooter(pageNumber, pageNumber);
                doc.addPage();
                pageNumber++;
                currentY = 30;
                drawHeader(pageNumber, pageNumber);
                currentY = drawTableHeader(currentY);
            }
            currentY = drawTableRow(visitor, currentY, index);
        });

        let totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            drawHeader(i, totalPages);
            drawFooter(i, totalPages);
        }

        if (visitorsForPDF.length > 0) {
            doc.addPage();
            pageNumber++;
            totalPages++;
            drawHeader(pageNumber, totalPages);

            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.setTextColor(...textColor);
            doc.text('VISITOR SUMMARY', 20, 30);

            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            const activeCount = visitorsForPDF.filter(v => v.status === 'active').length;
            const completedCount = visitorsForPDF.filter(v => v.status === 'completed').length;
            const purposeStats = {};

            visitorsForPDF.forEach(v => {
                purposeStats[v.purpose] = (purposeStats[v.purpose] || 0) + 1;
            });

            let summaryY = 40;
            doc.text(`Total Visitors: ${visitorsForPDF.length}`, 20, summaryY);
            summaryY += 10;
            doc.text(`Currently Inside: ${activeCount}`, 20, summaryY);
            summaryY += 10;
            doc.text(`Completed Visits: ${completedCount}`, 20, summaryY);
            summaryY += 15;

            doc.setFont(undefined, 'bold');
            doc.text('Purpose Breakdown:', 20, summaryY);
            doc.setFont(undefined, 'normal');
            summaryY += 10;

            Object.entries(purposeStats).forEach(([purpose, count]) => {
                doc.text(`• ${purpose}: ${count} visitors`, 25, summaryY);
                summaryY += 8;
            });

            drawFooter(pageNumber, totalPages);
        }

        const dateRange = fromDate && toDate ? `_${fromDate}_to_${toDate}` : '';
        const purposeSuffix = purposeFilter ? `_${purposeFilter.replace(/\s+/g, '-')}` : '';
        const fileName = `visitor-report${dateRange}${purposeSuffix}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);

        showToast('Professional PDF report generated successfully!');
    } catch (error) {
        console.error('Error generating PDF:', error);
        showToast('Error generating PDF report', true);
    }
}

function autoCheckOut() {
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
        loadVisitors();
        updateStats();
    }
}

autoCheckOut();

function exportToCSV() {
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

function searchVisitors(query) {
    const filteredVisitors = allVisitors.filter(visitor =>
        visitor.name.toLowerCase().includes(query.toLowerCase()) ||
        visitor.company.toLowerCase().includes(query.toLowerCase()) ||
        visitor.phone.includes(query) ||
        visitor.toMeet.toLowerCase().includes(query.toLowerCase()) ||
        visitor.purpose.toLowerCase().includes(query.toLowerCase())
    );
    displayedVisitors = filteredVisitors;
    currentPage = 1;
    displayVisitors(displayedVisitors);
}

window.addEventListener('beforeunload', function() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});

document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case 'p':
                e.preventDefault();
                generatePDF();
                break;
            case 'f':
                e.preventDefault();
                filterVisitors();
                break;
            case 'r':
                e.preventDefault();
                resetFilters();
                break;
        }
    }
});