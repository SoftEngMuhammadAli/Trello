import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { forgotPassword } from '../features/auth/authSlice';

function ForgotPasswordPage() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(forgotPassword({ email }));

    if (forgotPassword.fulfilled.match(result)) {
      toast.success(result.payload.message || 'If email exists, reset instructions were sent');
      setEmail('');
      return;
    }

    toast.error(result.payload || 'Request failed');
  };

  return (
    <AuthLayout
      title="Reset password"
      subtitle="Enter your email and we will trigger the secure reset flow."
      footer={
        <Link to="/login" className="font-semibold text-accent underline underline-offset-4">
          Back to login
        </Link>
      }
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Button className="w-full" type="submit">
          Send reset instructions
        </Button>
      </form>
    </AuthLayout>
  );
}

export default ForgotPasswordPage;
