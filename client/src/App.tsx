import { Route, Routes } from "react-router-dom"
import Header from "./components/header"
import Register from "./auth/register"
import Login from "./auth/login"
import ManagerDashboard from "./components/managerDashboard"
import EmployeeDashboard from "./components/employeeDashboard"
import AllNotification from "./components/notifications"
import { AuthProvider } from "./context/authContext"
import ProtectedRoute from "./protectedRoute"
import AdminDashboard from "./components/adminDashboard"

function App() {

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthProvider>
        <Header />
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/manager" element={<ProtectedRoute allowedRoles={["manager"]}> <ManagerDashboard /> </ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute allowedRoles={["manager"]}> <AllNotification /> </ProtectedRoute>} />
            <Route path="/employee" element={<ProtectedRoute allowedRoles={["employee"]}><EmployeeDashboard /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />
          </Routes>
        </main>
      </AuthProvider>
    </div>
  )
}

export default App
