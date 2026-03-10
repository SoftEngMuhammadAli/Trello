import classNames from 'classnames';

function Button({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  ...props
}) {
  return (
    <button
      className={classNames(
        'inline-flex items-center justify-center gap-2 rounded-xl border border-transparent font-semibold transition duration-150 disabled:cursor-not-allowed disabled:opacity-60 active:translate-y-[1px]',
        {
          'px-4 py-2.5 text-sm': size === 'md',
          'px-3 py-2 text-xs': size === 'sm',
          'px-5 py-3 text-sm': size === 'lg',
          'bg-accent text-white shadow-soft hover:bg-accent-strong': variant === 'primary',
          'border border-app bg-panel text-app hover:bg-hover': variant === 'secondary',
          'border border-app bg-transparent text-app-muted hover:bg-hover hover:text-app':
            variant === 'ghost',
          'bg-rose-600 text-white hover:bg-rose-700': variant === 'danger',
          'bg-emerald-600 text-white hover:bg-emerald-700': variant === 'success',
        },
        className,
      )}
      {...props}
    >
      {loading ? (
        <>
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/70 border-r-transparent" />
          Please wait...
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;
