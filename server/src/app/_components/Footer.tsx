// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          Built by MyAmble. The source code is available on GitHub.
        </p>
        <nav className="flex items-center space-x-4">
          <a
            href="/privacy"
            className="text-sm text-muted-foreground hover:underline"
          >
            Privacy Policy
          </a>
          <a
            href="/terms"
            className="text-sm text-muted-foreground hover:underline"
          >
            Terms of Service
          </a>
          <a
            href="/help"
            className="text-sm text-muted-foreground hover:underline"
          >
            Help
          </a>
        </nav>
      </div>
    </footer>
  );
}
