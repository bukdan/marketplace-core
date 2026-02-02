import { useLocation, useNavigate } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  LayoutDashboard,
  Wallet,
  Package,
  ShoppingCart,
  MessageCircle,
  Bell,
  User,
  Settings,
  LogOut,
  Plus,
  Coins,
  Home,
  ShoppingBag,
  Heart,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { Badge } from '@/components/ui/badge';

const mainNavItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Wallet', url: '/dashboard/wallet', icon: Wallet },
  { title: 'Iklan Saya', url: '/dashboard/listings', icon: Package },
  { title: 'Pesanan', url: '/dashboard/orders', icon: ShoppingCart },
  { title: 'Pesan', url: '/dashboard/messages', icon: MessageCircle, hasBadge: true },
  { title: 'Wishlist', url: '/dashboard/wishlist', icon: Heart },
];

const quickLinks = [
  { title: 'Beranda', url: '/', icon: Home },
  { title: 'Marketplace', url: '/marketplace', icon: ShoppingBag },
  { title: 'Beli Kredit', url: '/credits', icon: Coins },
];

export function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useSidebar();
  const { signOut, user } = useAuth();
  const { credits } = useCredits();
  const { unreadCount } = useUnreadMessages();

  const isCollapsed = state === 'collapsed';

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <ShoppingBag className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold">UMKM ID</span>
              <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                {user?.email}
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Quick Action */}
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-2 py-2">
              <Button
                onClick={() => navigate('/listing/create')}
                className="w-full justify-start gap-2"
                size={isCollapsed ? 'icon' : 'default'}
              >
                <Plus className="h-4 w-4" />
                {!isCollapsed && <span>Pasang Iklan</span>}
              </Button>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Credits Display */}
        {!isCollapsed && (
          <SidebarGroup>
            <SidebarGroupContent>
              <div className="mx-2 p-3 rounded-lg bg-sidebar-accent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Kredit</span>
                  </div>
                  <Badge variant="secondary" className="font-bold">
                    {credits?.balance || 0}
                  </Badge>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Menu Utama</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                      {item.hasBadge && unreadCount > 0 && !isCollapsed && (
                        <Badge variant="destructive" className="ml-auto text-xs">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                      )}
                      {item.hasBadge && unreadCount > 0 && isCollapsed && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] flex items-center justify-center text-destructive-foreground">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Links */}
        <SidebarGroup>
          <SidebarGroupLabel>Pintasan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {quickLinks.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={isCollapsed ? item.title : undefined}
                  >
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3"
                    >
                      <item.icon className="h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Pengaturan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/dashboard/profile')}
                  tooltip={isCollapsed ? 'Profil' : undefined}
                >
                  <NavLink
                    to="/dashboard/profile"
                    className="flex items-center gap-3"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                  >
                    <User className="h-4 w-4" />
                    {!isCollapsed && <span>Profil</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={isActive('/dashboard/settings')}
                  tooltip={isCollapsed ? 'Pengaturan' : undefined}
                >
                  <NavLink
                    to="/dashboard/settings"
                    className="flex items-center gap-3"
                    activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
                  >
                    <Settings className="h-4 w-4" />
                    {!isCollapsed && <span>Pengaturan</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <div className="flex items-center justify-between gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
