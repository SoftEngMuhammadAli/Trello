import { forwardRef } from 'react';
import classNames from 'classnames';

const Input = forwardRef(function Input(
  { label, error, hint, className = '', containerClassName = '', ...props },
  ref,
) {
  return (
    <label className={classNames('flex flex-col gap-1.5 text-sm text-app', containerClassName)}>
      {label ? <span className="font-semibold tracking-wide text-app-muted">{label}</span> : null}
      <input
        ref={ref}
        className={classNames(
          'rounded-xl border border-app bg-panel px-3 py-2.5 text-app outline-none ring-brand-500 transition focus:border-brand-500 focus:ring-2',
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs font-medium text-rose-400">{error}</span> : null}
      {hint && !error ? <span className="text-xs text-app-muted">{hint}</span> : null}
    </label>
  );
});

export default Input;
