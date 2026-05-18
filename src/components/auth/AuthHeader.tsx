import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import logoAplicada from "@/assets/logo-aplicada-simbolo.png";

interface AnimatedNavLinkProps {
  to: string;
  children: React.ReactNode;
}

const AnimatedNavLink = ({ to, children }: AnimatedNavLinkProps) => {
  return (
    <Link
      to={to}
      className="relative overflow-hidden inline-block group text-sm text-muted-foreground hover:text-foreground transition-colors"
    >
      <span className="block transition-transform duration-300 group-hover:-translate-y-full">
        {children}
      </span>
      <span className="absolute top-full left-0 block transition-transform duration-300 group-hover:-translate-y-full text-foreground">
        {children}
      </span>
    </Link>
  );
};

interface AuthHeaderProps {
  setIsOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AuthHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const [headerShapeClass, setHeaderShapeClass] = useState('rounded-full');
  const shapeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    if (shapeTimeoutRef.current) {
      clearTimeout(shapeTimeoutRef.current);
    }

    if (isOpen) {
      setHeaderShapeClass('rounded-xl');
    } else {
      shapeTimeoutRef.current = setTimeout(() => {
        setHeaderShapeClass('rounded-full');
      }, 300);
    }

    return () => {
      if (shapeTimeoutRef.current) {
        clearTimeout(shapeTimeoutRef.current);
      }
    };
  }, [isOpen]);

  const navLinksData = [
    { label: 'Sobre', to: '/sobre' },
    { label: 'Entrar', to: '/auth' },
  ];

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "fixed top-4 left-0 right-0 z-50 mx-auto",
        "bg-brand-cream border border-brand-hairline shadow-lg shadow-foreground/5",
        "px-10 py-2 w-fit max-w-2xl",
        "transition-all duration-300 ease-in-out",
        headerShapeClass
      )}
    >
      {/* Desktop Header */}
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/auth" className="flex items-center gap-2">
          <img 
            src={logoAplicada}
            alt="IAplicada" 
            className="h-10 w-auto cursor-pointer"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 ml-12">
          {navLinksData.map((link) => (
            <AnimatedNavLink key={link.label} to={link.to}>
              {link.label}
            </AnimatedNavLink>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden"
          >
            <nav className="flex flex-col gap-3 pt-4 pb-2">
              {navLinksData.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors text-sm py-2"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
