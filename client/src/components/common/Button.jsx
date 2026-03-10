import classNames from 'classnames';

function Button({ className, variant = 'primary', loading = false, children, ...props }) {
  return (
    <button
      className={classNames(
        'rounded-xl px-4 py-2 text-sm font-semibold transition duration-150 disabled:cursor-not-allowed disabled:opacity-60 active:translate-y-[1px]',
        {
          'bg-brand-600 text-white hover:bg-brand-700': variant === 'primary',
          'border border-app bg-panel text-app hover:bg-hover': variant === 'secondary',
          'bg-rose-600 text-white hover:bg-rose-700': variant === 'danger',
          'bg-emerald-600 text-white hover:bg-emerald-700': variant === 'success',
        },
        className,
      )}
      {...props}
    >
      {loading ? 'Please wait...' : children}
    </button>
  );
}

export default Button;


