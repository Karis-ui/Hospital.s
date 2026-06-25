import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthLayout, AppLayout } from './theme/GenLayout';

import Home from './pages/authenticators/Home';
import Login from './pages/authenticators/login';
import AdminLogin from './pages/authenticators/adminLogin';
import RegisterAdmin from './pages/authenticators/registerAdmin';
import DoctorRegister from './pages/authenticators/registerDoc';
import LabTechRegister from './pages/authenticators/registerLabTech';
import PatientRegister from './pages/authenticators/registration';
import RegisterStaff from './pages/authenticators/registerOper';
import ForgotPassword from './pages/authenticators/forgotPass';
import ResetPassword from './pages/authenticators/resetPass';

import { AdminDashboard } from './pages/dashboards/Admin';
import { UserList } from './pages/assets/Admin/UsersList';
import { UserDetails } from './pages/assets/Admin/UserDetails';
import { GenerateReport } from './pages/assets/Admin/GenerateReport';
import { Audits } from './pages/assets/Admin/Audits';
import { SetApproval } from './pages/assets/Admin/SetApproval';
import SystemSettings from './pages/assets/Admin/Settings';
import { AdminSearchResults } from './pages/assets/Admin/SearchResults';


import { DoctorDashboard } from './pages/dashboards/Doctor';
import { DoctorAppointmentList } from './pages/assets/Doctors/AppointmentList';
import { CreateLabRequest } from './pages/assets/Doctors/CreateLabRequest';
import { DoctorProfile } from './pages/assets/Doctors/DoctorProfile';
import { PatientDetails } from './pages/assets/Doctors/PatientDetails';
import { PatientMedicalRecords } from './pages/assets/Doctors/PatientMedicalRecords';
import { WritePrescription } from './pages/assets/Doctors/WritePrescription';
import DoctorSearch from './pages/assets/Doctors/Search';

import LabDashboard from './pages/dashboards/LabTech';
import { DetailedRequest } from './pages/assets/LabTech/DetailedRequest';
import { ProcessTest } from './pages/assets/LabTech/ProcessTest';
import { Profile } from './pages/assets/LabTech/Profile';
import { RequestList } from './pages/assets/LabTech/RequestList';
import { ResultDetails } from './pages/assets/LabTech/ResultDetails';
import { Search } from './pages/assets/LabTech/SearchResults';
import { UploadResult } from './pages/assets/LabTech/UploadResults';

import PatientDashboard from './pages/dashboards/Patient';
import AppointmentList from './pages/assets/Patients/AppointmentList';
import BookAppointment from './pages/assets/Patients/BookAppointment';
import { Labview } from './pages/assets/Patients/LabView';
import { MedicalRecords } from './pages/assets/Patients/MedicalRecords';
import { PaymentHistory } from './pages/assets/Patients/PaymentHistory';
import { PatientProfile } from './pages/assets/Patients/Profile';
import { SearchResults } from './pages/assets/Patients/SearchResults';
import { PatientBillDetails } from './pages/assets/Patients/ViewBill';

import OperatorDashboard from './pages/dashboards/BillOperator';
import { BillingHistory } from './pages/assets/Staff/BillingHistory';
import BillList from './pages/assets/Staff/BillList';
import { CreateBill } from './pages/assets/Staff/CreateBill';
import { TransactionList } from './pages/assets/Staff/TransactionList';
import StafffSearch from './pages/assets/Staff/StaffSearch';
import { PatientList } from './pages/assets/Staff/PatientList';
import { ProcessPayment } from './pages/assets/Staff/ProcessPayment';
import { ReceiptView } from './pages/assets/Staff/ReceiptView';


import Settings from './pages/common/Settings';
import NotFound from './pages/common/NotFound';
import Unauthorized from './pages/common/Unauthorized';

import { AuthProvider, useAuth } from './context/authContext';
import { ThemeContextProvider } from './context/ThemeContext';
import { AdLayout } from './theme/AdLayout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a2639',
      light: '#2c3e50',
      dark: '#0f1a2f',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#c9b037',
      light: '#e4d96f',
      dark: '#aa8c2f',
      contrastText: '#1a2639',
    },
    background: {
      default: '#f0f2f5',
      paper: '#ffffff',
      elevated: '#f8fafc',
    },
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      disabled: '#94a3b8',
    },
    error: { main: '#e74c3c' },
    warning: { main: '#f39c12' },
    info: { main: '#3498db' },
    success: { main: '#27ae60' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 500 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
      },
    },
  },
});

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const userRole = user.user_type || user.role;
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? children : <Outlet />;
};

