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
  FaTimes,
  FaMoneyBillWave,
  FaReceipt
} from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

const CommissionReport = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [restaurantCommission, setRestaurantCommission] = useState(20);

  // Tax constants
  const GST_RATE = 18;
  const TDS_RATE = 0.5;

  // Filters and search
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Summary data
  const [summary, setSummary] = useState({
    totalOrders: 0,
    totalSubtotal: 0,
    totalCommission: 0,
    totalVendorEarning: 0,
    averageCommissionPercent: 0,
    totalGST: 0,
    totalTDS: 0,
    netPayable: 0
  });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const vendorId = localStorage.getItem("vendorId");

  // Fetch restaurant details to get actual commission
  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      try {
        const res = await fetch(`https://api.vegiffyy.com/api/restaurant/${vendorId}`);
        const data = await res.json();
        if (data.success && data.data) {
          const commission = data.data.commission || 20;
          setRestaurantCommission(commission);
          console.log(`✅ Restaurant commission loaded: ${commission}%`);
        }
      } catch (err) {
        console.error("Error fetching restaurant details:", err);
      }
    };

    if (vendorId) {
      fetchRestaurantDetails();
    }
  }, [vendorId]);

  // Fetch delivered orders and calculate all taxes
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

          // Map orders with ALL calculations
          const processedOrders = deliveredOrders.map((order) => {
            const subTotal = order.subTotal || 0;
            
            // Step 1: Commission to Vegiffy (20% of subtotal)
            const commissionAmount = (subTotal * restaurantCommission) / 100;
            
            // Step 2: GST on commission (18% of commission)
            const gstOnCommission = (commissionAmount * GST_RATE) / 100;
            
            // Step 3: Vendor's gross earning (subtotal - commission)
            const vendorGrossEarning = subTotal - commissionAmount;
            
            // Step 4: TDS on vendor earning (0.5% of vendorGrossEarning)
            const tdsOnVendorEarning = (vendorGrossEarning * TDS_RATE) / 100;
            
            // Step 5: 🔥 FIXED: Net payable = subtotal - commission - GST - TDS
            // Using toFixed(2) and parseFloat to avoid floating point issues
            const netPayable = parseFloat((subTotal - commissionAmount - gstOnCommission - tdsOnVendorEarning).toFixed(2));
            
            return {
              orderId: order._id,
              orderDate: new Date(order.createdAt).toISOString().split("T")[0],
              orderDateTime: new Date(order.createdAt).toLocaleString(),
              customerName: `${order.userId?.firstName || "N/A"} ${order.userId?.lastName || ""}`,
              customerPhone: order.userId?.phoneNumber || "N/A",
              restaurantName: order.restaurantId?.restaurantName || "N/A",
              
              // Order amounts
              subTotal: subTotal,
              deliveryCharge: order.deliveryCharge || 0,
              couponDiscount: order.couponDiscount || 0,
              
              // Commission calculations
              commissionPercent: restaurantCommission,
              commissionAmount: parseFloat(commissionAmount.toFixed(2)),
              
              // Vendor calculations
              vendorGrossEarning: parseFloat(vendorGrossEarning.toFixed(2)),
              
              // Tax calculations
              gstOnCommission: parseFloat(gstOnCommission.toFixed(2)),
              tdsOnVendorEarning: parseFloat(tdsOnVendorEarning.toFixed(2)),
              netPayable: netPayable,
              
              // Payment info
              paymentMethod: order.paymentMethod || "N/A",
              paymentStatus: order.paymentStatus || "N/A",
              status: order.orderStatus,
              raw: order
            };
          });

          setOrders(processedOrders);
          setFilteredOrders(processedOrders);
          
          // Calculate summary with all taxes
          calculateSummary(processedOrders);
        } else {
          setError("API returned unsuccessful response");
        }
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };

    if (restaurantCommission) {
      fetchOrders();
    }
  }, [vendorId, restaurantCommission]);

  // Calculate summary data with all taxes
  const calculateSummary = (orderList) => {
    const totalOrders = orderList.length;
    const totalSubtotal = orderList.reduce((sum, order) => sum + order.subTotal, 0);
    const totalCommission = orderList.reduce((sum, order) => sum + order.commissionAmount, 0);
    const totalVendorGross = orderList.reduce((sum, order) => sum + order.vendorGrossEarning, 0);
    const totalGST = orderList.reduce((sum, order) => sum + order.gstOnCommission, 0);
    const totalTDS = orderList.reduce((sum, order) => sum + order.tdsOnVendorEarning, 0);
    const totalNetPayable = orderList.reduce((sum, order) => sum + order.netPayable, 0);
    
    const averageCommissionPercent = totalSubtotal > 0 
      ? parseFloat((totalCommission / totalSubtotal * 100).toFixed(2))
      : 0;

    setSummary({
      totalOrders,
      totalSubtotal: parseFloat(totalSubtotal.toFixed(2)),
      totalCommission: parseFloat(totalCommission.toFixed(2)),
      totalVendorEarning: parseFloat(totalVendorGross.toFixed(2)),
      totalGST: parseFloat(totalGST.toFixed(2)),
      totalTDS: parseFloat(totalTDS.toFixed(2)),
      netPayable: parseFloat(totalNetPayable.toFixed(2)),
      averageCommissionPercent
    });
  };

  // Apply filters
  useEffect(() => {
    let filtered = orders;

    if (startDate && endDate) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.orderDate);
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59);
        return orderDate >= start && orderDate <= end;
      });
    }

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
      
      "Commission %": order.commissionPercent,
      "Commission Amount (₹)": order.commissionAmount,
      
      "Vendor Gross (₹)": order.vendorGrossEarning,
      
      "GST on Commission (₹)": order.gstOnCommission,
      "TDS on Vendor (₹)": order.tdsOnVendorEarning,
      
      "Net Payable to Vendor (₹)": order.netPayable,
      
      "Payment Method": order.paymentMethod,
      "Payment Status": order.paymentStatus,
      "Order Status": order.status
    }));

    // Add summary row
    const summaryRow = {
      "Order ID": "🔴 SUMMARY",
      "Date": "",
      "Customer Name": "",
      "Customer Phone": "",
      "Restaurant": "",
      "Subtotal (₹)": summary.totalSubtotal,
      "Delivery Charge (₹)": "",
      "Coupon Discount (₹)": "",
      "Commission %": summary.averageCommissionPercent,
      "Commission Amount (₹)": summary.totalCommission,
      "Vendor Gross (₹)": summary.totalVendorEarning,
      "GST on Commission (₹)": summary.totalGST,
      "TDS on Vendor (₹)": summary.totalTDS,
      "Net Payable to Vendor (₹)": summary.netPayable,
      "Payment Method": "",
      "Payment Status": "",
      "Order Status": ""
    };

    const ws = XLSX.utils.json_to_sheet([...dataForExport, summaryRow]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "CommissionReport");
    
    XLSX.writeFile(wb, `Commission_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Generate PDF Report
  const generatePDFReport = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(34, 197, 94);
    doc.text("Commission & Tax Report", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 105, 28, { align: "center" });
    
    // Tax Rates Info
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 255);
    doc.text(`Tax Rates: GST @${GST_RATE}% on Commission | TDS @${TDS_RATE}% on Vendor Earnings`, 105, 35, { align: "center" });
    
    // Summary Section
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Summary Report", 20, 48);
    
    doc.setLineWidth(0.5);
    doc.line(20, 51, 190, 51);
    
    let y = 63;
    doc.setFontSize(10);
    
    // Summary table
    const summaryData = [
      ["Total Orders", summary.totalOrders.toString()],
      ["Total Subtotal", `₹${summary.totalSubtotal.toFixed(2)}`],
      ["Total Commission", `₹${summary.totalCommission.toFixed(2)}`],
      ["Total GST", `₹${summary.totalGST.toFixed(2)}`],
      ["Total TDS", `₹${summary.totalTDS.toFixed(2)}`],
      ["NET PAYABLE TO VENDOR", `₹${summary.netPayable.toFixed(2)}`, true]
    ];
    
    summaryData.forEach(([label, value, isBold]) => {
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      if (label.includes("NET")) {
        doc.setTextColor(34, 197, 94);
      } else {
        doc.setTextColor(0, 0, 0);
      }
      doc.text(label, 30, y);
      doc.text(value, 120, y);
      y += 8;
    });
    
    y += 10;
    
    // Detailed Orders
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Order-wise Detailed Calculations", 20, y);
    y += 5;
    doc.setLineWidth(0.3);
    doc.line(20, y, 190, y);
    y += 10;
    
    // Table headers
    const headers = ["Order ID", "Date", "Subtotal", "Comm", "GST", "Vendor Gross", "TDS", "Net"];
    let x = 20;
    headers.forEach(header => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text(header, x, y);
      x += header === "Order ID" ? 25 : 18;
    });
    
    y += 7;
    doc.line(20, y, 190, y);
    y += 5;
    
    // Order rows
    filteredOrders.slice(0, 20).forEach((order, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      x = 20;
      const rowData = [
        order.orderId.substring(0, 6) + "...",
        order.orderDate.substring(5),
        `₹${order.subTotal.toFixed(2)}`,
        `₹${order.commissionAmount.toFixed(2)}`,
        `₹${order.gstOnCommission.toFixed(2)}`,
        `₹${order.vendorGrossEarning.toFixed(2)}`,
        `₹${order.tdsOnVendorEarning.toFixed(2)}`,
        `₹${order.netPayable.toFixed(2)}`
      ];
      
      rowData.forEach((cell, cellIndex) => {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(6);
        
        // Color coding
        if (cellIndex === 3) doc.setTextColor(220, 38, 38);
        else if (cellIndex === 4) doc.setTextColor(59, 130, 246);
        else if (cellIndex === 5) doc.setTextColor(34, 197, 94);
        else if (cellIndex === 6) doc.setTextColor(249, 115, 22);
        else if (cellIndex === 7) doc.setTextColor(0, 0, 0);
        else doc.setTextColor(0, 0, 0);
        
        doc.text(cell, x, y);
        x += cellIndex === 0 ? 25 : 18;
      });
      
      y += 5;
    });
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`Page 1 • Total Orders: ${filteredOrders.length} • Commission Rate: ${restaurantCommission}% • GST: ${GST_RATE}% • TDS: ${TDS_RATE}%`, 105, 285, { align: "center" });
    
    doc.save(`Tax_Report_${new Date().toISOString().split('T')[0]}.pdf`);
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
        <p className="mt-4 text-gray-600">Loading commission & tax report...</p>
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
                Commission & Tax Report
              </h1>
              <p className="text-gray-600">
                Complete financial breakdown with GST and TDS calculations
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

        {/* Tax Rates Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <FaPercentage className="text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Commission Rate</p>
                <p className="text-xl font-bold text-green-700">{restaurantCommission}%</p>
                <p className="text-xs text-gray-500">on Subtotal</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <FaReceipt className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">GST on Commission</p>
                <p className="text-xl font-bold text-blue-700">{GST_RATE}%</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                <FaMoneyBillWave className="text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">TDS on Earnings</p>
                <p className="text-xl font-bold text-orange-700">{TDS_RATE}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards - Full Grid */}
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
              <h3 className="text-sm font-medium text-gray-500">Total Subtotal</h3>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <FaRupeeSign className="text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-800">₹{summary.totalSubtotal.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Base amount</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-red-500">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500">Total Commission</h3>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <FaPercentage className="text-red-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-red-600">₹{summary.totalCommission.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">{restaurantCommission}% of subtotal</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-yellow-500">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500">Total GST</h3>
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <FaReceipt className="text-yellow-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-yellow-600">₹{summary.totalGST.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">{GST_RATE}% on commission</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-orange-500">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500">Total TDS</h3>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <FaMoneyBillWave className="text-orange-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-orange-600">₹{summary.totalTDS.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">{TDS_RATE}% on earnings</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-purple-500">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500">Vendor Gross</h3>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <FaRupeeSign className="text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-purple-600">₹{summary.totalVendorEarning.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">Before TDS</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-emerald-500 lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-500 flex items-center">
                <FaMoneyBillWave className="mr-2 text-emerald-600" />
                NET PAYABLE TO YOU
              </h3>
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                <FaRupeeSign className="text-emerald-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-emerald-600">₹{summary.netPayable.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mt-1">After all deductions</p>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Search Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Orders
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by order ID, customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            {/* Quick Filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Filters
              </label>
              <div className="flex gap-2">
                <button
                  onClick={setLast7Days}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  7 Days
                </button>
                <button
                  onClick={setCurrentMonth}
                  className="flex-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  This Month
                </button>
              </div>
            </div>
          </div>

          {(startDate || endDate || searchTerm) && (
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-full hover:bg-red-200"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-600">
            Showing {filteredOrders.length} orders
          </p>
          <span className="text-xs text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>

        {/* Main Table - Full Grid */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Subtotal
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    GST
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Vendor Gross
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    TDS
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Net Payable
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-gray-500">
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
                    <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 space-y-1">
                          <div className="font-medium">#{order.orderId.substring(0, 8)}</div>
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
                        <div className="text-sm font-semibold">₹{order.subTotal.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm space-y-1">
                          <div className="font-semibold text-red-600">₹{order.commissionAmount.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">
                            {order.commissionPercent}%
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-blue-600">₹{order.gstOnCommission.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-purple-600">₹{order.vendorGrossEarning.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-orange-600">-₹{order.tdsOnVendorEarning.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-bold text-green-600">₹{order.netPayable.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => openCalculationModal(order)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View full calculation"
                        >
                          <FaEye />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detailed Calculation Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                <FaCalculator className="inline mr-2 text-blue-600" />
                Complete Financial Breakdown
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <FaTimes />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Order #{selectedOrder.orderId}</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Date: {selectedOrder.orderDateTime}</div>
                  <div>Customer: {selectedOrder.customerName}</div>
                  <div>Phone: {selectedOrder.customerPhone}</div>
                  <div>Restaurant: {selectedOrder.restaurantName}</div>
                </div>
              </div>

              {/* Calculation Steps */}
              <div className="space-y-4">
                {/* Step 1: Subtotal */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h5 className="font-medium text-gray-700 mb-3">1. Base Amount</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-bold">Subtotal:</span>
                      <span className="font-bold text-lg">₹{selectedOrder.subTotal.toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">This is the ONLY amount used for all calculations</div>
                  </div>
                </div>

                {/* Step 2: Commission */}
                <div className="border rounded-lg p-4 bg-red-50">
                  <h5 className="font-medium text-gray-700 mb-3">2. Commission to Vegiffy</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Commission Rate:</span>
                      <span className="font-medium">{selectedOrder.commissionPercent}% of subtotal</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Calculation:</span>
                      <span>₹{selectedOrder.subTotal.toFixed(2)} × {selectedOrder.commissionPercent}%</span>
                    </div>
                    <div className="flex justify-between font-medium text-red-600">
                      <span>Commission Amount:</span>
                      <span>₹{selectedOrder.commissionAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Step 3: GST on Commission */}
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h5 className="font-medium text-gray-700 mb-3">3. GST on Commission</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>GST Rate:</span>
                      <span className="font-medium">{GST_RATE}% of commission</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Calculation:</span>
                      <span>₹{selectedOrder.commissionAmount.toFixed(2)} × {GST_RATE}%</span>
                    </div>
                    <div className="flex justify-between font-medium text-blue-600">
                      <span>GST Amount:</span>
                      <span>₹{selectedOrder.gstOnCommission.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Step 4: Vendor Gross */}
                <div className="border rounded-lg p-4 bg-purple-50">
                  <h5 className="font-medium text-gray-700 mb-3">4. Vendor Gross Earning</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{selectedOrder.subTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Less: Commission:</span>
                      <span>-₹{selectedOrder.commissionAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium text-purple-600">
                      <span>Gross Earning:</span>
                      <span>₹{selectedOrder.vendorGrossEarning.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Step 5: TDS */}
                <div className="border rounded-lg p-4 bg-orange-50">
                  <h5 className="font-medium text-gray-700 mb-3">5. TDS Deduction</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>TDS Rate:</span>
                      <span className="font-medium">{TDS_RATE}% of vendor gross</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Calculation:</span>
                      <span>₹{selectedOrder.vendorGrossEarning.toFixed(2)} × {TDS_RATE}%</span>
                    </div>
                    <div className="flex justify-between font-medium text-orange-600">
                      <span>TDS Amount:</span>
                      <span>-₹{selectedOrder.tdsOnVendorEarning.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Final Net Payable */}
                <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50">
                  <h5 className="font-medium text-gray-700 mb-3">6. FINAL NET PAYABLE TO YOU</h5>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{selectedOrder.subTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-600">
                      <span>Less: Commission:</span>
                      <span>-₹{selectedOrder.commissionAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-blue-600">
                      <span>Less: GST on Commission:</span>
                      <span>-₹{selectedOrder.gstOnCommission.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-orange-600">
                      <span>Less: TDS:</span>
                      <span>-₹{selectedOrder.tdsOnVendorEarning.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-2xl text-green-600 pt-2 border-t">
                      <span>NET PAYABLE:</span>
                      <span>₹{selectedOrder.netPayable.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium mb-2">Summary for this Order:</h5>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="font-bold">Subtotal:</div>
                    <div className="font-bold">₹{selectedOrder.subTotal.toFixed(2)}</div>
                    <div>Vegiffy Commission:</div>
                    <div className="text-red-600">-₹{selectedOrder.commissionAmount.toFixed(2)}</div>
                    <div>GST to Govt:</div>
                    <div className="text-blue-600">-₹{selectedOrder.gstOnCommission.toFixed(2)}</div>
                    <div>TDS to Govt:</div>
                    <div className="text-orange-600">-₹{selectedOrder.tdsOnVendorEarning.toFixed(2)}</div>
                    <div className="border-t pt-1 font-bold">You Receive:</div>
                    <div className="border-t pt-1 font-bold text-green-600">₹{selectedOrder.netPayable.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t p-4 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
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