import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  Menu,
  User,
  LogOut,
  Coins,
  Home,
  LayoutDashboard,
  MessageCircle,
  Package,
  Bell,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import logoImg from '@/assets/logo.png';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { credits } = useCredits();
  const { unreadCount } = useUnreadMessages();
  const { unreadCount: notifCount } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/marketplace', label: 'Jelajahi', icon: Package },
  ];

  const isActive = (path: string) => location.pathname === path;

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-background shadow-sm">
      <div className="container px-4">
        <div className="flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={logoImg} alt="UMKM ID" className="h-8 w-auto" />
            <span className="hidden text-lg font-bold text-foreground sm:block">UMKM ID</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden flex-1 max-w-xl md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari produk, toko, atau kategori..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 h-10 rounded-full border-border bg-muted/50 text-foreground text-sm focus:bg-background"
              />
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 text-foreground hover:bg-muted"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Pasang Iklan Button */}
            <Button
              size="sm"
              onClick={() => navigate(user ? '/listing/create' : '/auth')}
              className="hidden gap-1.5 sm:flex h-9 text-xs rounded-full"
            >
              <Plus className="h-3.5 w-3.5" />
              Pasang Iklan
            </Button>

            {user ? (
              <>
                {/* Credits */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/credits')}
                  className="hidden gap-1 text-foreground hover:bg-muted md:flex h-9"
                >
                  <Coins className="h-4 w-4" />
                  <span className="text-xs font-medium">{credits?.balance || 0}</span>
                </Button>

                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/notifications')}
                  className="relative hidden text-foreground hover:bg-muted md:flex h-9 w-9"
                >
                  <Bell className="h-4 w-4" />
                  {notifCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] flex items-center justify-center text-destructive-foreground">
                      {notifCount > 9 ? '9+' : notifCount}
                    </span>
                  )}
                </Button>

                {/* Messages */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/messages')}
                  className="relative hidden text-foreground hover:bg-muted md:flex h-9 w-9"
                >
                  <MessageCircle className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-[10px] flex items-center justify-center text-destructive-foreground">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-foreground hover:bg-muted h-9 w-9"
                    >
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium truncate">{user.email}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Coins className="h-3 w-3" />
                        <span>{credits?.balance || 0} Kredit</span>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="mr-2 h-4 w-4" />
                      Profil Saya
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/messages')}>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Pesan
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-auto text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/orders')}>
                      <Package className="mr-2 h-4 w-4" />
                      Pesanan
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/credits')}>
                      <Coins className="mr-2 h-4 w-4" />
                      Beli Kredit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Keluar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/auth')}
                className="h-9 text-xs"
              >
                <User className="mr-1.5 h-4 w-4" />
                <span className="hidden sm:inline">Masuk</span>
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground hover:bg-muted md:hidden h-9 w-9"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-3 py-4">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Cari produk..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 h-9 text-sm"
                      />
                    </div>
                  </form>

                  {/* Mobile Nav Links */}
                  <nav className="flex flex-col gap-0.5">
                    {navLinks.map((link) => (
                      <Button
                        key={link.href}
                        variant={isActive(link.href) ? 'secondary' : 'ghost'}
                        size="sm"
                        className="justify-start h-9"
                        onClick={() => {
                          navigate(link.href);
                          setIsSheetOpen(false);
                        }}
                      >
                        <link.icon className="mr-2 h-4 w-4" />
                        {link.label}
                      </Button>
                    ))}
                  </nav>

                  <hr className="border-border" />

                  {/* Theme toggle mobile */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="justify-start h-9"
                    onClick={toggleTheme}
                  >
                    {theme === 'dark' ? (
                      <Sun className="mr-2 h-4 w-4" />
                    ) : (
                      <Moon className="mr-2 h-4 w-4" />
                    )}
                    {theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => {
                      navigate(user ? '/listing/create' : '/auth');
                      setIsSheetOpen(false);
                    }}
                    className="w-full h-9"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Pasang Iklan
                  </Button>

                  {user && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { navigate('/credits'); setIsSheetOpen(false); }}
                        className="w-full justify-between h-9"
                      >
                        <span className="flex items-center gap-2">
                          <Coins className="h-4 w-4" />
                          Kredit
                        </span>
                        <Badge variant="secondary" className="text-xs">{credits?.balance || 0}</Badge>
                      </Button>

                      <Button variant="ghost" size="sm" onClick={() => { navigate('/dashboard'); setIsSheetOpen(false); }} className="w-full justify-start h-9">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>

                      <Button variant="ghost" size="sm" onClick={() => { navigate('/messages'); setIsSheetOpen(false); }} className="w-full justify-start h-9">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Pesan
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { handleLogout(); setIsSheetOpen(false); }}
                        className="w-full justify-start text-destructive hover:text-destructive h-9"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Keluar
                      </Button>
                    </>
                  )}

                  {!user && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => { navigate('/auth'); setIsSheetOpen(false); }}
                      className="w-full h-9"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Masuk / Daftar
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
