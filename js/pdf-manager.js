class ProfessionalPDFManager {
  static generatePDF() {
    const fromDate = document.getElementById("fromDate").value;
    const toDate = document.getElementById("toDate").value;
    const purposeFilter = document.getElementById("purposeFilter").value;

    let visitorsForPDF = [...allVisitors];

    // Apply filters
    if (fromDate && toDate) {
      visitorsForPDF = visitorsForPDF.filter((v) => {
        return v.date >= fromDate && v.date <= toDate;
      });
    }

    if (purposeFilter) {
      visitorsForPDF = visitorsForPDF.filter(
        (v) => v.purpose === purposeFilter
      );
    }

    if (visitorsForPDF.length === 0) {
      showToast("No visitors found for the selected criteria", true);
      return;
    }

    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // Generate all pages
      this.addCoverPage(doc, visitorsForPDF, fromDate, toDate, purposeFilter);
      this.addDataPages(doc, visitorsForPDF);
      this.addSummaryPage(doc, visitorsForPDF);
      this.addAnalyticsPage(doc, visitorsForPDF);

      // Update page numbers for all pages
      this.updatePageNumbers(doc);

      // Generate filename
      const fileName = this.generateFileName(fromDate, toDate, purposeFilter);
      doc.save(fileName);

      showToast("Professional PDF report generated successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      showToast("Error generating PDF report", true);
    }
  }

  static addCoverPage(doc, visitors, fromDate, toDate, purposeFilter) {
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // Header gradient background
    doc.setFillColor(30, 58, 138); // Indigo 800
    doc.rect(0, 0, width, 60, "F");

    // Company logo area
doc.setFillColor(255, 255, 255);
doc.roundedRect(20, 15, 40, 30, 5, 5, "F");
try {
  doc.addImage("logo.png", "PNG", 22, 17, 36, 26);
} catch (e) {
  // Fallback if logo fails to load
  doc.setTextColor(30, 58, 138);
  doc.setFontSize(12);
  doc.setFont(undefined, "bold");
  doc.text("COMPANY", 40, 28, { align: "center" });
  doc.text("LOGO", 40, 35, { align: "center" });
}
    // Main title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont(undefined, "bold");
    doc.text("VISITOR MANAGEMENT", width / 2, 25, { align: "center" });
    doc.text("SYSTEM REPORT", width / 2, 40, { align: "center" });

    // Report details section
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(40, 80, width - 80, 80, 10, 10, "F");

    doc.setTextColor(30, 58, 138);
    doc.setFontSize(18);
    doc.text("Report Details", width / 2, 95, { align: "center" });

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(12);
    doc.setFont(undefined, "normal");

    let detailY = 110;
    const reportDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    doc.text(`Report Generated: ${reportDate}`, 50, detailY);
    detailY += 8;

    if (fromDate && toDate) {
      doc.text(
        `Date Range: ${this.formatDate(fromDate)} to ${this.formatDate(
          toDate
        )}`,
        50,
        detailY
      );
      detailY += 8;
    } else {
      doc.text("Date Range: All Records", 50, detailY);
      detailY += 8;
    }

    if (purposeFilter) {
      doc.text(`Purpose Filter: ${purposeFilter}`, 50, detailY);
      detailY += 8;
    } else {
      doc.text("Purpose Filter: All Purposes", 50, detailY);
      detailY += 8;
    }

    doc.text(`Total Visitors: ${visitors.length}`, 50, detailY);
    detailY += 8;
    doc.text(
      `Active Visitors: ${
        visitors.filter((v) => v.status === "active").length
      }`,
      50,
      detailY
    );

    // Footer
    this.addFooter(doc, 1, "Cover Page");
  }

  static addDataPages(doc, visitors) {
    doc.addPage();

    let pageNumber = 2;
    let currentY = 30;

    this.drawPageHeader(doc, "Visitor Records");
    currentY = this.drawTableHeader(doc, 40);

    visitors.forEach((visitor, index) => {
      if (currentY + 15 > 180) {
        // Check if we need a new page
        this.addFooter(doc, pageNumber, "Data Records");
        doc.addPage();
        pageNumber++;
        this.drawPageHeader(doc, "Visitor Records (Continued)");
        currentY = this.drawTableHeader(doc, 40);
      }
      currentY = this.drawTableRow(doc, visitor, currentY, index);
    });

    this.addFooter(doc, pageNumber, "Data Records");
  }

  static addSummaryPage(doc, visitors) {
    doc.addPage();
    const pageNumber = doc.internal.getNumberOfPages();

    this.drawPageHeader(doc, "Executive Summary");

    // Summary statistics
    const activeCount = visitors.filter((v) => v.status === "active").length;
    const completedCount = visitors.filter(
      (v) => v.status === "completed"
    ).length;

    // Purpose breakdown
    const purposeStats = {};
    visitors.forEach((v) => {
      purposeStats[v.purpose] = (purposeStats[v.purpose] || 0) + 1;
    });

    // Company breakdown
    const companyStats = {};
    visitors.forEach((v) => {
      const company = v.company || "Not Specified";
      companyStats[company] = (companyStats[company] || 0) + 1;
    });

    let summaryY = 50;

    // Key Metrics Box
    this.drawSummaryBox(doc, "Key Metrics", 20, summaryY, 120, 60, [
      `Total Visitors: ${visitors.length}`,
      `Currently Inside: ${activeCount}`,
      `Completed Visits: ${completedCount}`,
      `Completion Rate: ${((completedCount / visitors.length) * 100).toFixed(
        1
      )}%`,
    ]);

    // Top Purposes Box
    const topPurposes = Object.entries(purposeStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([purpose, count]) => `${purpose}: ${count} visitors`);

    this.drawSummaryBox(
      doc,
      "Top Visit Purposes",
      150,
      summaryY,
      120,
      60,
      topPurposes
    );

    summaryY += 80;

    // Top Companies Box
    const topCompanies = Object.entries(companyStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([company, count]) => `${company}: ${count} visitors`);

    this.drawSummaryBox(
      doc,
      "Top Companies",
      20,
      summaryY,
      120,
      60,
      topCompanies
    );

    // Time Analysis
    const timeStats = this.analyzeVisitTimes(visitors);
    this.drawSummaryBox(doc, "Time Analysis", 150, summaryY, 120, 60, [
      `Peak Hour: ${timeStats.peakHour}`,
      `Avg Visit Duration: ${timeStats.avgDuration}`,
      `Longest Visit: ${timeStats.longestVisit}`,
      `Shortest Visit: ${timeStats.shortestVisit}`,
    ]);

    this.addFooter(doc, pageNumber, "Executive Summary");
  }

  static addAnalyticsPage(doc, visitors) {
    doc.addPage();
    const pageNumber = doc.internal.getNumberOfPages();

    this.drawPageHeader(doc, "Detailed Analytics");

    // Daily visitor pattern
    const dailyStats = this.analyzeDailyPattern(visitors);
    const weeklyStats = this.analyzeWeeklyPattern(visitors);

    let analyticsY = 50;

    // Daily Pattern
    this.drawAnalyticsSection(
      doc,
      "Daily Visitor Pattern",
      20,
      analyticsY,
      dailyStats
    );
    analyticsY += 40;

    // Weekly Pattern
    this.drawAnalyticsSection(
      doc,
      "Weekly Visitor Pattern",
      20,
      analyticsY,
      weeklyStats
    );
    analyticsY += 40;

    // Security Insights
    const securityInsights = this.generateSecurityInsights(visitors);
    this.drawSecurityInsights(doc, 20, analyticsY, securityInsights);

    this.addFooter(doc, pageNumber, "Detailed Analytics");
  }

  static drawPageHeader(doc, title) {
    const width = doc.internal.pageSize.getWidth();

    // Header background
    doc.setFillColor(241, 245, 249);
    doc.rect(0, 0, width, 25, "F");

    // Header border
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(0, 25, width, 25);

    // Title
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(16);
    doc.setFont(undefined, "bold");
    doc.text(title, 20, 16);

    // Date
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");
    doc.text(new Date().toLocaleDateString(), width - 20, 16, {
      align: "right",
    });
  }

  static drawTableHeader(doc, y) {
    const width = doc.internal.pageSize.getWidth();
    const headers = [
      { text: "Photo", x: 20, width: 25 },
      { text: "Visitor Name", x: 45, width: 40 },
      { text: "Company", x: 85, width: 35 },
      { text: "Contact", x: 120, width: 30 },
      { text: "Purpose", x: 150, width: 32 },
      { text: "Host", x: 182, width: 28 },
      { text: "Check In", x: 210, width: 32 },
      { text: "Check Out", x: 242, width: 32 },
    ];

    // Header background
    doc.setFillColor(30, 58, 138);
    doc.rect(20, y - 5, width - 40, 12, "F");

    // Header borders
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(0.3);

    let currentX = 20;
    headers.forEach((header, index) => {
      if (index > 0) {
        doc.line(currentX, y - 5, currentX, y + 7);
      }
      currentX += header.width;
    });

    // Header text
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, "bold");
    headers.forEach((header) => {
      doc.text(header.text, header.x + 2, y + 3);
    });

    return y + 15;
  }

  static drawTableRow(doc, visitor, y, index) {
    const width = doc.internal.pageSize.getWidth();
    const headers = [
      { x: 20, width: 25 },
      { x: 45, width: 40 },
      { x: 85, width: 35 },
      { x: 120, width: 30 },
      { x: 150, width: 32 },
      { x: 182, width: 28 },
      { x: 210, width: 32 },
      { x: 242, width: 32 },
    ];

    // Alternating row colors
    if (index % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(20, y, width - 40, 14, "F");
    }

    // Row borders
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.rect(20, y, width - 40, 14);

    // Column separators
    let currentX = 20;
    headers.forEach((header, index) => {
      if (index > 0) {
        doc.line(currentX, y, currentX, y + 14);
      }
      currentX += header.width;
    });

    // Photo
    if (visitor.photo) {
      try {
        doc.addImage(visitor.photo, "JPEG", 22, y + 2, 12, 10);
      } catch (e) {
        this.drawPlaceholderPhoto(doc, 22, y + 2, 12, 10);
      }
    } else {
      this.drawPlaceholderPhoto(doc, 22, y + 2, 12, 10);
    }

    // Text content
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(9);
    doc.setFont(undefined, "normal");

    // Name (bold)
    doc.setFont(undefined, "bold");
    const nameText = doc.splitTextToSize(visitor.name, headers[1].width - 4);
    doc.text(nameText, headers[1].x + 2, y + 7);
    doc.setFont(undefined, "normal");

    // Company
    const companyText = doc.splitTextToSize(
      visitor.company || "N/A",
      headers[2].width - 4
    );
    doc.text(companyText, headers[2].x + 2, y + 7);

    // Phone
    const phoneText = doc.splitTextToSize(visitor.phone, headers[3].width - 4);
    doc.text(phoneText, headers[3].x + 2, y + 7);

    // Purpose
    const purposeText = doc.splitTextToSize(
      visitor.purpose,
      headers[4].width - 4
    );
    doc.text(purposeText, headers[4].x + 2, y + 7);

    // Host
    const hostText = doc.splitTextToSize(visitor.toMeet, headers[5].width - 4);
    doc.text(hostText, headers[5].x + 2, y + 7);

    // Check In
    const checkInTime = new Date(visitor.checkInTime).toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    doc.text(checkInTime, headers[6].x + 2, y + 7);

    // Check Out
    let checkOutText = "Active";
    let checkOutColor = [245, 158, 11]; // Yellow
    if (visitor.checkOutTime) {
      checkOutText = new Date(visitor.checkOutTime).toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      checkOutColor = [34, 197, 94]; // Green
    }
    doc.setTextColor(...checkOutColor);
    doc.text(checkOutText, headers[7].x + 2, y + 7);
    doc.setTextColor(51, 65, 85);

    // Status badge

    return y + 14;
  }

  static drawPlaceholderPhoto(doc, x, y, width, height) {
    doc.setFillColor(229, 231, 235);
    doc.rect(x, y, width, height, "F");
    doc.setDrawColor(156, 163, 175);
    doc.setLineWidth(0.5);
    doc.rect(x, y, width, height);
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(6);
    doc.text("No Photo", x + width / 2, y + height / 2 + 1, {
      align: "center",
    });
  }

  static drawSummaryBox(doc, title, x, y, width, height, items) {
    // Box background
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, width, height, 5, 5, "F");

    // Box border
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, width, height, 5, 5);

    // Title
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text(title, x + 8, y + 12);

    // Items
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");

    items.forEach((item, index) => {
      doc.text(`• ${item}`, x + 8, y + 25 + index * 8);
    });
  }

  static drawAnalyticsSection(doc, title, x, y, data) {
    doc.setTextColor(30, 58, 138);
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text(title, x, y);

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");

    let itemY = y + 10;
    Object.entries(data).forEach(([key, value]) => {
      doc.text(`${key}: ${value}`, x + 10, itemY);
      itemY += 6;
    });
  }

  static drawSecurityInsights(doc, x, y, insights) {
    doc.setTextColor(239, 68, 68); // Red for security
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.text("Security Insights", x, y);

    doc.setTextColor(51, 65, 85);
    doc.setFontSize(10);
    doc.setFont(undefined, "normal");

    let insightY = y + 10;
    insights.forEach((insight) => {
      doc.text(`• ${insight}`, x + 10, insightY);
      insightY += 6;
    });
  }

  static addFooter(doc, pageNumber, section) {
    const width = doc.internal.pageSize.getWidth();
    const y = 200;

    // Footer line
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(20, y - 5, width - 20, y - 5);

    // Footer content
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont(undefined, "normal");

    doc.text("Visitor Management System - Confidential Report", 20, y);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, y + 4);
    doc.text(`Page ${pageNumber}`, width - 20, y, { align: "right" });
    doc.text(section, width - 20, y + 4, { align: "right" });
  }

  static updatePageNumbers(doc) {
    const totalPages = doc.internal.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      // Update page numbers if needed (already handled in addFooter)
    }
  }

  // Helper functions
  static formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  static generateFileName(fromDate, toDate, purposeFilter) {
    const today = new Date().toISOString().split("T")[0];
    const dateRange = fromDate && toDate ? `_${fromDate}_to_${toDate}` : "";
    const purposeSuffix = purposeFilter
      ? `_${purposeFilter.replace(/\s+/g, "-")}`
      : "";
    return `visitor-report${dateRange}${purposeSuffix}_${today}.pdf`;
  }

  static analyzeVisitTimes(visitors) {
    const hours = visitors.map((v) => new Date(v.checkInTime).getHours());
    const hourCounts = {};
    hours.forEach((hour) => {
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHour =
      Object.entries(hourCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A";

    const durations = visitors
      .filter((v) => v.checkOutTime)
      .map(
        (v) =>
          (new Date(v.checkOutTime) - new Date(v.checkInTime)) / (1000 * 60)
      );

    const avgDuration =
      durations.length > 0
        ? Number((durations.reduce((a, b) => a + b, 0) / durations.length).toFixed(2))
        : 0;

    return {
      peakHour: peakHour !== "N/A" ? `${peakHour}:00` : "N/A",
      avgDuration: `${avgDuration.toFixed(2)} minutes`,
      longestVisit:
        durations.length > 0 ? `${Math.max(...durations).toFixed(2)} minutes` : "N/A",
      shortestVisit:
        durations.length > 0 ? `${Math.min(...durations).toFixed(2)} minutes` : "N/A",
    };
  }

  static analyzeDailyPattern(visitors) {
    const dailyCounts = {};
    visitors.forEach((v) => {
      const date = new Date(v.checkInTime).toDateString();
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    const counts = Object.values(dailyCounts);
    const avgDaily =
      counts.length > 0
        ? Math.round(counts.reduce((a, b) => a + b, 0) / counts.length)
        : 0;
    const peakDay = Object.entries(dailyCounts).sort(
      ([, a], [, b]) => b - a
    )[0];

    return {
      "Average Daily Visitors": avgDaily,
      "Peak Day": peakDay ? `${peakDay[0]} (${peakDay[1]} visitors)` : "N/A",
      "Total Days": Object.keys(dailyCounts).length,
    };
  }

  static analyzeWeeklyPattern(visitors) {
    const weekdays = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const weekdayCounts = {};

    visitors.forEach((v) => {
      const dayOfWeek = weekdays[new Date(v.checkInTime).getDay()];
      weekdayCounts[dayOfWeek] = (weekdayCounts[dayOfWeek] || 0) + 1;
    });

    const peakWeekday = Object.entries(weekdayCounts).sort(
      ([, a], [, b]) => b - a
    )[0];

    return {
      "Peak Weekday": peakWeekday
        ? `${peakWeekday[0]} (${peakWeekday[1]} visitors)`
        : "N/A",
      "Weekday Distribution": Object.entries(weekdayCounts)
        .map(([day, count]) => `${day}: ${count}`)
        .join(", "),
    };
  }

  static generateSecurityInsights(visitors) {
    const insights = [];
    const activeVisitors = visitors.filter((v) => v.status === "active");

    if (activeVisitors.length > 0) {
      insights.push(`${activeVisitors.length} visitors currently on premises`);
    }

    const longDurationVisits = visitors.filter((v) => {
      if (!v.checkOutTime) return false;
      const duration =
        (new Date(v.checkOutTime) - new Date(v.checkInTime)) / (1000 * 60 * 60);
      return duration > 8; // More than 8 hours
    });

    if (longDurationVisits.length > 0) {
      insights.push(
        `${longDurationVisits.length} visits exceeded 8 hours duration`
      );
    }

    const frequentVisitors = {};
    visitors.forEach((v) => {
      const key = `${v.name}-${v.phone}`;
      frequentVisitors[key] = (frequentVisitors[key] || 0) + 1;
    });

    const frequent = Object.entries(frequentVisitors).filter(
      ([, count]) => count > 5
    ).length;

    if (frequent > 0) {
      insights.push(`${frequent} visitors have made more than 5 visits`);
    }

    if (insights.length === 0) {
      insights.push("No security concerns identified");
    }

    return insights;
  }
}

// Usage: Replace your existing PDFManager.generatePDF() call with:
// ProfessionalPDFManager.generatePDF();
