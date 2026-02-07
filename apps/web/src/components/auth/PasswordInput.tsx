"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  showStrength?: boolean;
}

export function PasswordInput({
  showStrength = false,
  className = "",
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);

  const calculateStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    return Math.min(score, 5);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (showStrength) {
      setStrength(calculateStrength(e.target.value));
    }
    props.onChange?.(e);
  };

  const strengthColors = [
    "bg-gray-300",
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
  ];

  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"];

  return (
    <div className="w-full space-y-2">
      <div className="relative">
        <input
          {...props}
          type={showPassword ? "text" : "password"}
          onChange={handleChange}
          className={`w-full pr-10 ${className}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
          tabIndex={-1}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {showStrength && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((level) => (
              <div
                key={level}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  level <= strength ? strengthColors[strength] : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          {strength > 0 && (
            <p className={`text-xs ${strength < 3 ? "text-orange-600" : "text-green-600"}`}>
              {strengthLabels[strength]}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
