/* layout.tsx file */

import '../styles/globals.css';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <title>AutoAudit</title>
      </head>
      <body className="bg-light-bg">
        {/* Hero Section for 'Start a Check' button */}
        <div className="hero-section py-16 text-center bg-light-bg">
          <h1 className="text-4xl font-bold text-primary-blue mb-4">Welcome to AutoAudit</h1>
          <p className="text-xl text-secondary-blue mb-6">Get a full report on your next used car. Make an informed decision.</p>
          <a href="/start-check" className="button-link">
            Start a Check
          </a>
        </div>

        {/* Centered logo with subtle background */}
        <div className="logo-container mx-auto py-6 flex justify-center">
          <img
            src="/logo.png" // path to your logo
            alt="AutoAudit Logo"
            className="logo w-32"  // Adjust size as needed
          />
        </div>

        {/* Main content */}
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </body>
    </html>
  );
}