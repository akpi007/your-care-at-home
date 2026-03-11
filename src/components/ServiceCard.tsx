import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  href: string;
  color: string;
}

const ServiceCard = ({ icon: Icon, title, description, href, color }: ServiceCardProps) => {
  return (
    <Link
      to={href}
      className="group flex flex-col items-center rounded-2xl bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1"
    >
      <div
        className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${color} transition-transform duration-300 group-hover:scale-110`}
      >
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="font-display text-base font-semibold text-card-foreground">{title}</h3>
      <p className="mt-1 text-center text-sm text-muted-foreground">{description}</p>
    </Link>
  );
};

export default ServiceCard;
