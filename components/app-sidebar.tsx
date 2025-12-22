import {
  BlockGameIcon,
  DashboardSpeed01Icon,
  Coins01Icon,
  RacingFlagIcon,
  AlertDiamondIcon,
  PlusSignIcon,
  Brain03Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logo } from "./ui/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { NavUser } from "./ui/nav-user";
import { Button } from "./ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: DashboardSpeed01Icon,
  },
  {
    title: "Ausgaben",
    url: "#",
    icon: Coins01Icon,
    isActive: true,
    items: [
      {
        title: "Alle Ausgaben",
        url: "/ausgaben/alle-ausgaben",
      },
      {
        title: "Wiederkehrend",
        url: "/ausgaben/wiederkehrend",
      },
    ],
  },
  {
    title: "Kategorien",
    url: "/kategorien",
    icon: BlockGameIcon,
  },
  {
    title: "Ziele",
    url: "/ziele",
    icon: RacingFlagIcon,
  },
  {
    title: "Limits",
    url: "/limits",
    icon: AlertDiamondIcon,
  },
  {
    title: "Prognosen",
    url: "/prognosen",
    icon: Brain03Icon,
  },
];

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
};

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Application</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Button>
                  <HugeiconsIcon icon={PlusSignIcon} />
                  Neue Ausgabe
                </Button>
              </SidebarMenuItem>
              {items.map((item) => {
                if (item.items && item.items.length > 0) {
                  return (
                    <Collapsible
                      key={item.title}
                      defaultOpen={item.isActive}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger
                          render={<SidebarMenuButton tooltip={item.title} />}
                        >
                          <HugeiconsIcon icon={item.icon} />
                          <span>{item.title}</span>
                          <HugeiconsIcon
                            icon={ArrowRight01Icon}
                            className="ml-auto transition-transform duration-200 group-data-open/collapsible:rotate-90"
                          />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  render={<a href={subItem.url} />}
                                >
                                  <span>{subItem.title}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton render={<a href={item.url} />}>
                      <HugeiconsIcon icon={item.icon} />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
