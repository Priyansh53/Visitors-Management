// display-manager.js - Handles UI display and pagination
class DisplayManager {
  static currentPage = 1;
  static visitorsPerPage = 9;
  static displayedVisitors = [];

  static displayVisitors(visitors) {
    this.displayedVisitors = visitors;
    const tbody = document.getElementById("visitorList");
    const emptyState = document.getElementById("emptyState");
    const pagination = document.getElementById("pagination");
    const table = document.getElementById("visitorTable");

    if (visitors.length === 0) {
      tbody.innerHTML = "";
      emptyState.style.display = "block";
      table.style.display = "none";
      pagination.style.display = "none";
      return;
    }

    emptyState.style.display = "none";
    table.style.display = "table";
    pagination.style.display = "flex";
    tbody.innerHTML = "";

    const totalPages = Math.ceil(visitors.length / this.visitorsPerPage);
    const startIndex = (this.currentPage - 1) * this.visitorsPerPage;
    const endIndex = Math.min(
      startIndex + this.visitorsPerPage,
      visitors.length
    );
    const paginatedVisitors = visitors.slice(startIndex, endIndex);

    paginatedVisitors.forEach((visitor) => {
      const row = tbody.insertRow();
      this.createPhotoCell(row, visitor);
      this.createTextCell(row, visitor.name, true);
      this.createTextCell(row, visitor.company || "N/A");
      this.createTextCell(row, visitor.phone);
      this.createTextCell(row, visitor.purpose);
      this.createTextCell(row, visitor.toMeet);
      this.createCheckInCell(row, visitor);
      this.createCheckOutCell(row, visitor);
      this.createStatusCell(row, visitor);
      this.createActionsCell(row, visitor);
    });

    // ✅ Show both pages & record info
    document.getElementById("pageInfo").textContent = `Page ${
      this.currentPage
    } of ${totalPages} | Showing ${startIndex + 1}-${endIndex} of ${
      visitors.length
    } records`;
  }

  // ------------------------- Cell Creators -------------------------
  static createPhotoCell(row, visitor) {
    const photoCell = row.insertCell();
    photoCell.className = "photo-cell";
    if (visitor.photo) {
      const img = document.createElement("img");
      img.src = visitor.photo;
      photoCell.appendChild(img);
    } else {
      photoCell.innerHTML =
        '<i class="fas fa-user-circle" style="font-size: 2rem; color: #ccc;"></i>';
    }
  }

  static createTextCell(row, text, bold = false) {
    const cell = row.insertCell();
    if (bold) {
      cell.innerHTML = `<strong>${text}</strong>`;
    } else {
      cell.textContent = text;
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
      cell.textContent = "Still inside";
    }
  }

  static createStatusCell(row, visitor) {
    const cell = row.insertCell();
    const statusBadge = document.createElement("span");
    statusBadge.className = `status-badge ${
      visitor.status === "active" ? "status-active" : "status-completed"
    }`;
    statusBadge.textContent =
      visitor.status === "active" ? "Inside" : "Completed";
    cell.appendChild(statusBadge);
  }

  static createActionsCell(row, visitor) {
    const cell = row.insertCell();
    cell.className = "action-buttons";

    if (visitor.status === "active") {
      cell.appendChild(
        this.createButton(
          "btn-warning",
          "fas fa-sign-out-alt",
          "Check Out",
          () => VisitorManager.checkOutVisitor(visitor.id)
        )
      );
    }

    cell.appendChild(
      this.createButton("btn-primary", "fas fa-eye", "View Details", () =>
        VisitorManager.showVisitorDetails(visitor.id)
      )
    );
    cell.appendChild(
      this.createButton("btn-info", "fas fa-edit", "Edit", () =>
        VisitorManager.editVisitor(visitor.id)
      )
    );
    cell.appendChild(
      this.createButton("btn-danger", "fas fa-trash", "Delete", () =>
        VisitorManager.deleteVisitor(visitor.id)
      )
    );
    cell.appendChild(
      this.createButton(
        "btn-success",
        "fas fa-id-card",
        "Generate Gate Pass",
        () => GatePassManager.generateGatePass(visitor.id)
      )
    );
  }

  static createButton(className, icon, title, onClick) {
    const button = document.createElement("button");
    button.className = `btn ${className} action-btn`;
    button.innerHTML = `<i class="${icon}"></i>`;
    button.title = title;
    button.onclick = onClick;
    return button;
  }

  // ------------------------- Pagination -------------------------
  static prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.displayVisitors(this.displayedVisitors);
    }
  }

  static nextPage() {
    const totalPages = Math.ceil(
      this.displayedVisitors.length / this.visitorsPerPage
    );
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.displayVisitors(this.displayedVisitors);
    }
  }
}
