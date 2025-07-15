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
      <div className="min-h-screen">
        <TopNavbar />
        <main className="relative main-content-safe-padding">{children}</main>
        <BottomNavigation />
        <PWAInstaller />
      </div>
    </PWAProvider>
  );
}
