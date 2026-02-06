export const Button = ({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      {...props}
      className={`px-4 py-2 rounded-lg font-medium transition ${props.className || ""}`}
    >
      {children}
    </button>
  );
};
