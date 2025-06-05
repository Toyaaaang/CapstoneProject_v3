"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
// import { SearchForm } from "@/components/search-form";
// import { VersionSwitcher } from "@/components/version-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

interface SidebarItem {
  title: string;
  url: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  menuData: SidebarSection[];
  versions?: string[];
}

export function AppSidebar({ menuData, versions = [], ...props }: AppSidebarProps) {
  const router = useRouter();
  const pathname = usePathname(); // Get current page

  return (
    <aside className="select-none">
      <Sidebar {...props}>
        <SidebarHeader>
          {/* {versions.length > 0 && (
            // <VersionSwitcher versions={versions} defaultVersion={versions[0]} />
          )} */}

          {/* Top Section: Logo + Title + Notifications */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-x-3 my-3">
              <Image src="/app-logo.png" alt="Logo" width={40} height={40} className="h-10 w-10" />
              <div className="flex flex-col leading-tight">
                <span className="text-sm text-gray-600">Warehouse Operations</span>
                <span className="text-sm text-gray-600">Management System</span>
              </div>
            </div>

          </div>

          {/* Bottom Section: Full-Width Search */}
          <div className="w-full">
            {/* <SearchForm /> */}
          </div>
        </SidebarHeader>

        <SidebarContent>
          {menuData.map((section) => (
            <SidebarGroup key={section.title}>
              <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => {
                    const isActive = pathname === item.url; // Check if active
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          onClick={() => router.push(item.url)}
                        >
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarRail />
      </Sidebar>
    </aside>
  );
}
