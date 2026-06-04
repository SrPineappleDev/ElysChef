import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";

const VipRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile || (profile.plan !== "vip" && profile.role !== "admin")) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default VipRoute;
