import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  HeaderProvider,
  HeaderTitle,
  HeaderAction,
} from "@/components/app/header-context";
import { AppSidebar } from "@/components/app/app-sidebar";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SidebarProvider>
        <HeaderProvider>
          <AppSidebar />
          <div className="w-full h-screen overflow-auto p-4">
            <Card>
              <CardHeader>
                <div className="flex flex-row items-center gap-2 w-full">
                  <SidebarTrigger />
                  <Separator orientation="vertical" />
                  <HeaderTitle />
                  <div className="ml-auto">
                    <HeaderAction />
                  </div>
                </div>
              </CardHeader>
              <CardContent>{children}</CardContent>
            </Card>
          </div>
        </HeaderProvider>
      </SidebarProvider>
      <Toaster />
    </>
  );
}
