"use client";

import { usePathname } from "next/navigation";
import NotificationDropdown from "@/components/shared/SidebarNotifications";
import AccountPopover from "@/components/shared/AccountPopover";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/shared/app-sidebar";
import { Menu } from "@/components/sidebar-contents/budget";
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

export default function BudgetAnalystLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pageName, setPageName] = useState("Overview");

  useEffect(() => {
    if (pathname === "/pages/budget") {
      setPageName("Budget Analyst Overview");
    } else {
      // Capitalize each word for better display
      const last = pathname.split("/").pop() || "Overview";
      setPageName(
        last
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase())
      );
    }
  }, [pathname]);

  return (
    <RoleLayout allowedRole="budget_analyst">
      <SidebarProvider>
        <AppSidebar menuData={Menu} />
        <SidebarInset>
          <div
            className={`
              flex flex-col flex-1 min-h-screen
              bg-cover bg-center
              bg-[url('/bg-admin-light.svg')]
              dark:bg-[url('/bg-admin-dark.svg')]
            `}
          >
            <div className="flex flex-col flex-1">
              <header className="flex h-16 items-center gap-2 border-b px-4 justify-between"
                style={{
                  background: "rgba(0, 17, 252, 0.04)",
                  boxShadow: "0 8px 32px 0 rgba(23,23,23,0.17)",
                  backdropFilter: "blur(4.5px)",
                  WebkitBackdropFilter: "blur(4.5px)",
                }}
              >
                <div className="flex items-center gap-2">
                  <SidebarTrigger className="-ml-1" />
                  <Separator orientation="vertical" className="mr-2 h-4" />
                  {/* Make breadcrumb unselectable */}
                  <Breadcrumb className="select-none">
                    <BreadcrumbList>
                      <BreadcrumbItem className="hidden md:block">
                        <BreadcrumbLink href="/pages/budget">
                          Budget Analyst
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
              <main className="p-4">{children}</main>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </RoleLayout>
  );
}
