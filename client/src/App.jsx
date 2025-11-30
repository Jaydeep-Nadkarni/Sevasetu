import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route
            path="/"
            element={
              <div className="container-custom py-8">
                <h1 className="text-4xl font-bold text-primary mb-4">Welcome to NGO Platform</h1>
                <p className="text-gray-600">Your MERN stack application is ready!</p>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
