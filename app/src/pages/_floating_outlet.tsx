import { X } from "lucide-react";
import { Outlet, useNavigate } from "react-router-dom";

export default function FloatingOutlet() {
  const navigate = useNavigate();

  return (
    <div className="bg-settings-page-bg shadow-settings-page-bg fixed bottom-20 left-48 right-48 top-20 z-[70] rounded-xl shadow-2xl">
      <Outlet />
      <X className="absolute right-4 top-4 cursor-pointer hover:rotate-90" onClick={() => navigate("/")} />
    </div>
  );
}
