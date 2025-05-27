"use client";

import { usePathname } from "next/navigation";
import NotificationDropdown from "@/components/shared/SidebarNotifications";
import AccountPopover from "@/components/shared/AccountPopover";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { Menu } from "@/components/sidebar-contents/gen-manager";
import RoleLayout from "@/components/guards/RoleLayout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";


export default function EngineeringDepartmentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pageName, setPageName] = useState("Overview");

  useEffect(() => {
    // If at root, explicitly set "Overview"
    if (pathname === "/pages/engineering") {
      setPageName("Engineering Department Overview");
    } else {
      setPageName(pathname.split("/").pop()?.replace("-", " ") || "Overview");
    }
  }, [pathname]);

  return (
    <SidebarProvider>
      <AppSidebar menuData={Menu} />
      <SidebarInset>
        <div className="flex flex-col flex-1">
          <header className="flex h-16 items-center gap-2 border-b px-4 justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/pages/engineering">
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="capitalize">
                    {pageName}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
            {/* NotificationDropdown moved to the left of AccountPopover */}
            <div className="flex items-center gap-4">
              <NotificationDropdown />
              <AccountPopover />
            </div>
          </header>
          <main className="p-4"><RoleLayout allowedRole="manager">{children}</RoleLayout></main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
