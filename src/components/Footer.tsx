import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import raphaLogoIcon from "@/assets/rapha-logo-nav.png";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={raphaLogoIcon} alt="Rapha Telehealth" className="h-8 w-8 object-contain" />
              <span className="font-display text-lg font-bold text-foreground">
                Rapha<span className="text-primary"> Telehealth</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Quality healthcare delivered to your doorstep by verified professionals.
            </p>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-foreground">Services</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/professionals?service=doctor" className="hover:text-primary transition-colors">Doctors</Link></li>
              <li><Link to="/professionals?service=nurse" className="hover:text-primary transition-colors">Nurses</Link></li>
              <li><Link to="/professionals?service=physio" className="hover:text-primary transition-colors">Physiotherapists</Link></li>
              <li><Link to="/professionals?service=lab" className="hover:text-primary transition-colors">Lab Technicians</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-foreground">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/careers" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-semibold mb-4 text-foreground">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                +1 (800) 123-4567
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                support@raphatelehealth.com
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Available nationwide
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Rapha Telehealth. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
