import { forwardRef } from 'react';

const Input = forwardRef(function Input({ label, error, className = '', ...props }, ref) {
  return (
    <label className="flex flex-col gap-1 text-sm text-app">
      {label ? <span className="font-medium">{label}</span> : null}
      <input
        ref={ref}
        className={`rounded-xl border border-app bg-panel px-3 py-2 text-app outline-none ring-brand-500 transition focus:border-brand-500 focus:ring-2 ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  );
});

export default Input;



