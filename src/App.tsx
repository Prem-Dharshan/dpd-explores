/**
 * DPD Explores - Main App Component
 * Sets up routing and authentication guards
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Login } from "@/pages/Login"
import { Dashboard } from "@/pages/Dashboard"
import { Onboarding } from "@/pages/Onboarding"
import { Flashcard } from "@/pages/Flashcard"
import { PlaceDetail } from "@/pages/PlaceDetail"
import { AddPlace } from "@/pages/AddPlace"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add"
          element={
            <ProtectedRoute>
              <AddPlace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/flashcard"
          element={
            <ProtectedRoute>
              <Flashcard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/place/:id"
          element={
            <ProtectedRoute>
              <PlaceDetail />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
