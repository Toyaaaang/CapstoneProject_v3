"use client";

import { usePathname } from "next/navigation";
import NotificationDropdown from "@/components/shared/SidebarNotifications";
import AccountPopover from "@/components/shared/AccountPopover";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { Menu } from "@/components/sidebar-contents/finance";
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
import { ModeToggle } from "@/components/themes/ModeToggle";


export default function OperationsMaintainanceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pageName, setPageName] = useState("Overview");

  useEffect(() => {
    if (pathname === "/dashboard/finance") {
      setPageName("Overview");
    } else {
      setPageName(pathname.split("/").pop()?.replace("-", " ") || "Overview");
    }
  }, [pathname]);

  return (
    <RoleLayout allowedRole="finance">
      <SidebarProvider>
        <AppSidebar menuData={Menu} />
        <SidebarInset>
          <div className="flex flex-col flex-1 min-h-screen bg-cover bg-center bg-[url('/bg-admin-light.svg')] dark:bg-[url('/bg-admin-dark.svg')]">
            <div className="flex flex-col flex-1">
              <header className="flex h-16 items-center gap-2 border-b px-4 justify-between">
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 h-4" />
                  <Breadcrumb>
                    <BreadcrumbList>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href="/pages/finance">
                          Finance
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
                <div className="flex items-center gap-4">
                  <ModeToggle />
                  <NotificationDropdown />
                  <AccountPopover />
                </div>
              </header>
              <main className="p-4"><RoleLayout allowedRole="finance">{children}</RoleLayout></main>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RoleLayout>
  );
}
