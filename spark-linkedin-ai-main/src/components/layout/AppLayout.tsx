import { Outlet, useLocation } from "react-router-dom";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

const AppLayout = () => {
  const location = useLocation();
  // Hide header and footer on dashboard routes (they have their own layout)
  const isDashboardRoute = ['/dashboard', '/idea-generator', '/post-generator', '/comment-generator'].includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
      {!isDashboardRoute && <Header />}
      <main className="flex-1 w-full overflow-x-hidden">
        <Outlet />
      </main>
      {!isDashboardRoute && <Footer />}
    </div>
  );
};

export default AppLayout;


