'use client'; // Ensure this is marked as a Client Component

import '../styles/globals.css'; // Make sure the global styles are linked

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
        {/* Logo container with left alignment and larger size */}
        <div className="logo-container mx-auto py-6 flex justify-start">
          <img
            src="/logo.png"  // Path to your updated logo
            alt="AutoAudit Logo"
            className="logo"  // Apply the correct class for styling
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