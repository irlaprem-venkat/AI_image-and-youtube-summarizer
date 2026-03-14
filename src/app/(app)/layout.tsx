import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Sidebar />
      <div className="flex flex-col md:pl-64 flex-1">
        <Header />
        <main className="flex-1 p-4 md:p-8 pt-6 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
