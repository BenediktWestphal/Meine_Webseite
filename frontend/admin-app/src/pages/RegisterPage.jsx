import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerAdmin } from '../services/authService';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setError('');
    try {
      await registerAdmin(email, password);
      navigate('/admin/dashboard'); // Navigate to dashboard after registration
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      console.error("Registration error:", err);
    }
  };

  // Using Tailwind classes directly for input and button for consistency
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Registration</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Register
            </button>
          </div>
          <p className="text-center mt-4">
            <a href="/login" className="text-blue-500 hover:text-blue-700">Already have an account? Login</a>
          </p>
        </form>
      </div>
    </div>
  );
}

/*
// Original script had this for dynamic styling. Replaced with Tailwind classes above.
// Basic styling for input and button to be complemented by Tailwind
const styles = `
.input-field {
  shadow: appearance-none;
  border: 1px solid #cbd5e0; // gray-400
  border-radius: 0.25rem; // rounded
  width: 100%;
  padding: 0.5rem 0.75rem; // py-2 px-3
  color: #4a5568; // gray-700
  line-height: 1.25;
  margin-bottom: 0.75rem; // mb-3
}
.input-field:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5); // focus:shadow-outline-blue
}
.btn-primary {
  background-color: #4299e1; // bg-blue-500
  color: white;
  font-weight: bold;
  padding: 0.5rem 1rem; // py-2 px-4
  border-radius: 0.25rem; // rounded
}
.btn-primary:hover {
  background-color: #2b6cb0; // hover:bg-blue-700
}
`
const styleSheet = document.createElement("style")
styleSheet.type = "text/css"
styleSheet.innerText = styles
document.head.appendChild(styleSheet)
*/

export default RegisterPage;
