import React from "react";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const navigate = useNavigate();

  React.useEffect(() => {
    navigate("/settings/about");
  }, []);
}
