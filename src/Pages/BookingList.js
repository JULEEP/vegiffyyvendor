import React, { useEffect, useState } from "react";
import {
  FaEye,
  FaEdit,
  FaTrashAlt,
  FaFileExcel,
  FaFilePdf,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaClock,
  FaUtensils,
  FaBox,
  FaMoneyBillWave,
  FaMapMarkerAlt,
  FaUser
} from "react-icons/fa";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // For modals
  const [viewBooking, setViewBooking] = useState(null);
  const [editBooking, setEditBooking] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [preparationTime, setPreparationTime] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filters and search
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const vendorId = localStorage.getItem("vendorId");

  // Fetch bookings
  useEffect(() => {
    if (!vendorId) {
      setError("Vendor ID not found in localStorage");
      return;
    }

    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`http://31.97.206.144:5051/api/vendor/restaurantorders/${vendorId}`);
        if (!res.ok) throw new Error("Failed to fetch orders");
        const data = await res.json();
        if (data.success) {
          const mappedBookings = data.data.map((order) => {
            const productsDetails = order.products
              ? order.products.map((p) => `${p.name} (Qty: ${p.quantity})`).join(", ")
              : "No products";

            return {
              bookingId: order._id,
              userName: `${order.userId?.firstName || "N/A"} ${order.userId?.lastName || ""}`,
              userEmail: order.userId?.email || "N/A",
              userPhone: order.userId?.phoneNumber || "N/A",
              bookingDate: new Date(order.createdAt).toISOString().split("T")[0],
              bookingDateTime: new Date(order.createdAt).toLocaleString(),
              productName: productsDetails,
              quantity: order.totalItems,
              price: order.subTotal,
              totalAmount: order.totalPayable,
              status: order.orderStatus,
              deliveryCharge: order.deliveryCharge || 0,
              couponDiscount: order.couponDiscount || 0,
              paymentMethod: order.paymentMethod || "N/A",
              paymentStatus: order.paymentStatus || "N/A",
              deliveryBoy: order.deliveryBoyId ? 
                `${order.deliveryBoyId.fullName} (${order.deliveryBoyId.mobileNumber})` : "Not Assigned",
              deliveryAddress: order.deliveryAddress ? 
                `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.postalCode}` : "N/A",
              preparationTime: order.preparationTime || null,
              raw: order,
            };
          });
          setBookings(mappedBookings);
          setFilteredBookings(mappedBookings);
        } else {
          setError("API returned unsuccessful response");
        }
      } catch (err) {
        setError(err.message);
      }
      setLoading(false);
    };

    fetchBookings();
  }, [vendorId]);

  // Apply filters
  useEffect(() => {
    let filtered = bookings;

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter) {
      filtered = filtered.filter(booking => booking.bookingDate === dateFilter);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.bookingId.toLowerCase().includes(term) ||
        booking.userName.toLowerCase().includes(term) ||
        booking.userEmail.toLowerCase().includes(term) ||
        booking.userPhone.includes(term) ||
        booking.productName.toLowerCase().includes(term) ||
        booking.status.toLowerCase().includes(term) ||
        booking.paymentMethod.toLowerCase().includes(term)
      );
    }

    setFilteredBookings(filtered);
  }, [bookings, statusFilter, dateFilter, searchTerm]);

  const getStatusClass = (status) => {
    switch (status) {
      case "Accepted":
        return "bg-green-100 text-green-600 border border-green-500";
      case "Pending":
        return "bg-yellow-100 text-yellow-600 border border-yellow-500";
      case "Rejected":
        return "bg-red-100 text-red-600 border border-red-500";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-500";
    }
  };

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredBookings);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");
    XLSX.writeFile(wb, "BookingList.xlsx");
  };

  const generateInvoicePDF = (booking) => {
    const doc = new jsPDF({
      unit: "mm",
      format: [80, 200],
    });

    const startX = 5;
    let y = 10;

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("📦 Order Invoice", startX, y);
    y += 8;

    doc.setLineWidth(0.3);
    doc.line(startX, y, 75, y);
    y += 6;

    // Booking info
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Order ID: ${booking.bookingId}`, startX, y);
    y += 6;
    doc.text(`Customer: ${booking.userName}`, startX, y);
    y += 6;
    doc.text(`Email: ${booking.userEmail}`, startX, y);
    y += 6;
    doc.text(`Phone: ${booking.userPhone}`, startX, y);
    y += 6;
    doc.text(`Date: ${booking.bookingDateTime}`, startX, y);
    y += 8;

    // Restaurant Info
    doc.setFont("helvetica", "bold");
    doc.text("Restaurant:", startX, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.text(`${booking.raw.restaurantId?.restaurantName || "N/A"}`, startX, y);
    y += 6;
    doc.text(`${booking.raw.restaurantId?.locationName || "N/A"}`, startX, y);
    y += 8;

    // Preparation Time (if available)
    if (booking.preparationTime) {
      doc.setFont("helvetica", "bold");
      doc.text("Preparation Time:", startX, y);
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.text(`${booking.preparationTime} minutes`, startX, y);
      y += 8;
    }

    // Products Header
    doc.setFont("helvetica", "bold");
    doc.text("Order Items:", startX, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    booking.raw.products.forEach((prod) => {
      const productText = `${prod.name} (x${prod.quantity})`;
      const productLines = doc.splitTextToSize(productText, 55);
      productLines.forEach((line) => {
        doc.text(line, startX, y);
        y += 6;
      });
    });

    y += 4;
    doc.setLineWidth(0.3);
    doc.line(startX, y, 75, y);
    y += 6;

    // Totals
    doc.setFont("helvetica", "bold");
    doc.text("Subtotal:", startX, y);
    doc.text(`₹${booking.subTotal || booking.price || "N/A"}`, 75, y, { align: "right" });
    y += 6;

    doc.text("Delivery Charge:", startX, y);
    doc.text(`₹${booking.deliveryCharge || 0}`, 75, y, { align: "right" });
    y += 6;

    if (booking.couponDiscount && booking.couponDiscount > 0) {
      doc.text("Discount:", startX, y);
      doc.text(`- ₹${booking.couponDiscount}`, 75, y, { align: "right" });
      y += 6;
    }

    doc.setFontSize(11);
    doc.setTextColor("#d32f2f");
    doc.text("Total Payable:", startX, y);
    doc.text(`₹${booking.totalPayable || booking.totalAmount || "N/A"}`, 75, y, { align: "right" });
    y += 10;

    doc.setFontSize(9);
    doc.setTextColor("#000");
    doc.text(`Status: ${booking.status}`, startX, y);
    y += 6;
    doc.text(`Payment: ${booking.paymentMethod} (${booking.paymentStatus})`, startX, y);
    y += 8;

    doc.setLineWidth(0.3);
    doc.line(startX, y, 75, y);
    y += 8;

    doc.setFontSize(7);
    doc.text("Thank you for your order!", startX + 10, y);

    doc.save(`Invoice_${booking.bookingId}.pdf`);
  };

  // Edit modal handlers
  const openEditModal = (booking) => {
    setEditBooking(booking);
    setEditStatus(booking.status);
    setPreparationTime(booking.preparationTime || "");
  };

  const closeEditModal = () => {
    setEditBooking(null);
    setEditStatus("");
    setPreparationTime("");
  };

  const handleStatusChange = (e) => {
    setEditStatus(e.target.value);
    // Clear preparation time if status is not Accepted
    if (e.target.value !== "Accepted") {
      setPreparationTime("");
    }
  };

  // Updated status update function with preparation time
  const submitStatusUpdate = async () => {
    if (!editBooking) return;
    setEditLoading(true);
    setError(null);

    try {
      const vendorId = localStorage.getItem("vendorId");
      if (!vendorId) throw new Error("Vendor ID not found in localStorage");

      // Prepare request body
      const requestBody = {
        orderStatus: editStatus,
      };

      // Add preparationTime only when status is "Accepted"
      if (editStatus === "Accepted") {
        if (!preparationTime || preparationTime < 1) {
          throw new Error("Preparation time is required when accepting an order");
        }
        requestBody.preparationTime = parseInt(preparationTime);
      }

      // Using the new API endpoint
      const res = await fetch(`http://31.97.206.144:5051/api/acceptorder/${editBooking.bookingId}/${vendorId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) throw new Error("Failed to update order status");

      const data = await res.json();

      if (data.success) {
        // Update UI
        setBookings((prev) =>
          prev.map((b) =>
            b.bookingId === editBooking.bookingId
              ? { 
                  ...b, 
                  status: editStatus,
                  preparationTime: editStatus === "Accepted" ? preparationTime : b.preparationTime
                }
              : b
          )
        );
        closeEditModal();
      } else {
        setError(data.message || "API returned unsuccessful response on update");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  // Delete order
  const deleteOrder = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    setDeleteLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://31.97.206.144:5051/api/vendor/deleteorder/${bookingId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete order");
      const data = await res.json();
      if (data.success) {
        setBookings((prev) => prev.filter((b) => b.bookingId !== bookingId));
      } else {
        setError("API returned unsuccessful response on delete");
      }
    } catch (err) {
      setError(err.message);
    }
    setDeleteLoading(false);
  };

  // Clear all filters
  const clearFilters = () => {
    setStatusFilter("All");
    setDateFilter("");
    setSearchTerm("");
  };

  // Get status counts for filter badges
  const getStatusCounts = () => {
    const counts = {
      All: bookings.length,
      Pending: bookings.filter(b => b.status === "Pending").length,
      Accepted: bookings.filter(b => b.status === "Accepted").length,
      Rejected: bookings.filter(b => b.status === "Rejected").length,
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading orders...</p>
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
              <h1 className="text-2xl font-bold text-gray-800 mb-2">
                📦 Order Management
              </h1>
              <p className="text-gray-600">
                Manage and track all restaurant orders
              </p>
            </div>
            <button
              onClick={downloadExcel}
              disabled={filteredBookings.length === 0}
              className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaFileExcel className="mr-2" />
              Export Excel
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-red-500 mr-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-red-800">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-800 hover:text-red-900 font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search Input */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Orders
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  placeholder="Search by order ID, name, email, phone, products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="All">All Status ({statusCounts.All})</option>
                <option value="Pending">Pending ({statusCounts.Pending})</option>
                <option value="Accepted">Accepted ({statusCounts.Accepted})</option>
                <option value="Rejected">Rejected ({statusCounts.Rejected})</option>
              </select>
            </div>

            {/* Date Filter */}
            <div>
              <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  id="dateFilter"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Status Filters */}
          <div className="flex flex-wrap gap-2">
            {['All', 'Pending', 'Accepted', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                }`}
              >
                {status} ({statusCounts[status]})
              </button>
            ))}
            {(statusFilter !== 'All' || dateFilter || searchTerm) && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-300 hover:bg-red-200 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing {filteredBookings.length} of {bookings.length} orders
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* Table Container */}
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
                    Products
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        {bookings.length === 0 ? 'No orders found' : 'No orders match your filters'}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => (
                    <tr key={booking.bookingId} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 space-y-1">
                          <div className="font-medium">#{booking.bookingId}</div>
                          <div className="text-gray-600 text-xs">
                            {booking.bookingDateTime}
                          </div>
                          <div className="text-xs text-gray-500">
                            Payment: {booking.paymentMethod}
                          </div>
                          {booking.preparationTime && (
                            <div className="text-xs text-green-600 flex items-center">
                              <FaClock className="mr-1" size={10} />
                              Prep: {booking.preparationTime} mins
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 space-y-1">
                          <div className="font-medium">{booking.userName}</div>
                          <div className="text-gray-600 text-xs">{booking.userEmail}</div>
                          <div className="text-gray-500 text-xs">{booking.userPhone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 space-y-1">
                          <div className="font-medium">{booking.productName}</div>
                          <div className="text-gray-600 text-xs">
                            Qty: {booking.quantity} items
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 space-y-1">
                          <div className="font-semibold">₹{booking.totalAmount}</div>
                          <div className="text-gray-600 text-xs">
                            Sub: ₹{booking.price}
                          </div>
                          {booking.deliveryCharge > 0 && (
                            <div className="text-gray-500 text-xs">
                              Delivery: ₹{booking.deliveryCharge}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusClass(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            title="Download Invoice"
                            onClick={() => generateInvoicePDF(booking)}
                            className="inline-flex items-center p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FaFilePdf />
                          </button>
                          <button
                            title="View Details"
                            onClick={() => setViewBooking(booking)}
                            className="inline-flex items-center p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <FaEye />
                          </button>
                          <button
                            title="Edit Status"
                            onClick={() => openEditModal(booking)}
                            className="inline-flex items-center p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded-lg transition-colors"
                          >
                            <FaEdit />
                          </button>
                          <button
                            title="Delete Order"
                            disabled={deleteLoading}
                            onClick={() => deleteOrder(booking.bookingId)}
                            className={`inline-flex items-center p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
                              deleteLoading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                          >
                            <FaTrashAlt />
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

      {/* View Modal - IMPROVED PRODUCT DISPLAY */}
      {viewBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                📦 Order Details - #{viewBooking.bookingId}
              </h3>
              <button
                onClick={() => setViewBooking(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaUser className="mr-2 text-blue-600" />
                    Customer Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {viewBooking.userName}</div>
                    <div><strong>Email:</strong> {viewBooking.userEmail}</div>
                    <div><strong>Phone:</strong> {viewBooking.userPhone}</div>
                    <div><strong>Order Date:</strong> {viewBooking.bookingDateTime}</div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <FaBox className="mr-2 text-green-600" />
                    Order Summary
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>Status:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                        viewBooking.status === "Accepted" ? "bg-green-600 text-white" :
                        viewBooking.status === "Pending" ? "bg-yellow-500 text-white" :
                        viewBooking.status === "Rejected" ? "bg-red-600 text-white" : "bg-gray-500 text-white"
                      }`}>
                        {viewBooking.status}
                      </span>
                    </div>
                    {viewBooking.preparationTime && (
                      <div><strong>Preparation Time:</strong> {viewBooking.preparationTime} minutes</div>
                    )}
                    <div><strong>Payment Method:</strong> {viewBooking.paymentMethod}</div>
                    <div><strong>Payment Status:</strong> {viewBooking.paymentStatus}</div>
                    <div><strong>Delivery Agent:</strong> {viewBooking.deliveryBoy}</div>
                  </div>
                </div>
              </div>

              {/* Restaurant Details */}
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <FaUtensils className="mr-2 text-purple-600" />
                  Restaurant Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Restaurant Name:</strong> {viewBooking.raw.restaurantId?.restaurantName || "N/A"}</div>
                  <div><strong>Location:</strong> {viewBooking.raw.restaurantId?.locationName || "N/A"}</div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <FaMapMarkerAlt className="mr-2 text-yellow-600" />
                  Delivery Address
                </h4>
                <p className="text-sm">{viewBooking.deliveryAddress}</p>
              </div>

              {/* Order Items - IMPROVED DISPLAY */}
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <FaBox className="mr-2 text-orange-600" />
                  Order Items ({viewBooking.raw.products?.length || 0})
                </h4>
                <div className="space-y-4">
                  {viewBooking.raw.products && viewBooking.raw.products.length > 0 ? (
                    viewBooking.raw.products.map((product, index) => (
                      <div key={index} className="flex items-start justify-between p-4 bg-white rounded-lg border border-orange-100 shadow-sm">
                        <div className="flex items-start space-x-4 flex-1">
                          {/* Product Image */}
                          <div className="flex-shrink-0">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-16 h-16 rounded-lg object-cover border"
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/80x80?text=No+Image";
                              }}
                            />
                          </div>
                          
                          {/* Product Details */}
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800 text-lg mb-1">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                              <div><strong>Quantity:</strong> {product.quantity}</div>
                              <div><strong>Product ID:</strong> {product.restaurantProductId}</div>
                              <div><strong>Recommended ID:</strong> {product.recommendedId}</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Product Status Badge */}
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300">
                            Active
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FaBox className="mx-auto text-4xl text-gray-300 mb-3" />
                      <p>No products found in this order</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <FaMoneyBillWave className="mr-2 text-green-600" />
                  Pricing Breakdown
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-green-200">
                    <span className="text-gray-700">Subtotal:</span>
                    <span className="font-semibold">₹{viewBooking.price || 0}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-green-200">
                    <span className="text-gray-700">Delivery Charge:</span>
                    <span className="font-semibold">₹{viewBooking.deliveryCharge || 0}</span>
                  </div>
                  {viewBooking.couponDiscount > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-green-200">
                      <span className="text-red-600">Coupon Discount:</span>
                      <span className="font-semibold text-red-600">- ₹{viewBooking.couponDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center py-3 border-t border-green-300">
                    <span className="text-lg font-bold text-gray-800">Total Payable:</span>
                    <span className="text-lg font-bold text-green-600">₹{viewBooking.totalAmount || 0}</span>
                  </div>
                </div>
              </div>

              {/* Additional Order Information */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Additional Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Order ID:</strong> {viewBooking.bookingId}
                  </div>
                  <div>
                    <strong>Total Items:</strong> {viewBooking.quantity}
                  </div>
                  <div>
                    <strong>Created At:</strong> {new Date(viewBooking.raw.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <strong>Updated At:</strong> {new Date(viewBooking.raw.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                Update Order Status
              </h3>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Order ID:</span>{' '}
                  <span className="text-gray-900">{editBooking.bookingId}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Customer:</span>{' '}
                  <span className="text-gray-900">{editBooking.userName}</span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Current Status:</span>{' '}
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusClass(
                      editBooking.status
                    )}`}
                  >
                    {editBooking.status}
                  </span>
                </p>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  New Status:
                </label>
                <select
                  id="status"
                  value={editStatus}
                  onChange={handleStatusChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={editLoading}
                >
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Preparation Time Field - Only show when status is Accepted */}
              {editStatus === "Accepted" && (
                <div>
                  <label
                    htmlFor="preparationTime"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Preparation Time (minutes):
                  </label>
                  <input
                    type="number"
                    id="preparationTime"
                    min="1"
                    max="300"
                    value={preparationTime}
                    onChange={(e) => setPreparationTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Enter preparation time in minutes"
                    disabled={editLoading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Estimated time needed to prepare this order
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                onClick={submitStatusUpdate}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                disabled={!editStatus || editLoading || (editStatus === "Accepted" && !preparationTime)}
              >
                {editLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingList;