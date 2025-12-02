import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FaFilePdf } from "react-icons/fa";

const CancelledBookingList = () => {
  const cancelledBookings = [
    {
      id: 1,
      userName: "John Doe",
      productName: "Veg Pizza",
      quantity: 2,
      price: 300,
      totalPrice: 600,
      status: "Cancelled",
      bookingDate: "2025-04-20",
      deliveryDate: "2025-04-22",
    },
    {
      id: 2,
      userName: "Jane Smith",
      productName: "Veg Pizza",
      quantity: 1,
      price: 450,
      totalPrice: 450,
      status: "Cancelled",
      bookingDate: "2025-04-18",
      deliveryDate: "2025-04-20",
    },
    {
      id: 3,
      userName: "Emily Johnson",
      productName: "Spaghetti Aglio Olio",
      quantity: 3,
      price: 350,
      totalPrice: 1050,
      status: "Cancelled",
      bookingDate: "2025-04-19",
      deliveryDate: "2025-04-21",
    },
    {
      id: 4,
      userName: "Michael Brown",
      productName: "Cheese Burger",
      quantity: 1,
      price: 250,
      totalPrice: 250,
      status: "Cancelled",
      bookingDate: "2025-04-17",
      deliveryDate: "2025-04-19",
    },
    {
      id: 5,
      userName: "Sarah Davis",
      productName: "Chocolate Cake",
      quantity: 2,
      price: 200,
      totalPrice: 400,
      status: "Cancelled",
      bookingDate: "2025-04-16",
      deliveryDate: "2025-04-18",
    },
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case "Cancelled":
        return "border-2 border-red-500 text-red-500";
      case "Pending":
        return "border-2 border-yellow-500 text-yellow-500";
      case "Delivered":
        return "border-2 border-blue-500 text-blue-500";
      default:
        return "border-2 border-gray-400 text-gray-500";
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Cancelled Booking List", 14, 20);

    const tableData = cancelledBookings.map((b) => [
      b.userName,
      b.productName,
      b.quantity,
      `₹${b.price}`,
      `₹${b.totalPrice}`,
      b.bookingDate,
      b.deliveryDate,
      b.status,
    ]);

    doc.autoTable({
      head: [
        [
          "User Name",
          "Product",
          "Qty",
          "Price",
          "Total",
          "Booking Date",
          "Delivery Date",
          "Status",
        ],
      ],
      body: tableData,
      startY: 30,
    });

    doc.save("Cancelled_Booking_List.pdf");
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold text-gray-700">
          Cancelled Orders
        </h3>
        <button
          onClick={generatePDF}
          className="text-sm px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center"
        >
          <FaFilePdf className="mr-2" />
          Download PDF
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border-collapse">
          <thead className="bg-red-100 text-gray-600 uppercase text-xs">
            <tr className="border-b">
              <th className="p-3 text-left">User</th>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Qty</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Booking Date</th>
              <th className="p-3 text-left">Delivery Date</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {cancelledBookings.map((booking) => (
              <tr key={booking.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{booking.userName}</td>
                <td className="p-3">{booking.productName}</td>
                <td className="p-3">{booking.quantity}</td>
                <td className="p-3">₹{booking.price}</td>
                <td className="p-3">₹{booking.totalPrice}</td>
                <td className="p-3">{booking.bookingDate}</td>
                <td className="p-3">{booking.deliveryDate}</td>
                <td className="p-3">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs ${getStatusClass(
                      booking.status
                    )}`}
                  >
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CancelledBookingList;
