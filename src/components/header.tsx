import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Github, Shield } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export default function Header({ isAuthenticated, onLogin, onLogout }: HeaderProps) {
  return (
    <header className="w-full border-b bg-background/80 backdrop-blur sticky top-0 z-30">
      <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center space-x-2 group">
          <span className="hidden md:block text-xl font-bold tracking-tight">
            MEMORYLOLER
          </span>
          <span className="block md:hidden text-xl font-bold tracking-tight">
            ML
          </span>
        </Link>
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <Badge variant="default" className="bg-green-600">
              <Shield className="mr-1 h-3 w-3" />
              Authenticated
            </Badge>
          ) : (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              <AlertTriangle className="mr-1 h-3 w-3" />
              Limited Access
            </Badge>
          )}
          {isAuthenticated ? (
            <Button variant="outline" size="sm" onClick={onLogout}>
              Logout
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={onLogin}>
              <Github className="mr-2 h-4 w-4" />
              Get Full Access
            </Button>
          )}
        </div>
      </div>
    </header>
  );
} 