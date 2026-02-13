import { Link } from "react-router-dom";
import { Activity } from "lucide-react";

interface LogoWithTextProps {
  className?: string;
  textSize?: "sm" | "md" | "lg" | "xl";
  showLink?: boolean;
  to?: string;
}

export const LogoWithText = ({ 
  className = "", 
  textSize = "md",
  showLink = true,
  to = "/"
}: LogoWithTextProps) => {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl",
    xl: "text-3xl sm:text-4xl"
  };

  const iconSizeClasses = {
    sm: "w-8 h-8 sm:w-10 sm:h-10",
    md: "w-10 h-10 sm:w-12 sm:h-12",
    lg: "w-12 h-12 sm:w-14 sm:h-14",
    xl: "w-14 h-14 sm:w-16 sm:h-16"
  };

  const activityIconSizes = {
    sm: "h-5 w-5",
    md: "h-6 w-6 sm:h-7 sm:w-7",
    lg: "h-7 w-7 sm:h-8 sm:w-8",
    xl: "h-8 w-8 sm:h-9 sm:w-9"
  };

  const content = (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* <div className={`${iconSizeClasses[textSize]} rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg`}> */}
        {/* <Activity className={`${activityIconSizes[textSize]} text-white animate-pulse`} /> */}
      {/* </div> */}
      <img src='/favicon.ico' alt="Engagematic" />
      <span className={`${sizeClasses[textSize]} font-bold text-gradient-premium-world-class`}>
        Engagematic
      </span>
    </div>
  );

  if (showLink) {
    return (
      <Link to={to} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
};

