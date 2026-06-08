import MenuBar from "@/components/MenuBar";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  metadataBase: new URL("https://taharawjani.org"),
  title: "ahat",
  description: "ahat's home",
  alternates: {
    types: {
      "application/rss+xml": "/feed.xml",
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="system-container">
          <MenuBar />
          <div className="desktop-container">
            <Sidebar side="left" />
            <div className="main-content">{children}</div>
            <Sidebar side="right" />
          </div>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
