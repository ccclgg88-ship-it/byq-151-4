import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import EmployeeProfilePage from '@/pages/EmployeeProfilePage';
import EmployeePrintPage from '@/pages/EmployeePrintPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/employee/EMP20210315" replace />}
        />
        <Route path="/employee/:id" element={<EmployeeProfilePage />} />
        <Route path="/employee/:id/print" element={<EmployeePrintPage />} />
        <Route
          path="*"
          element={<Navigate to="/employee/EMP20210315" replace />}
        />
      </Routes>
    </Router>
  );
}
