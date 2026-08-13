import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiMail, FiLock, FiCheckCircle } from 'react-icons/fi';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import api from '../../services/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Read email & token from URL if clicked from email reset link
  const token = searchParams.get('token') || '';
  const emailFromUrl = searchParams.get('email') || '';

  // Fallback to router state email if navigating from login page
  const emailFromState = location.state?.email || '';
  const email = token ? emailFromUrl : emailFromState;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // If no email could be determined, send user back to login
    if (!email) {
      toast.error('Please verify your email on the login page first.');
      navigate('/login');
    }
  }, [email, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = 'New password is required.';
    } else {
      if (newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters long.';
      } else if (!/[A-Z]/.test(newPassword)) {
        newErrors.newPassword = 'Password must contain at least one uppercase letter.';
      } else if (!/[a-z]/.test(newPassword)) {
        newErrors.newPassword = 'Password must contain at least one lowercase letter.';
      } else if (!/[0-9]/.test(newPassword)) {
        newErrors.newPassword = 'Password must contain at least one number.';
      } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
        newErrors.newPassword = 'Password must contain at least one special character.';
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required.';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRequestLink = async () => {
    setLoading(true);
    setErrors({});
    try {
      const response = await api.post('/auth/forgot-password/', { email });
      if (response.data?.ok) {
        toast.success('Reset link sent to your email.');
        setLinkSent(true);
      } else {
        setErrors({ general: response.data?.error || 'Failed to send reset link.' });
      }
    } catch (error) {
      const errMsg = error.response?.data?.error || 'An error occurred. Please try again.';
      setErrors({ general: errMsg });
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const response = await api.post('/auth/forgot-password/', {
        email,
        password: newPassword,
        confirm_password: confirmPassword,
        token
      });

      if (response.data?.ok) {
        toast.success('Password updated successfully.');
        navigate('/login');
      } else {
        setErrors({ general: response.data?.error || 'Failed to reset password.' });
      }
    } catch (error) {
      const errMsg = error.response?.data?.error || 'An error occurred. Please try again.';
      setErrors({ general: errMsg });
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-5xl items-center justify-center px-4 py-16 lg:px-8">
      <div className="w-full max-w-xl rounded-[2rem] border-2 border-rust-200 bg-white p-6 shadow-lg lg:p-8">
        <div className="mb-6 text-center">
          <h1 className="mt-3 text-3xl font-semibold text-slate-900">HungryHub</h1>
          <p className="mt-2 text-sm text-slate-600">
            {token ? 'Choose a new password to secure your account.' : 'Reset your password to access your account.'}
          </p>
        </div>

        {errors.general && (
          <div className="mb-6 rounded-xl bg-rose-50 p-4 text-sm text-rose-500 font-medium">
            {errors.general}
          </div>
        )}

        {token ? (
          /* Case A: Token is present - show the reset form */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email field (Read-only) */}
            <label className="block text-sm text-slate-700 font-medium">
              <span className="mb-2 block">Email Address (Read-only)</span>
              <div className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-slate-500">
                <FiMail />
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full bg-transparent outline-none cursor-not-allowed text-slate-500"
                  tabIndex="-1"
                />
              </div>
            </label>

            {/* New Password field */}
            <label className="block text-sm text-slate-700 font-medium">
              <span className="mb-2 block">New Password</span>
              <div className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white px-4 py-3">
                <FiLock className="text-slate-400" />
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="w-full bg-transparent text-slate-900 outline-none"
                  placeholder="New Password"
                />
                <button type="button" onClick={() => setShowNewPassword((prev) => !prev)} className="text-slate-400">
                  {showNewPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-2 text-sm text-rose-500 font-medium">{errors.newPassword}</p>
              )}
            </label>

            {/* Confirm Password field */}
            <label className="block text-sm text-slate-700 font-medium">
              <span className="mb-2 block">Confirm Password</span>
              <div className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white px-4 py-3">
                <FiLock className="text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full bg-transparent text-slate-900 outline-none"
                  placeholder="Confirm Password"
                />
                <button type="button" onClick={() => setShowConfirmPassword((prev) => !prev)} className="text-slate-400">
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-rose-500 font-medium">{errors.confirmPassword}</p>
              )}
            </label>

            <PrimaryButton className="w-full" type="submit" disabled={loading}>
              {loading ? 'Updating password...' : 'Reset Password'}
            </PrimaryButton>
          </form>
        ) : linkSent ? (
          /* Case B: Token not present, but link was successfully sent */
          <div className="text-center py-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 mb-4">
              <FiCheckCircle size={36} className="text-rust-500" />
            </div>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Reset Link Sent</h2>
            <p className="text-sm text-slate-600 mb-8 max-w-sm mx-auto">
              We have sent a secure password reset link to <strong>{email}</strong>. Please check your inbox and click the link to choose your new password.
            </p>
            <PrimaryButton className="w-full" onClick={() => navigate('/login')}>
              Back to Login
            </PrimaryButton>
          </div>
        ) : (
          /* Case C: Token not present and link not sent - show request button */
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5 text-sm text-slate-600">
              <p className="mb-0">
                You are requesting a secure password reset link for the account associated with: <strong>{email}</strong>.
              </p>
            </div>
            
            <PrimaryButton className="w-full" onClick={handleRequestLink} disabled={loading}>
              {loading ? 'Sending link...' : 'Send Secure Reset Link'}
            </PrimaryButton>
          </div>
        )}

        {!linkSent && (
          <div className="mt-6 text-center text-sm">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-rust-500 font-medium hover:underline"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
