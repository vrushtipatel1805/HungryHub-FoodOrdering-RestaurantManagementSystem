import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser } from 'react-icons/fi';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect');
  const { signup, signin, loading, findAccountByEmail } = useAuth();
  const [mode, setMode] = useState('check');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ full_name: '', email: '', dob: '', password: '', confirm_password: '' });
  const [errors, setErrors] = useState({});

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleEmailCheck = async (event) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    setErrors((prev) => ({ ...prev, email: trimmedEmail && !validateEmail(trimmedEmail) ? 'Please enter a valid email address.' : '' }));

    if (!trimmedEmail || !validateEmail(trimmedEmail)) return;

    const existingAccount = await findAccountByEmail(trimmedEmail);
    setForm((prev) => ({ ...prev, email: trimmedEmail }));
    setMode(existingAccount ? 'login' : 'signup');
  };

  const validateSignupForm = () => {
    const newErrors = {};

    if (!form.full_name.trim()) {
      newErrors.full_name = 'Full Name is required';
    } else if (form.full_name.trim().length < 3) {
      newErrors.full_name = 'Name must be at least 3 characters';
    }

    const trimmedEmail = (form.email || email).trim();
    if (!trimmedEmail) {
      newErrors.email = 'Email Address is required';
    } else if (!validateEmail(trimmedEmail)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!form.confirm_password) {
      newErrors.confirm_password = 'Confirm Password is required';
    } else if (form.password !== form.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (event) => {
    event.preventDefault();
    if (!validateSignupForm()) {
      toast.error('Please correct the validation errors.');
      return;
    }

    const result = await signup({
      full_name: form.full_name,
      email: form.email || email,
      dob: form.dob || null,
      password: form.password,
      confirm_password: form.confirm_password,
    });

    if (!result.ok) {
      setErrors(result.errors || {});
      return;
    }

    let target = '/';
    if (redirect) {
      const decoded = decodeURIComponent(redirect);
      target = decoded.startsWith('/') ? decoded : `/${decoded}`;
    }
    navigate(target);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const loginEmail = form.email || email;
    const result = await signin({ email: loginEmail, password });

    if (!result.ok) {
      setErrors({ password: result.error });
      return;
    }

    toast.success(result.message);
    if (result.user?.role === 'admin' || loginEmail.toLowerCase() === 'admin@hungryhub.com') {
      navigate('/admin');
    } else {
      let target = '/';
      if (redirect) {
        const decoded = decodeURIComponent(redirect);
        target = decoded.startsWith('/') ? decoded : `/${decoded}`;
      }
      navigate(target);
    }
  };

  const handleModeSwitch = (nextMode) => {
    setMode(nextMode);
    setErrors({});
  };

  const renderField = (label, value, onChange, type = 'text', icon, error = '') => (
    <label className="block text-sm text-slate-700 font-medium">
      <span className="mb-2 block">{label}</span>
      <div className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white px-4 py-3">
        <span className="text-slate-400">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={onChange}
          className="w-full bg-transparent text-slate-900 outline-none"
          placeholder={label}
        />
      </div>
      {error ? <p className="mt-2 text-sm text-rose-500 font-medium">{Array.isArray(error) ? error[0] : error}</p> : null}
    </label>
  );

  return (
    <div className="mx-auto flex max-w-5xl items-center justify-center px-4 py-16 lg:px-8">
      <div className="w-full max-w-xl rounded-[2rem] border-2 border-rust-200 bg-white p-6 shadow-lg lg:p-8">
        <div className="mb-6 text-center">
          <h1 className="mt-3 text-3xl font-semibold text-slate-900"> HungryHub</h1>
          <p className="mt-2 text-sm text-slate-600">Check your account status and continue securely.</p>
        </div>



        {mode === 'check' ? (
          <form onSubmit={handleEmailCheck} className="space-y-4">
            {renderField('Email Address', email, (event) => setEmail(event.target.value), 'email', <FiMail />, errors.email)}
            <PrimaryButton className="w-full" type="submit" disabled={loading}>
              {loading ? 'Checking account...' : 'Continue'}
            </PrimaryButton>
          </form>
        ) : null}

        {mode === 'login' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Login to your account</span>
              <button type="button" onClick={() => handleModeSwitch('signup')} className="text-rust-500 font-medium">Create account</button>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              {renderField('Email Address', form.email || email, (event) => setForm({ ...form, email: event.target.value }), 'email', <FiMail />, errors.email)}
              <label className="block text-sm text-slate-700 font-medium">
                <span className="mb-2 block">Password</span>
                <div className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white px-4 py-3">
                  <FiLock className="text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="w-full bg-transparent text-slate-900 outline-none"
                    placeholder="Password"
                  />
                  <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="text-slate-400">
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password ? <p className="mt-2 text-sm text-rose-500 font-medium">{Array.isArray(errors.password) ? errors.password[0] : errors.password}</p> : null}
              </label>
              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={() => navigate('/forgot-password', { state: { email: form.email || email } })} className="text-rust-500 font-medium">Forgot Password?</button>
                <button type="button" onClick={() => handleModeSwitch('check')} className="text-slate-600">Use another email</button>
              </div>
              <PrimaryButton className="w-full" type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Login'}
              </PrimaryButton>
            </form>
          </div>
        ) : null}

        {mode === 'signup' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Create a new account</span>
              <button type="button" onClick={() => handleModeSwitch('login')} className="text-rust-500 font-medium">Already have an account?</button>
            </div>
             <form onSubmit={handleSignup} className="space-y-4">
              {renderField('Full Name', form.full_name, (event) => setForm({ ...form, full_name: event.target.value }), 'text', <FiUser />, errors.full_name)}
              {renderField('Email Address', form.email || email, (event) => setForm({ ...form, email: event.target.value }), 'email', <FiMail />, errors.email)}
              {renderField('Date of Birth', form.dob, (event) => setForm({ ...form, dob: event.target.value }), 'date', <FiUser />, errors.dob)}
              <label className="block text-sm text-slate-700 font-medium">
                <span className="mb-2 block">Password</span>
                <div className="flex items-center gap-3 rounded-2xl border-2 border-slate-200 bg-white px-4 py-3">
                  <FiLock className="text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={(event) => setForm({ ...form, password: event.target.value })}
                    className="w-full bg-transparent text-slate-900 outline-none"
                    placeholder="Password"
                  />
                  <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="text-slate-400">
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password ? <p className="mt-2 text-sm text-rose-500 font-medium">{Array.isArray(errors.password) ? errors.password[0] : errors.password}</p> : null}
              </label>
              {renderField('Confirm Password', form.confirm_password, (event) => setForm({ ...form, confirm_password: event.target.value }), 'password', <FiLock />, errors.confirm_password)}
              <PrimaryButton className="w-full" type="submit" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </PrimaryButton>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}
