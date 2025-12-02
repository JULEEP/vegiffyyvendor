import React from "react";
import { Route, Routes } from "react-router-dom";

// Import your components
import DepartmentList from "./Components/department";
import SubDepartmentList from "./Components/subdepartment.js";
import Position from "./Employee/Position.js";
import AdminLayout from "./Layout/AdminLayout.jsx";
import AttendanceForm from "./Pages/AttendanceForm.js";
import Dashboard from "./Pages/Dashboard.jsx";
import Holiday from "./Pages/Holiday.js";
import DiagnostiCreate from "./Pages/LeaveApplication.js";
import LeaveApproval from "./Pages/LeaveApproval";
import Leaves from "./Pages/Leaves.js";
import MissingAttendance from "./Pages/MissingAttendance.js";
import MonthlyAttendance from "./Pages/MonthlyAttendance.js";
import WeeklyHoliday from "./Pages/WeeklyHoliday.js";
import Recruitment from "./Components/recruitment.js";
import Employees from "./Employee/Employees.js";
import Manageemployeesalary from "./Employee/Manageemployeesalary.js";
import Performance from "./Employee/Performance.js";
import SalaryAdvance from "./Employee/SalaryAdvance.js";
import SalaryGenerate from "./Employee/SalaryGenerate.js";
import DiagnosticList from "./Pages/Awardlist.js";
import BackupReset from "./Pages/BackupReset.js";
import LanguageSetup from "./Pages/LanguageSetup.js";
import MessagesTable from "./Pages/Message.js";
import NoticeList from "./Pages/Noticelist.js";
import SentMessagesTable from "./Pages/Sent.js";
import Settings from "./Pages/Setting";
import SetupRulesTable from "./Pages/Setup.js";
import CandidateShortlist from "./Pages/CandidateShortlist.js";
import InterviewList from "./Pages/InterviewList.js";
import CandidateSelection from "./Pages/CandidateSelection.js";
import ClientsTable from "./Pages/ClientsTable.js";
import ProjectsTable from "./Pages/ProjectsTable.js";
import ProjectTasksTable from "./Pages/ProjectTasksTable.js";
import ManageProjects from "./Pages/ManageProject.js";
import CompanyDetailsForm from "./Pages/CompanyDetailsForm.js";
import CompanyList from "./Pages/CompanyList.js";
import DoctorDetailsForm from "./Pages/DoctorDetailsForm.js";
import DoctorList from "./Pages/DoctorList.js";
import StaffDetailsForm from "./Pages/StaffDetailsForm.js";
import StaffList from "./Pages/StaffList.js";
import DiagnosticsBookingList from "./Pages/DiagnosticsBookingList.js";
import DoctorAppointmentList from "./Pages/DoctorAppointmentList.js";
import AppointmentBookingForm from "./Pages/AppointmentBookingForm.js";
import DiagnosticDetail from "./Pages/DiagnosticDetail.js";
import DiagnosticsPendingBooking from "./Pages/DiagnosticsPendingBooking.js";
import DoctorAppointmentListPending from "./Pages/DoctorAppointmentListPending.js";
import LoginPage from "./Pages/Login.js";
import CategoryForm from "./Pages/CategoryForm.js";
import CategoryList from "./Pages/CategoryList.js";
import CompanySidebar from "./Components/CompanySidebar.js";
import CompanyLayout from "./Layout/CompanyLayout.js";
import CompanyDashboard from "./Comany/CompanyDashboard.js";
import CompanyLoginPage from "./Components/CompanyLoginPage.js";
import CompanyStaffDetailsForm from "./Comany/CompanyStaffDetailsForm.js";
import CompanyStaffList from "./Comany/CompanyStaffList.js";
import DiagnosticsAcceptedBooking from "./Pages/DiagnosticsAcceptedBooking.js";
import DiagnosticsRejectedBooking from "./Pages/DiagnosticsRejectedBooking.js";
import AcceptedAppointmentsList from "./Pages/AcceptedAppointmentsList.js";
import RejectedAppointmentsList from "./Pages/RejectedAppointmentsList.js";
import CompanyProfilePage from "./Comany/CompanyProfilePage.js";
import DoctorLayout from "./Layout/DoctorLayout.js";
import DoctorLoginPage from "./Doctor/DoctorLoginPage.js";
import DoctorDashboard from "./Doctor/DoctorDashboard.js";
import DoctorProfilePage from "./Doctor/DoctorProfilePage.js";
import SingleDoctorAppointmentList from "./Doctor/DoctorAppointmentList.js";
import AllDiagnostics from "./Comany/AllDiagnostics.js";
import StaffHistory from "./Pages/StaffHistory.js";
import DiagnosticBookingForm from "./Pages/DiagnosticBookingForm.js";
import CompanyStaffHistory from "./Components/CompanyStaffHistory.js";
import CompanyAllDiagnostics from "./Comany/CompanyAllDiagnostics.js";
import DiagnosticLayout from "./Layout/DiagnosticLayout.js";
import DiagnosticLoginPage from "./Diagnostic/DiagnosticLoginPage.js";
import DiagnosticDashboard from "./Diagnostic/DiagnosticDashboard.js";
import SingleDiagnosticDetail from "./Diagnostic/SingleDiagnosticDetail.js";
import SingleDiagnosticBookings from "./Diagnostic/SingleDiagnosticBookings.js";
import CouponsPage from "./Pages/CouponPage.js";
import CreateCoupon from "./Pages/CreateCoupon.js";
import UploadDocuments from "./Pages/UploadDocuments.js";
import DocumentTable from "./Pages/DocumentTable.js";
import CouponHistoryTable from "./Pages/CouponHistoryTable.js";
import CreateProductForm from "./Pages/CreateProduct.js";
import ProductList from "./Pages/ProductList.js";
import BookingList from "./Pages/BookingList.js";
import PendingBookingList from "./Pages/PendingBookingList.js";
import CompletedBookingList from "./Pages/CompletedBookingList .js";
import CancelledBookingList from "./Pages/CancelledBookingList .js";
import MyWallet from "./Pages/MyWallet.js";
import VendorProfile from "./Pages/VendorProfile.js";
import AddVendorForm from "./Pages/Register.js";
import VendorSupport from "./Pages/VendorSupport.js";
import VendorUsers from "./Pages/VendorUsers.js";
import VendorJoiningFee from "./Pages/VendorJoiningFee.js";
import VendorMyPlans from "./Pages/VendorMyPlans.js";
import AboutUs from "./Pages/AboutUs.js";




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
              <Route path="/department" element={<DepartmentList />} />
              <Route path="/subdepartment" element={<SubDepartmentList />} />
              <Route path="/position" element={<Position />} />
              <Route path="/attendanceform" element={<AttendanceForm />} />
              <Route path="/monthlyattendance" element={<MonthlyAttendance />} />
              <Route path="/missingattendance" element={<MissingAttendance />} />
              <Route path="/weeklyholiday" element={<WeeklyHoliday />} />
              <Route path="/holiday" element={<Holiday />} />
              <Route path="/create-diagnostic" element={<DiagnostiCreate />} />
              <Route path="/leaves" element={<Leaves />} />
              <Route path="/leaveapproval" element={<LeaveApproval />} />
              <Route path="/performance" element={<Performance />} />
              <Route path="/recruitment" element={<Recruitment />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/languagesetup" element={<LanguageSetup />} />
              <Route path="/backupreset" element={<BackupReset />} />
              <Route path="/diagnosticlist" element={<DiagnosticList />} />
              <Route path="/message" element={<MessagesTable />} />
              <Route path="/noticelist" element={<NoticeList />} />
              <Route path="/sentlist" element={<SentMessagesTable />} />
              <Route path="/setuplist" element={<SetupRulesTable />} />
              <Route path="/salaryadvance" element={<SalaryAdvance />} />
              <Route path="/salarygenerate" element={<SalaryGenerate />} />
              <Route path="/manageemployeesalary" element={<Manageemployeesalary />} />
              <Route path="/candidate-shortlist" element={<CandidateShortlist />} />
              <Route path="/interviewlist" element={<InterviewList />} />
              <Route path="/selectedcandidates" element={<CandidateSelection />} />
              <Route path="/clients" element={<ClientsTable />} />
              <Route path="/projects" element={<ProjectsTable />} />
              <Route path="/task" element={<ProjectTasksTable />} />
              <Route path="/manage-project" element={<ManageProjects />} />
              <Route path="/company-register" element={<CompanyDetailsForm />} />
              <Route path="/companylist" element={<CompanyList />} />
              <Route path="/create-doctor" element={<DoctorDetailsForm />} />
              <Route path="/doctorlist" element={<DoctorList />} />
              <Route path="/staff-register" element={<StaffDetailsForm />} />
              <Route path="/stafflist" element={<StaffList />} />
              <Route path="/diagnosticslist" element={<DiagnosticsBookingList />} />
              <Route path="/diagnosticsacceptedlist" element={<DiagnosticsAcceptedBooking />} />
              <Route path="/diagnosticsrejectedlist" element={<DiagnosticsRejectedBooking />} />
              <Route path="/doctoracceptedlist" element={<AcceptedAppointmentsList />} />
              <Route path="/doctorrejectedlist" element={<RejectedAppointmentsList />} />
              <Route path="/appintmentlist" element={<DoctorAppointmentList />} />
              <Route path="/appintmentbooking" element={<AppointmentBookingForm />} />
              <Route path="/diagnostic-center/:id" element={<DiagnosticDetail />} />
              <Route path="/diagnosticpending" element={<DiagnosticsPendingBooking />} />
              <Route path="/doctorpendingbookings" element={<DoctorAppointmentListPending />} />
              <Route path="/categoryform" element={<CategoryForm />} />
              <Route path="/categorylist" element={<CategoryList />} />
              <Route path="/add-product" element={<CreateProductForm />} />
              <Route path="/productlist" element={<ProductList />} />
              <Route path="/allorders" element={<BookingList />} />
              <Route path="/pendingorders" element={<PendingBookingList />} />
              <Route path="/completedorders" element={<CompletedBookingList />} />
              <Route path="/cancelledorders" element={<CancelledBookingList />} />
              <Route path="/companysidebar" element={<CompanySidebar />} />
              <Route path="/alldiagnostic" element={<AllDiagnostics />} />
              <Route path="/staff-history/:staffId" element={<StaffHistory />} /> {/* Route for StaffHistory */}
              <Route path="/book-diagnostic" element={<DiagnosticBookingForm />} />
              <Route path="/coupons" element={<CouponsPage />} />
              <Route path="/couponshistory" element={<CouponHistoryTable />} />
              <Route path="/create-coupon" element={<CreateCoupon />} />
              <Route path="/upload-docs" element={<UploadDocuments />} />
              <Route path="/docs" element={<DocumentTable />} />
              <Route path="/mywallet" element={<MyWallet />} />
              <Route path="/myprofile" element={<VendorProfile />} />
              <Route path="/support" element={<VendorSupport />} />
               <Route path="/users" element={<VendorUsers />} />
              <Route path="/vendorpay" element={<VendorJoiningFee />} />
              <Route path="/myplans" element={<VendorMyPlans />} />
             <Route path="/aboutus" element={<AboutUs />} />




            </Routes>
          </AdminLayout>
        }
      />

      {/* Company Routes */}
      <Route
        path="/company/*"
        element={
          <CompanyLayout>
            <Routes>
              <Route path="companydashboard" element={<CompanyDashboard />} />
              <Route path="add-benificary" element={<CompanyStaffDetailsForm />} />
              <Route path="all-benificary" element={<CompanyStaffList />} />
              <Route path="all-benificary" element={<CompanyStaffList />} />
              <Route path="/staff-history/:staffId" element={<CompanyStaffHistory />} /> {/* Route for StaffHistory */}
              <Route path="doctorlist" element={<DoctorList />} />
              <Route path="appointments" element={<DoctorAppointmentList />} />
              <Route path="book-appointment" element={<AppointmentBookingForm />} />
              <Route path="profile" element={<CompanyProfilePage />} />
              <Route path="alldiagnostic" element={<CompanyAllDiagnostics />} />
              {/* Add more company routes as needed */}
            </Routes>
          </CompanyLayout>
        }
      />


      {/* Doctor Routes */}
      <Route
        path="/doctor/*"
        element={
          <DoctorLayout>
            <Routes>
              <Route path="doctordashboard" element={<DoctorDashboard />} />  {/* Doctor's Dashboard */}
              <Route path="doctorprofile" element={<DoctorProfilePage />} />  {/* Doctor's Dashboard */}
              <Route path="appointments" element={<SingleDoctorAppointmentList />} />  {/* Appointments */}
              <Route path="book-appointment" element={<AppointmentBookingForm />} />  {/* Book Appointment */}
              {/* Add more doctor-specific routes */}
            </Routes>
          </DoctorLayout>
        }
      />


      <Route
        path="/diagnostic/*"
        element={
          <DiagnosticLayout>
            <Routes>
              <Route path="all-bookings" element={<DiagnostiCreate />} />
              <Route path="dashboard" element={<DiagnosticDashboard />} />
              <Route path="mydiagnostic" element={<SingleDiagnosticDetail />} />
              <Route path="mybookings" element={<SingleDiagnosticBookings />} />
              {/* Add more diagnostic-specific routes here */}
            </Routes>
          </DiagnosticLayout>
        }
      />


      {/* Standalone Company Login Route */}
      <Route path="/company-login" element={<CompanyLoginPage />} />
      <Route path="/doctor-login" element={<DoctorLoginPage />} />
      <Route path="/diagnostic-login" element={<DiagnosticLoginPage />} />
    </Routes>
  );
}

export default App;
