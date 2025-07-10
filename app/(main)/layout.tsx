import TopNavbar from "@/components/TopNavbar";
import BottomNavigation from "@/components/BottomNavigation";
import PWAProvider from "@/components/PWAProvider";
import PWAInstaller from "@/components/PWAInstaller";

export default function MainAppLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <PWAProvider>
      <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <TopNavbar />
        <main className="relative pb-32 md:pb-40">{children}</main>
        <BottomNavigation />
        <PWAInstaller />
      </div>
    </PWAProvider>
  );
}
