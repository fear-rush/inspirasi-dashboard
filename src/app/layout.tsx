import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import Sidebar from "@/components/Sidebar";
import ReactQueryProvider from "@/components/ReactQueryProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Earthquake Map",
  description: "Visualize earthquake data on an interactive map",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReactQueryProvider>
          <Sidebar>{children}</Sidebar>
          <Toaster />
        </ReactQueryProvider>
      </body>
    </html>
  );
}
