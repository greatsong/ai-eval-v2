import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ClassProvider } from './context/ClassContext'
import { EvaluationProvider } from './context/EvaluationContext'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Navbar from './components/common/Navbar'
import Login from './pages/Login'
import Home from './pages/Home'
import ClassManagement from './pages/ClassManagement'
import Dashboard from './pages/Dashboard'
import AdminSettings from './pages/AdminSettings'
import PdfTest from './pages/PdfTest'
import './App.css'

function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="app-main">{children}</main>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/pdf-test" element={<PdfTest />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <ClassProvider>
                  <EvaluationProvider>
                    <AppLayout>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/classes" element={<ClassManagement />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/admin" element={<AdminSettings />} />
                      </Routes>
                    </AppLayout>
                  </EvaluationProvider>
                </ClassProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
