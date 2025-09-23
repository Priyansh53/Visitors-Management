// gatepass-manager.js - Handles gate pass generation and printing
class GatePassManager {
    static generateGatePass(visitorId) {
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

    static downloadGatePass() {
        if (!currentGatePassVisitor) return;

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a6'
            });

            const width = doc.internal.pageSize.getWidth();
            const centerX = width / 2;

            const primaryColor = [79, 70, 229];
            const grayColor = [107, 114, 128];
            const textColor = [17, 24, 39];

            // Header
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

            // Body
            doc.setDrawColor(209, 213, 219);
            doc.setLineWidth(0.5);
            doc.rect(10, 35, width - 20, 103, 'S');

            // Photo
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

            // Visitor Info
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

    static printGatePass() {
    if (!currentGatePassVisitor) return;

    const content = document.getElementById('gatePassContent').innerHTML;

    // Create a hidden print container
    const printContainer = document.createElement('div');
    printContainer.id = 'printContainer';
    printContainer.style.display = 'none';
    printContainer.innerHTML = `
        <div class="gate-pass">
            ${content}
        </div>
    `;

    document.body.appendChild(printContainer);

    // Print only the gate pass
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContainer.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;

    document.getElementById('printContainer')?.remove();

    showToast('Gate pass sent to printer!');
}
}