import "./globals.css";

export const metadata = {
  title: "Deal Girly Finder",
  description: "Upload a pic, find the cheapest match online."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}