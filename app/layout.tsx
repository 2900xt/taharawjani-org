import MenuBar from "@/components/MenuBar";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "Taha Rawjani - Portfolio",
  description: "Taha Rawjani - Software Engineer Portfolio",
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
          {children}
        </div>
        <Analytics />
      </body>
    </html>
  );
}
