'use client';

import { useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';

import { Link, usePathname, useRouter } from '@/core/i18n/navigation';
import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/shared/components/ui/sidebar';
import { NavItem, type Nav as NavType } from '@/shared/types/blocks/common';

export function Nav({ nav, className }: { nav: NavType; className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 生成稳定的 key，避免 hydration 问题
  const generateKey = (item: NavItem | undefined, index: number) => {
    return item?.url || item?.title || `nav-item-${index}`;
  };

  // 判断是否激活，避免在服务端渲染时使用 pathname
  const isActive = (url?: string, isActiveFlag?: boolean) => {
    if (isActiveFlag) return true;
    if (!mounted || !url) return false;
    return pathname.startsWith(url);
  };

  return (
    <SidebarGroup className={className}>
      <SidebarGroupContent className="mt-0 flex flex-col gap-2">
        {nav.title && <SidebarGroupLabel>{nav.title}</SidebarGroupLabel>}
        <SidebarMenu>
          {nav.items.map((item: NavItem | undefined, index: number) => (
            <Collapsible
              key={generateKey(item, index)}
              asChild
              defaultOpen={item?.is_expand || false}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                {item?.children ? (
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item?.title}
                      className={`${
                        isActive(item?.url as string, item?.is_active)
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90 hover:text-sidebar-accent-foreground active:bg-sidebar-accent/90 active:text-sidebar-accent-foreground min-w-8 duration-200 ease-linear'
                          : ''
                      }`}
                    >
                      {item?.icon && <SmartIcon name={item.icon as string} />}
                      <span>{item?.title || ''}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                ) : (
                  <SidebarMenuButton
                    asChild
                    tooltip={item?.title}
                    className={`${
                      isActive(item?.url as string, item?.is_active)
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90 hover:text-sidebar-accent-foreground active:bg-sidebar-accent/90 active:text-sidebar-accent-foreground min-w-8 duration-200 ease-linear'
                        : ''
                    }`}
                  >
                    <Link
                      href={item?.url as string}
                      target={item?.target as string}
                    >
                      {item?.icon && <SmartIcon name={item.icon as string} />}
                      <span>{item?.title || ''}</span>
                    </Link>
                  </SidebarMenuButton>
                )}
                {item?.children && (
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.children?.map((subItem: NavItem, subIndex: number) => (
                        <SidebarMenuSubItem
                          key={subItem.url || subItem.title || `sub-${subIndex}`}
                        >
                          <SidebarMenuSubButton
                            asChild
                            className={`${
                              subItem.is_active ||
                              (mounted &&
                                pathname.endsWith(subItem.url as string))
                                ? 'bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent/90 hover:text-sidebar-accent-foreground active:bg-sidebar-accent/90 active:text-sidebar-accent-foreground min-w-8 duration-200 ease-linear'
                                : ''
                            }`}
                          >
                            <Link
                              href={subItem.url as string}
                              target={subItem.target as string}
                            >
                              {/* {subItem.icon && (
                                <SmartIcon name={subItem.icon as string} />
                              )} */}
                              <span className="px-2">{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                )}
              </SidebarMenuItem>
            </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
