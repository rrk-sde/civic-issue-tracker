import './globals.css';
import Providers from '@/components/Providers';

export const metadata = {
  title: 'CivicTrack.ai — Panchayat / Ward Civic Issue Tracker',
  description: 'Submit civic complaints, track resolution status, and manage ward-level issues with real-time SLA monitoring.',
  keywords: 'civic issues, panchayat, ward, complaint tracker, civic management, government',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('civic_theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', saved);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
