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
      <div className="system-container">
        <body>
          <MenuBar />
          {children}
        </body>
      </div>
      <Analytics />
    </html>
  );
}
