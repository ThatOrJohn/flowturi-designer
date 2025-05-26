import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t py-4 px-6 flex items-center justify-center">
      <a
        href="https://github.com/ThatOrJohn/flowturi-designer"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Github className="h-5 w-5" />
        <span>GitHub Repository</span>
      </a>
    </footer>
  );
}
