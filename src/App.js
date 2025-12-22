import React from "react";
import { Route, Routes } from "react-router-dom";

// Import your components
import AdminLayout from "./Layout/AdminLayout.jsx";
import Dashboard from "./Pages/Dashboard.jsx";
import Settings from "./Pages/Setting";
import LoginPage from "./Pages/Login.js";
import CategoryForm from "./Pages/CategoryForm.js";
import CategoryList from "./Pages/CategoryList.js";
import CreateProductForm from "./Pages/CreateProduct.js";
import ProductList from "./Pages/ProductList.js";
import BookingList from "./Pages/BookingList.js";
import PendingBookingList from "./Pages/PendingBookingList.js";
import CompletedBookingList from "./Pages/CompletedBookingList .js";
import MyWallet from "./Pages/MyWallet.js";
import VendorProfile from "./Pages/VendorProfile.js";
import AddVendorForm from "./Pages/Register.js";
import VendorSupport from "./Pages/VendorSupport.js";
import VendorUsers from "./Pages/VendorUsers.js";
import VendorJoiningFee from "./Pages/VendorJoiningFee.js";
import VendorMyPlans from "./Pages/VendorMyPlans.js";
import AboutUs from "./Pages/AboutUs.js";
import CommissionReport from "./Pages/CommissionReport.js";
import AccountManagement from "./Pages/AccountManagement.js";
import VendorNotifications from "./Pages/VendorNotifications.js";




function App() {
  return (
    <Routes>
      {/* Login page rendered outside AdminLayout */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<AddVendorForm />} />

      {/* All other routes inside AdminLayout */}
      <Route
        path="/*"
        element={
          <AdminLayout>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/categoryform" element={<CategoryForm />} />
              <Route path="/categorylist" element={<CategoryList />} />
              <Route path="/add-product" element={<CreateProductForm />} />
              <Route path="/productlist" element={<ProductList />} />
              <Route path="/allorders" element={<BookingList />} />
              <Route path="/pendingorders" element={<PendingBookingList />} />
              <Route path="/completedorders" element={<CompletedBookingList />} />
              <Route path="/mywallet" element={<MyWallet />} />
              <Route path="/myprofile" element={<VendorProfile />} />
              <Route path="/support" element={<VendorSupport />} />
               <Route path="/users" element={<VendorUsers />} />
              <Route path="/vendorpay" element={<VendorJoiningFee />} />
              <Route path="/myplans" element={<VendorMyPlans />} />
             <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/comission" element={<CommissionReport />} />
            <Route path="/account" element={<AccountManagement />} />
            <Route path="/notification" element={<VendorNotifications />} />





            </Routes>
          </AdminLayout>
        }
      />
    </Routes>
  );
}

export default App;
