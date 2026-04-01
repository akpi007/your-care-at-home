import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="absolute top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-card/80 backdrop-blur border border-border text-foreground shadow-sm transition-colors hover:bg-accent"
    >
      <ArrowLeft className="h-5 w-5" />
    </button>
  );
};

export default BackButton;
