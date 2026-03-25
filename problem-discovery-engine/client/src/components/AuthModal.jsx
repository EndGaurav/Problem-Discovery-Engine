import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Camera, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API_BASE = '/api/auth';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // login, register, verify, forgot, reset
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    otp: '',
    token: '',
    profilePicture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (value, index) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto focus next
    if (value && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      let endpoint = '';
      if (mode === 'login') endpoint = '/login';
      else if (mode === 'register') endpoint = '/register';
      else if (mode === 'forgot') endpoint = '/forgot-password';
      else if (mode === 'reset') endpoint = '/reset-password';

      if (mode === 'verify') {
        const fullOtp = otp.join('');
        const response = await axios.post(`${API_BASE}/verify-otp`, { ...formData, otp: fullOtp });
        onAuthSuccess(response.data);
        onClose();
        return;
      }

      const response = await axios.post(`${API_BASE}${endpoint}`, formData);
      
      if (mode === 'login' || (mode === 'verify')) {
        onAuthSuccess(response.data);
        onClose();
      } else if (mode === 'register') {
        setMode('verify');
        setMessage("Registration successful! Please enter the OTP sent to your email.");
      } else if (mode === 'forgot') {
        setMode('reset');
        setMessage("Reset token sent! Please enter it below with your new password.");
      } else if (mode === 'reset') {
        setMode('login');
        setMessage("Password reset successful! Please login.");
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-md glass rounded-3xl overflow-hidden shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
          <X size={24} />
        </button>

        <div className="p-8">
          <header className="text-center mb-8">
            <h2 className="text-3xl font-black bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'register' && 'Create Account'}
              {mode === 'verify' && 'Verify Email'}
              {mode === 'forgot' && 'Reset Password'}
              {mode === 'reset' && 'Set New Password'}
            </h2>
            <p className="text-slate-400 mt-2">
              {mode === 'login' && "Sign in to keep building."}
              {mode === 'register' && "Start discovering problems."}
              {mode === 'verify' && "We sent an OTP to your email."}
              {mode === 'forgot' && "Don't worry, it happens to the best of us."}
              {mode === 'reset' && "Enter the token and your new password."}
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 text-sm flex items-center gap-2">
                <CheckCircle2 size={16} /> {message}
              </div>
            )}
            
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center gap-2">
                <AlertCircle size={16} /> {error}
              </div>
            )}

            {mode === 'register' && (
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={20} />
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full h-12 glass rounded-2xl pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
              </div>
            )}

            {(mode === 'login' || mode === 'register' || mode === 'forgot' || mode === 'verify') && (
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={20} />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-12 glass rounded-2xl pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
              </div>
            )}

            {(mode === 'login' || mode === 'register' || mode === 'reset') && (
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={20} />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Password (min 6 chars)"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full h-12 glass rounded-2xl pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
              </div>
            )}

            {mode === 'verify' && (
              <div className="flex justify-center gap-3 py-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={otpRefs[index]}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(e.target.value, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    className="w-12 h-14 glass rounded-xl text-center text-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all border border-white/10"
                  />
                ))}
              </div>
            )}

            {mode === 'reset' && (
              <div className="relative group">
                <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors" size={20} />
                <input
                  type="text"
                  name="token"
                  required
                  placeholder="Enter reset token from email"
                  value={formData.token}
                  onChange={handleChange}
                  className="w-full h-12 glass rounded-2xl pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                />
              </div>
            )}

            <button
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all active:scale-95 shadow-xl shadow-purple-500/20"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : (
                <>
                  {mode === 'login' ? 'Sign In' : (mode === 'register' ? 'Register' : 'Confirm')}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center space-y-4">
            {mode === 'login' && (
              <p className="text-slate-400 text-sm">
                New here?{' '}
                <button onClick={() => setMode('register')} className="text-purple-400 font-bold hover:underline">
                  Join the discovery
                </button>
              </p>
            )}
            {mode === 'register' && (
              <p className="text-slate-400 text-sm">
                Already have an account?{' '}
                <button onClick={() => setMode('login')} className="text-purple-400 font-bold hover:underline">
                   Login instead
                </button>
              </p>
            )}
            {mode === 'login' && (
              <button 
                onClick={() => setMode('forgot')}
                className="text-slate-500 text-xs hover:text-slate-300 transition-colors"
              >
                Forgot Password?
              </button>
            )}
            {(mode === 'forgot' || mode === 'verify' || mode === 'reset') && (
              <button 
                onClick={() => setMode('login')}
                className="text-slate-500 text-xs hover:text-slate-300 transition-colors"
              >
                Back to Login
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
