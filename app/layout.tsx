// Import global styles (this includes the styles you added in globals.css)
import '../styles/globals.css';

// Define the layout component
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
        {/* Main content of the page */}
        <div className="container mx-auto">
          {children}
        </div>
      </body>
    </html>
  );
}