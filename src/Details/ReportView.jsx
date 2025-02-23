import React, { useState, useEffect } from "react";
import { db } from "../Firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useParams, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import "react-toastify/dist/ReactToastify.css";
import "./ReportView.css";
import { useNavigate } from "react-router-dom";

function ReportView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    const docRef = doc(db, "Reports", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setReport({ id: docSnap.id, ...docSnap.data() });
    } else {
      toast.error("Report not found");
    }
  };

  // Utility function to format YYYY-MM to MMM-YYYY
  const formatDate = (dateString) => {
    const [year, month] = dateString.split("-");
    const date = new Date(year, month - 1); // Month is 0-indexed in JavaScript Date
    return date.toLocaleString("default", { month: "short", year: "numeric" });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(40, 53, 147);
    doc.text(`${report.staff} - ${report.doctorName}`, 20, 20);
  
    // Add status circle
    const statusColor = getStatusColor(report.status);
    doc.setFillColor(statusColor);
    doc.circle(190, 15, 2, "F");
  
    let startY = 25;
    const tableWidth = 170; // Page width with margins
  
    const addSectionHeader = (text) => {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFillColor(211, 211, 211);
      doc.rect(20, startY, tableWidth, 10, "F");
      doc.text(text, 25, startY + 7);
      startY += 10;
    };
  
    const addTable = (data) => {
      doc.autoTable({
        startY: startY,
        body: data,
        alternateRowStyles: { fillColor: [245, 245, 245] },
        styles: { cellPadding: 2, fontSize: 10, valign: "middle" },
        columnStyles: {
          0: { cellWidth: 60, fillColor: [240, 240, 240], textColor: [0, 0, 0] },
          1: { cellWidth: "auto", fillColor: [255, 255, 255], textColor: [0, 0, 0] },
        },
        margin: { left: 20, right: 20 },
      });
      startY = doc.autoTable.previous.finalY + 5;
    };
  
    // General Information
    addSectionHeader("General Information");
    addTable([
      ["Report Year", report.reportOfYear],
      ["Staff", report.staff],
      ["Status", report.status],
      ["Customer Name", report.doctorName],
      ["Area", report.area],
      ["Headquarters", report.headquarters],
    ]);
  
    // Activity Details
    addSectionHeader("Activity Details");
    addTable([
      ["Activity Month", report.activityMonth],
      ["Activity Amount", report.activityAmount],
      ["Target Times", report.targetedTimes],
    ]);
  
    // Monthly Sales
    if (report.dynamicFields) {
      addSectionHeader("Monthly Sales");
  
      const allMonths = Array.from({ length: 12 }, (_, i) => {
        const date = new Date(report.reportOfYear, i, 1);
        return date.toLocaleString("en-US", { month: "short" }) + "-" + report.reportOfYear; // "Jan-2024"
      });
  
      const monthlySalesMap = report.dynamicFields.reduce((acc, field) => {
        const fieldDate = new Date(field.date);
        const monthKey = fieldDate.toLocaleString("en-US", { month: "short" }) + "-" + fieldDate.getFullYear();
        acc[monthKey] = field.amount;
        return acc;
      }, {});
  
      const monthlySalesData = allMonths.map((month) => [
        month,
        monthlySalesMap[month] || "N/A",
      ]);
  
      addTable(monthlySalesData);
    }
  
    // Product Items
    addSectionHeader("Product Items");
    if (report.targetedProducts?.length > 0) {
      addTable([["Products", report.targetedProducts.join(", ")]]);
    }
  
    // Total Business
    addSectionHeader("Total Business");
    addTable([
      ["Total Business", report.totalBusiness],
      ["Expected Amount", report.expectedAmount],
      ["Percentage", `${Math.round(report.percentage * 100) / 100}%`],
    ]);
  
    doc.save(`Report_${report.staff}.pdf`);
  };
  

  const exportToExcel = () => {
    // Generate all months in order (Jan-Dec)
    const allMonths = Array.from({ length: 12 }, (_, i) => {
      const date = new Date(report.reportOfYear, i);
      return date.toLocaleString("en-US", { month: "short" }) + "-" + report.reportOfYear; // "Jan-2024"
    });
  
    // Create monthly sales data
    const monthlySales = {};
    allMonths.forEach(month => {
      const found = report.dynamicFields?.find(field => {
        const fieldDate = new Date(field.date);
        return (
          fieldDate.toLocaleString("en-US", { month: "short" }) + "-" + fieldDate.getFullYear() === month
        );
      });
      monthlySales[month] = found ? found.amount : "N/A";
    });
  
    // Construct worksheet data
    const worksheetData = {
      "Report Year": report.reportOfYear,
      "Staff": report.staff,
      "HQ": report.headquarters,
      "Customer Name": report.doctorName,
      "Area": report.area,
      "Activity Month": report.activityMonth,
      "Activity Day": report.activityDay,
      "Activity Amount": report.activityAmount,
      ...(report.targetedProducts && { "Products": report.targetedProducts.join(", ") }),
      "Targeted Times": report.targetedTimes,
      "Last Year Amount": report.lastYearAmount,
      ...monthlySales, // Monthly sales as columns (Jan-Dec)
      "Total Business": report.totalBusiness,
      "Percentage": `${Math.round(report.percentage * 100) / 100}%`
,
      "Expected Amount": report.expectedAmount,
      "Status": report.status,
    };
  
    const worksheet = XLSX.utils.json_to_sheet([worksheetData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
  
    // Style headers
    const headerRange = XLSX.utils.decode_range(worksheet["!ref"]);
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = {
        fill: { fgColor: { rgb: "283593" } }, // Dark blue background
        font: { color: { rgb: "FFFFFF" }, bold: true }, // White text, bold
      };
    }
  
    // Auto-format columns
    const colWidths = [];
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
      let maxLength = 0;
      const headerCell = XLSX.utils.encode_cell({ r: 0, c: C });
      maxLength = worksheet[headerCell].v.length;
      colWidths.push({ wch: maxLength + 2 }); // Add padding
    }
    worksheet["!cols"] = colWidths;
  
    XLSX.writeFile(workbook, `Report_${report.staff}.xlsx`);
  };
  

  const getStatusColor = (status) => {
    switch (status) {
      case "Very Good":
        return "green";
      case "Good":
        return "yellow";
      case "Bad":
        return "orange";
      case "Very Bad":
        return "red";
      default:
        return "blue";
    }
  };

  if (!report)
    return (
      <div>
        <div className="loading-container">
          <img src="https://i.pinimg.com/originals/65/ba/48/65ba488626025cff82f091336fbf94bb.gif" alt="" />
        </div>
      </div>
    );

  return (
    <div className="view-report-container">
      <ToastContainer />
      <button onClick={() => navigate(-1)} className="back-button">
        <i className="bi bi-arrow-left" style={{ color: "#d6e8ee" }}></i>
      </button>
      <h1>
        {report.doctorName} , STAFF - {report.staff}
      </h1>
      <table className="report-table">
        <thead>
          <tr>
            <th className="bg-info first">Field</th>
            <th className="bg-info first2">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Report Year</td>
            <td>{report.reportOfYear}</td>
          </tr>
          <tr>
            <td>Staff</td>
            <td>{report.staff}</td>
          </tr>
          <tr>
            <td>Status</td>
            <td className="Staus-btn">
              <button
                className="disable"
                style={{ backgroundColor: getStatusColor(report.status) }}
                title={report.status}
              ></button>
            </td>
          </tr>
          <tr>
            <td>Customer Name</td>
            <td>{report.doctorName}</td>
          </tr>
          <tr>
            <td>Area</td>
            <td>{report.area}</td>
          </tr>
          <tr>
            <td>Headquarters</td>
            <td>{report.headquarters}</td>
          </tr>

          <tr>
            <td colSpan="2" className="bg-info">
              <strong>Activity Details</strong>
            </td>
          </tr>
          <tr>
            <td>Activity Month</td>
            <td>{report.activityMonth}</td>
          </tr>
          <tr>
            <td>Activity Amount</td>
            <td>{report.activityAmount}</td>
          </tr>
          <tr>
            <td>Target Times</td>
            <td>{report.targetedTimes}</td>
          </tr>

          {report.dynamicFields && (
  <>
    <tr>
      <td colSpan="2" className="bg-info">
        <strong>Monthly Sales</strong>
      </td>
    </tr>
    {Array.from({ length: 12 }, (_, i) => {
      const date = new Date(report.reportOfYear, i, 1);
      const monthKey = date.toLocaleString("en-US", { month: "short" }) + "-" + report.reportOfYear; // "Jan-2024"
      
      const monthData = report.dynamicFields.find((field) => {
        const fieldDate = new Date(field.date);
        return (
          fieldDate.toLocaleString("en-US", { month: "short" }) + "-" + fieldDate.getFullYear() === monthKey
        );
      });

      return (
        <tr key={monthKey}>
          <td>{monthKey}</td>
          <td>{monthData ? monthData.amount : "N/A"}</td>
        </tr>
      );
    })}
  </>
)}



          <tr>
            <td colSpan="2" className="bg-info">
              <strong>Product Items</strong>
            </td>
          </tr>
          {report.targetedProducts && (
            <tr>
              <td>Products</td>
              <td>{report.targetedProducts.join(", ")}</td>
            </tr>
          )}

          <tr>
            <td colSpan="2" className="bg-info">
              <strong>Total Business</strong>
            </td>
          </tr>
          <tr>
            <td>Total Business</td>
            <td>{report.totalBusiness}</td>
          </tr>
          <tr>
            <td>Expected Amount</td>
            <td>{report.expectedAmount}</td>
          </tr>
          <tr>
            <td>Percentage</td>
            <td>{Math.round(report.percentage * 100) / 100} %</td>
          </tr>
          <tr>
            <td>Activity Status</td>
            <td>{report.status}</td>
          </tr>
          <tr>
            <td className="last">Status</td>
            <td className="last2 Staus-btn">
              <button
                style={{ backgroundColor: getStatusColor(report.status) }}
                title={report.status}
              />
            </td>
          </tr>
        </tbody>
      </table>
      <div className="actions">
        <button onClick={exportToPDF} className="export-btn">
          Download PDF
        </button>
        <button onClick={exportToExcel} className="export-btn">
          Download Excel
        </button>
        <button className="export-btn">
          <Link to={`/main/update-report/${report.id}`} className="export-btn">
            Update
          </Link>
        </button>
      </div>
    </div>
  );
}

export default ReportView;