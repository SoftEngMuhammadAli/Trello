import { forwardRef } from 'react';

const Input = forwardRef(function Input({ label, error, className = '', ...props }, ref) {
  return (
    <label className="flex flex-col gap-1 text-sm text-slate-700">
      {label ? <span className="font-medium">{label}</span> : null}
      <input
        ref={ref}
        className={`rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-800 outline-none ring-brand-500 transition focus:border-brand-500 focus:ring-2 ${className}`}
        {...props}
      />
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </label>
  );
});

export default Input;



