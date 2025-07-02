import { ExternalLink, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background/80 backdrop-blur py-6 mt-auto">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center sm:justify-between px-4 space-y-2 sm:space-y-0">
        <div className="flex justify-center space-x-6">
          <a
            href="https://memory.lol"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Powered by Memory.lol</span>
          </a>
          <a
            href="https://github.com/BankkRoll/memoryloler"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <Github className="h-4 w-4" />
            <span>Source</span>
          </a>
        </div>
      </div>
    </footer>
  );
} 