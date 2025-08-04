import React from "react";
import "./button.css";

export interface ButtonProps {
  /** The content to display inside the button */
  children: React.ReactNode;
  /** The variant of the button */
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  /** The size of the button */
  size?: "sm" | "md" | "lg";
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether the button is in loading state */
  loading?: boolean;
  /** Whether the button should take full width */
  fullWidth?: boolean;
  /** The type of the button */
  type?: "button" | "submit" | "reset";
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Additional CSS classes */
  className?: string;
  /** Additional props */
  [key: string]: unknown;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  type = "button",
  onClick,
  className = "",
  ...props
}) => {
  const baseClass = "fractal-button";
  const variantClass = `fractal-button--${variant}`;
  const sizeClass = `fractal-button--${size}`;
  const widthClass = fullWidth ? "fractal-button--full-width" : "";
  const loadingClass = loading ? "fractal-button--loading" : "";
  const disabledClass = disabled ? "fractal-button--disabled" : "";

  const buttonClasses = [
    baseClass,
    variantClass,
    sizeClass,
    widthClass,
    loadingClass,
    disabledClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={disabled || loading}
      onClick={handleClick}
      {...props}
    >
      {loading && (
        <span className="fractal-button__loader">
          <svg className="fractal-button__spinner" viewBox="0 0 24 24">
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="31.416"
              strokeDashoffset="31.416"
            />
          </svg>
        </span>
      )}
      <span className="fractal-button__content">{children}</span>
    </button>
  );
};

export default Button;
