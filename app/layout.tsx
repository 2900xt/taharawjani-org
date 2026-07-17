import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import TopBarVisualizer from "@/components/TopBarVisualizer";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://taharawjani.org"),
  title: "ahat.",
  description: ":D ~ ahat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="desktop">
          <div className="menu-bar">
            <strong>ahat</strong>
            <span>home&nbsp;&nbsp;file&nbsp;&nbsp;view</span>
            <div className="menu-right">
              <span className="menu-status-icon" aria-hidden="true">
                <i />
              </span>
              <TopBarVisualizer />
            </div>
          </div>
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  );
}
