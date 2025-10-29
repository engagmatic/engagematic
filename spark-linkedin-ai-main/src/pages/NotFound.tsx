import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
      <div className="text-center animate-fade-in">
        <h1 className="text-[120px] font-extrabold text-indigo-600 drop-shadow-lg">404</h1>
        <p className="text-2xl font-semibold mb-2">Page Not Found</p>
        <p className="mb-6 text-gray-600">
          The page you’re looking for doesn’t exist or may have been moved.
        </p>
        <a
          href="/"
          className="inline-block rounded-lg bg-indigo-600 px-6 py-3 text-white font-medium shadow-md hover:bg-indigo-700 transition duration-200"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
