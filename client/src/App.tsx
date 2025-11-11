import { Route, Routes } from "react-router-dom"
import Header from "./components/header"
import Register from "./auth/register"
import Login from "./auth/login"
import ManagerDashboard from "./components/managerDashboard"

function App() {

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto p-4">
        <Routes>
          {/* <Route path="/login" element={<Login />} /> */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/manager" element={<ManagerDashboard />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
