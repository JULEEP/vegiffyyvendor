import React, { useEffect, useState } from "react";
import {
  FaFileExcel,
  FaFilePdf,
  FaSearch,
  FaCalendarAlt,
  FaRupeeSign,
  FaPercentage,
  FaCalculator,
  FaChartLine,
  FaEye,
  FaTimes
} from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

const CommissionReport = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters and search
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Summary data
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalSales: 0,
    totalCommission: 0,
    totalVendorEarning: 0,
    averageCommissionPercent: 0
  });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const vendorId = localStorage.getItem("vendorId");

  // Fetch delivered orders and calculate commission
  useEffect(() => {
    if (!vendorId) {
      setError("Vendor ID not found in localStorage");
      return;
    }

    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`https://api.vegiffyy.com/api/vendor/restaurantorders/${vendorId}`);
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        
        if (data.success) {
          // Filter only delivered orders
          const deliveredOrders = data.data.filter(order => 
            order.orderStatus === "Delivered" || 
            order.orderStatus === "delivered"
          );

          // Map orders with commission calculation
          const processedOrders = deliveredOrders.map((order) => {
            // Get commission percentage (from restaurant data or default 15%)
            const commissionPercent = order.restaurantId?.commission || 15;
            
            // Calculate commission amount
            const subTotal = order.subTotal || 0;
            const commissionAmount = (subTotal * commissionPercent) / 100;
            
            // Calculate vendor earning (order total - commission)
            const totalPayable = order.totalPayable || 0;
            const vendorEarning = totalPayable - commissionAmount;
            
            return {
              orderId: order._id,
              orderDate: new Date(order.createdAt).toISOString().split("T")[0],
              orderDateTime: new Date(order.createdAt).toLocaleString(),
              customerName: `${order.userId?.firstName || "N/A"} ${order.userId?.lastName || ""}`,
              customerPhone: order.userId?.phoneNumber || "N/A",
              restaurantName: order.restaurantId?.restaurantName || "N/A",
              subTotal: subTotal,
              deliveryCharge: order.deliveryCharge || 0,
              couponDiscount: order.couponDiscount || 0,
              totalPayable: totalPayable,
              commissionPercent: commissionPercent,
              commissionAmount: parseFloat(commissionAmount.toFixed(2)),
              vendorEarning: parseFloat(vendorEarning.toFixed(2)),
              paymentMethod: order.paymentMethod || "N/A",
              paymentStatus: order.paymentStatus || "N/A",
              status: order.orderStatus,
              raw: order
            };
          });

          setOrders(processedOrders);
          setFilteredOrders(processedOrders);
          
          // Calculate summary
          calculateSummary(processedOrders);
        } else {
          setError("API returned unsuccessful response");
        }
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };

    fetchOrders();
  }, [vendorId]);

  // Calculate summary data
  const calculateSummary = (orderList) => {
    const totalOrders = orderList.length;
    const totalSales = orderList.reduce((sum, order) => sum + order.totalPayable, 0);
    const totalCommission = orderList.reduce((sum, order) => sum + order.commissionAmount, 0);
    const totalVendorEarning = orderList.reduce((sum, order) => sum + order.vendorEarning, 0);
    const averageCommissionPercent = totalOrders > 0 
      ? parseFloat((totalCommission / totalSales * 100).toFixed(2))
      : 0;

    setSummary({
      totalOrders,
      totalSales: parseFloat(totalSales.toFixed(2)),
      totalCommission: parseFloat(totalCommission.toFixed(2)),
      totalVendorEarning: parseFloat(totalVendorEarning.toFixed(2)),
      averageCommissionPercent
    });
  };

  // Apply filters
  useEffect(() => {
    let filtered = orders;

    // Apply date range filter
    if (startDate && endDate) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59); // Include full end date
        return orderDate >= start && orderDate <= end;
      });
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderId.toLowerCase().includes(term) ||
        order.customerName.toLowerCase().includes(term) ||
        order.customerPhone.includes(term) ||
        order.restaurantName.toLowerCase().includes(term)
      );
    }

    setFilteredOrders(filtered);
    calculateSummary(filtered);
  }, [orders, startDate, endDate, searchTerm]);

  // View calculation modal
  const openCalculationModal = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  // Download Excel Report
  const downloadExcel = () => {
    const dataForExport = filteredOrders.map(order => ({
      "Order ID": order.orderId,
      "Date": order.orderDate,
      "Customer Name": order.customerName,
      "Customer Phone": order.customerPhone,
      "Restaurant": order.restaurantName,
      "Subtotal (₹)": order.subTotal,
      "Delivery Charge (₹)": order.deliveryCharge,
      "Coupon Discount (₹)": order.couponDiscount,
      "Total Payable (₹)": order.totalPayable,
      "Commission %": order.commissionPercent,
      "Commission Amount (₹)": order.commissionAmount,
      "Vendor Earning (₹)": order.vendorEarning,
      "Payment Method": order.paymentMethod,
      "Payment Status": order.paymentStatus,
      "Order Status": order.status
    }));

    // Add summary row
    const summaryRow = {
      "Order ID": "SUMMARY",
      "Date": "",
      "Customer Name": "",
      "Customer Phone": "",
      "Restaurant": "",
      "Subtotal (₹)": summary.totalSales,
      "Delivery Charge (₹)": "",
      "Coupon Discount (₹)": "",
      "Total Payable (₹)": "",
      "Commission %": summary.averageCommissionPercent,
      "Commission Amount (₹)": summary.totalCommission,
      "Vendor Earning (₹)": summary.totalVendorEarning,
      "Payment Method": "",
      "Payment Status": "",
      "Order Status": ""
    };

    const ws = XLSX.utils.json_to_sheet([...dataForExport, summaryRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CommissionReport");
    
    // Style summary row
    if (ws["!ref"]) {
      const range = XLSX.utils.decode_range(ws["!ref"]);
      const summaryRowNum = range.e.r + 1;
      ws[`A${summaryRowNum}`].s = { font: { bold: true, color: { rgb: "FF0000" } } };
      ws[`K${summaryRowNum}`].s = { font: { bold: true, color: { rgb: "FF0000" } } };
      ws[`L${summaryRowNum}`].s = { font: { bold: true, color: { rgb: "FF0000" } } };
    }

    XLSX.writeFile(wb, `Commission_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Generate PDF Report
  const generatePDFReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(34, 197, 94); // Green color
    doc.text("Commission Report", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 105, 28, { align: "center" });
    
    // Summary Section
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Summary Report", 20, 45);
    
    doc.setLineWidth(0.5);
    doc.line(20, 48, 190, 48);
    
    let y = 60;
    doc.setFontSize(10);
    
    // Summary table
    const summaryData = [
      ["Total Orders", summary.totalOrders.toString()],
      ["Total Sales", `₹${summary.totalSales.toFixed(2)}`],
      ["Total Commission", `₹${summary.totalCommission.toFixed(2)}`],
      ["Total Vendor Earning", `₹${summary.totalVendorEarning.toFixed(2)}`],
      ["Average Commission %", `${summary.averageCommissionPercent}%`]
    ];
    
    summaryData.forEach(([label, value], index) => {
      doc.setFont("helvetica", "bold");
      doc.text(label, 30, y);
      doc.setFont("helvetica", "normal");
      doc.text(value, 80, y);
      y += 10;
    });
    
    y += 10;
    
    // Detailed Orders
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Order-wise Commission Details", 20, y);
    y += 5;
    doc.setLineWidth(0.3);
    doc.line(20, y, 190, y);
    y += 10;
    
    // Table headers
    const headers = ["Order ID", "Date", "Total (₹)", "Comm %", "Comm Amt (₹)", "Vendor (₹)"];
    let x = 20;
    headers.forEach(header => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(header, x, y);
      x += header === "Order ID" ? 30 : 28;
    });
    
    y += 8;
    doc.line(20, y, 190, y);
    y += 5;
    
    // Order rows
    doc.setFontSize(7);
    filteredOrders.slice(0, 25).forEach((order, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      x = 20;
      const rowData = [
        order.orderId.substring(0, 8) + "...",
        order.orderDate,
        order.totalPayable.toFixed(2),
        order.commissionPercent + "%",
        order.commissionAmount.toFixed(2),
        order.vendorEarning.toFixed(2)
      ];
      
      rowData.forEach((cell, cellIndex) => {
        doc.setFont("helvetica", "normal");
        if (cellIndex === 3 || cellIndex === 4) {
          doc.setTextColor(220, 38, 38); // Red for commission
        } else if (cellIndex === 5) {
          doc.setTextColor(34, 197, 94); // Green for vendor earning
        } else {
          doc.setTextColor(0, 0, 0);
        }
        doc.text(cell, x, y);
        x += cellIndex === 0 ? 30 : 28;
      });
      
      y += 8;
      
      // Add separator line
      if (index < filteredOrders.slice(0, 25).length - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.line(20, y, 190, y);
        y += 5;
      }
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Page 1 of 1 • Total Orders: ${filteredOrders.length}`, 105, 285, { align: "center" });
    
    doc.save(`Commission_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Clear all filters
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSearchTerm("");
  };

  // Get current month range
  const setCurrentMonth = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  };

  // Set last 7 days
  const setLast7Days = () => {
    const now = new Date();
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 6);
    
    setStartDate(lastWeek.toISOString().split('T')[0]);
    setEndDate(now.toISOString().split('T')[0]);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading commission report...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border-l-4 border-blue-500">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-4 lg:mb-0">
              <h1 className="text-2xl font-bold text-gray-800 mb-2 flex items-center">
                <FaCalculator className="mr-3 text-blue-600" />
                Commission Report
              </h1>
              <p className="text-gray-600">
                Order-wise commission calculation and earnings summary
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={downloadExcel}
                disabled={filteredOrders.length === 0}
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaFileExcel className="mr-2" />
                Export Excel
              </button>
              <button
                onClick={generatePDFReport}
                disabled={filteredOrders.length === 0}
                className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaFilePdf className="mr-2" />
                Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-blue-500">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">{summary.totalOrders}</span>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{summary.totalOrders}</p>
            <p className="text-xs text-gray-500 mt-1">Delivered orders</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-green-500">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500">Total Sales</h3>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FaRupeeSign className="text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">₹{summary.totalSales.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Gross revenue</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-red-500">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500">Total Commission</h3>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <FaPercentage className="text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">₹{summary.totalCommission.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Paid to Vegiffyy</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-purple-500">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500">Vendor Earning</h3>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <FaRupeeSign className="text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">₹{summary.totalVendorEarning.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Your net income</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-yellow-500">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500">Avg Commission %</h3>
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <FaChartLine className="text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">{summary.averageCommissionPercent}%</p>
            <p className="text-xs text-gray-500 mt-1">Average rate</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search Input */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Orders
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Search by order ID, customer name, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Quick Date Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Filters
              </label>
              <div className="flex gap-2">
                <button
                  onClick={setLast7Days}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  Last 7 Days
                </button>
                <button
                  onClick={setCurrentMonth}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                >
                  This Month
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            {(startDate || endDate || searchTerm) && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-300 hover:bg-red-200 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-500 mr-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredOrders.length} orders with commission calculation
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Commission Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-blue-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Order Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Your Earning
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <FaCalculator className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-lg font-medium text-gray-400 mb-2">
                          {orders.length === 0 ? 'No delivered orders found' : 'No orders match your filters'}
                        </p>
                        <p className="text-sm text-gray-400">
                          Commission report will appear here for delivered orders
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.orderId} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 space-y-1">
                          <div className="font-medium">#{order.orderId}</div>
                          <div className="text-gray-600 text-xs">
                            {order.orderDateTime}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.restaurantName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 space-y-1">
                          <div className="font-medium">{order.customerName}</div>
                          <div className="text-gray-500 text-xs">{order.customerPhone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 space-y-1">
                          <div className="font-semibold text-lg">₹{order.totalPayable.toFixed(2)}</div>
                          <div className="text-gray-600 text-xs space-y-1">
                            <div>Sub: ₹{order.subTotal.toFixed(2)}</div>
                            {order.deliveryCharge > 0 && (
                              <div>Delivery: ₹{order.deliveryCharge.toFixed(2)}</div>
                            )}
                            {order.couponDiscount > 0 && (
                              <div className="text-green-600">Discount: -₹{order.couponDiscount.toFixed(2)}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm space-y-1">
                          <div className="font-semibold text-red-600">₹{order.commissionAmount.toFixed(2)}</div>
                          <div className="text-gray-600 text-xs">
                            {order.commissionPercent}% of subtotal
                          </div>
                          <div className="text-xs text-gray-500">
                            Paid to Vegiffyy
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm space-y-1">
                          <div className="font-semibold text-green-600 text-lg">₹{order.vendorEarning.toFixed(2)}</div>
                          <div className="text-gray-600 text-xs">
                            Your net income
                          </div>
                          <div className="text-xs text-gray-500">
                            {((order.vendorEarning / order.totalPayable) * 100).toFixed(1)}% of total
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            title="View Calculation"
                            onClick={() => openCalculationModal(order)}
                            className="inline-flex items-center p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <FaEye />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Commission Calculation Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                <FaCalculator className="inline mr-2 text-blue-600" />
                Commission Calculation
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl font-bold"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Order Information</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Order ID:</strong> {selectedOrder.orderId}</div>
                  <div><strong>Date:</strong> {selectedOrder.orderDateTime}</div>
                  <div><strong>Customer:</strong> {selectedOrder.customerName}</div>
                  <div><strong>Restaurant:</strong> {selectedOrder.restaurantName}</div>
                </div>
              </div>

              {/* Calculation Breakdown */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">Commission Calculation Breakdown</h4>
                <div className="space-y-3">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center p-3 bg-white rounded border">
                    <div>
                      <div className="font-medium">Subtotal Amount</div>
                      <div className="text-sm text-gray-600">Total value of ordered items</div>
                    </div>
                    <div className="font-semibold text-lg">₹{selectedOrder.subTotal.toFixed(2)}</div>
                  </div>

                  {/* Commission Percentage */}
                  <div className="flex justify-between items-center p-3 bg-white rounded border">
                    <div>
                      <div className="font-medium">Commission Percentage</div>
                      <div className="text-sm text-gray-600">Agreed commission rate</div>
                    </div>
                    <div className="font-semibold text-lg text-red-600">{selectedOrder.commissionPercent}%</div>
                  </div>

                  {/* Commission Calculation Formula */}
                  <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <div className="font-medium text-gray-800 mb-2">Commission Calculation Formula:</div>
                    <div className="text-sm text-gray-700">
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        Subtotal × Commission % = Commission Amount
                      </code>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      ₹{selectedOrder.subTotal.toFixed(2)} × {selectedOrder.commissionPercent}% = ₹{selectedOrder.commissionAmount.toFixed(2)}
                    </div>
                  </div>

                  {/* Commission Amount */}
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded border border-red-200">
                    <div>
                      <div className="font-medium text-red-700">Commission to Vegiffyy</div>
                      <div className="text-sm text-red-600">Amount paid to Vegiffyy platform</div>
                    </div>
                    <div className="font-semibold text-xl text-red-700">₹{selectedOrder.commissionAmount.toFixed(2)}</div>
                  </div>

                  {/* Other Charges */}
                  <div className="space-y-2">
                    {selectedOrder.deliveryCharge > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Delivery Charge:</span>
                        <span className="font-medium">₹{selectedOrder.deliveryCharge.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedOrder.couponDiscount > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <span>Coupon Discount:</span>
                        <span className="font-medium">- ₹{selectedOrder.couponDiscount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Total Payable */}
                  <div className="flex justify-between items-center p-3 bg-white rounded border">
                    <div>
                      <div className="font-medium">Total Order Value</div>
                      <div className="text-sm text-gray-600">Amount paid by customer</div>
                    </div>
                    <div className="font-semibold text-lg">₹{selectedOrder.totalPayable.toFixed(2)}</div>
                  </div>

                  {/* Final Vendor Earning Calculation */}
                  <div className="p-3 bg-green-50 rounded border border-green-200">
                    <div className="font-medium text-gray-800 mb-2">Vendor Earning Calculation:</div>
                    <div className="text-sm text-gray-700 mb-2">
                      <code className="bg-gray-100 px-2 py-1 rounded">
                        Total Payable - Commission Amount = Vendor Earning
                      </code>
                    </div>
                    <div className="text-sm text-gray-600">
                      ₹{selectedOrder.totalPayable.toFixed(2)} - ₹{selectedOrder.commissionAmount.toFixed(2)} = ₹{selectedOrder.vendorEarning.toFixed(2)}
                    </div>
                  </div>

                  {/* Vendor Earning */}
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded border border-green-300">
                    <div>
                      <div className="font-medium text-green-700">Your Net Earning</div>
                      <div className="text-sm text-green-600">Amount received by you</div>
                    </div>
                    <div className="font-semibold text-2xl text-green-700">₹{selectedOrder.vendorEarning.toFixed(2)}</div>
                  </div>

                  {/* Summary */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Commission Share:</span>
                      <span className="font-medium">{((selectedOrder.commissionAmount / selectedOrder.totalPayable) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-1">
                      <span>Your Share:</span>
                      <span className="font-medium">{((selectedOrder.vendorEarning / selectedOrder.totalPayable) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionReport;