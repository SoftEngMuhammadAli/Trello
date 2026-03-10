import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { loginUser } from '../features/auth/authSlice';

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const authStatus = useSelector((state) => state.auth.status);

  const [form, setForm] = useState({ email: '', password: '' });

  const onSubmit = async (event) => {
    event.preventDefault();

    const result = await dispatch(loginUser(form));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back');
      navigate(location.state?.from?.pathname || '/dashboard');
    } else {
      toast.error(result.payload || 'Login failed');
    }
  };

  return (
    <AuthLayout
      title="Sign in"
      subtitle="Access your workspace command center and continue shipping."
      footer={
        <>
          New here?{' '}
          <Link to="/signup" className="font-semibold text-accent underline underline-offset-4">
            Create account
          </Link>
        </>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          required
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          required
        />
        <Button className="w-full" type="submit" loading={authStatus === 'loading'}>
          Continue to dashboard
        </Button>
      </form>

      <Link
        to="/forgot-password"
        className="mt-4 inline-block text-sm font-semibold text-accent underline underline-offset-4"
      >
        Forgot password?
      </Link>
    </AuthLayout>
  );
}

export default LoginPage;