const RoleBasedRedirect = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const roleRoutes = {
    admin: '/admin/dashboard',
    doctor: '/doctor/dashboard',
    lab_technician: '/lab/dashboard',
    patient: '/patient/dashboard',
    operator: '/operator/dashboard',
  };

  const userRole = user.user_type || user.role;
  const redirectPath = roleRoutes[userRole] || '/home';
  return <Navigate to={redirectPath} replace />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ThemeContextProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<AuthLayout />}>
                <Route index element={<Navigate to="/home" replace />} />
                <Route path='/home' element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/register/doctor" element={<DoctorRegister />} />
                <Route path="/register/bill-operator" element={<RegisterStaff />} />
                <Route path="/register/lab-technician" element={<LabTechRegister />} />
                <Route path="/register/patient" element={<PatientRegister />} />
                <Route path="/register/admin" element={<RegisterAdmin />} />
              </Route>

              <Route path="/" element={<RoleBasedRedirect />} />


              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route element={<AdLayout />}>
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/users" element={<UserList />} />
                  <Route path="/admin/users/:id" element={<UserDetails />} />
                  <Route path="/admin/approvals" element={<SetApproval />} />
                  <Route path="/admin/reports/generate" element={<GenerateReport />} />
                  <Route path="/admin/audit-logs" element={<Audits />} />
                  <Route path="/admin/settings" element={<SystemSettings />} />
                  <Route path="/admin/search" element={<AdminSearchResults />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
                <Route element={<AppLayout />}>
                  <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
                  <Route path="/doctor/appointments" element={<DoctorAppointmentList />} />
                  <Route path="/doctor/patients-details" element={<PatientDetails />} />
                  <Route path="/doctor/patients/:id/Medical-records" element={<PatientMedicalRecords />} />
                  <Route path="/doctor/prescriptions" element={<WritePrescription />} />
                  <Route path="/doctor/lab/new" element={<CreateLabRequest />} />
                  <Route path="/doctor/profile" element={<DoctorProfile />} />
                  <Route path="/doctor/search" element={<DoctorSearch />} />
                </Route>
              </Route>


              <Route element={<ProtectedRoute allowedRoles={['lab_technician']} />}>
                <Route element={<AppLayout />}>
                  <Route path="/lab/dashboard" element={<LabDashboard />} />
                  <Route path="/lab/requests" element={<RequestList />} />
                  <Route path="/lab/requests/:id" element={<DetailedRequest />} />
                  <Route path="/lab/process/:id" element={<ProcessTest />} />
                  <Route path="/lab/upload-result/:id" element={<UploadResult />} />
                  <Route path="/lab/profile" element={<Profile />} />
                  <Route path="/lab/results/:id" element={<ResultDetails />} />
                  <Route path="/lab/search" element={<Search />} />
                </Route>
              </Route>


              <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
                <Route element={<AppLayout />}>
                  <Route path="/patient/dashboard" element={<PatientDashboard />} />
                  <Route path="/patient/appointments" element={<AppointmentList />} />
                  <Route path="/patient/book-appointment" element={<BookAppointment />} />
                  <Route path="/patient/records" element={<MedicalRecords />} />
                  <Route path="/patient/payment-history" element={<PaymentHistory />} />
                  <Route path="/patient/bills" element={<PatientBillDetails />} />
                  <Route path="/patient/lab-view" element={<Labview />} />
                  <Route path="/patient/profile" element={<PatientProfile />} />
                  <Route path="/patient/search" element={<SearchResults />} />
                </Route>
              </Route>


              <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
                <Route element={<AppLayout />}>
                  <Route path="/operator/dashboard" element={<OperatorDashboard />} />
                  <Route path="/operator/history/billing" element={<BillingHistory />} />
                  <Route path="/operator/detail-view/:id" element={<PatientBillDetails />} />
                  <Route path="/operator/bills" element={<BillList />} />
                  <Route path="/operator/create" element={<CreateBill />} />
                  <Route path="/operator/transactions" element={<TransactionList />} />
                  <Route path="/operator/search" element={<StafffSearch />} />
                  <Route path="/operator/process-payment" element={<ProcessPayment />} />
                  <Route path="/operator/patients" element={<PatientList />} />
                  <Route path="/operator/receipt" element={<ReceiptView />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/settings" element={<Settings />} />
                </Route>
              </Route>

              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
        </ThemeContextProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
