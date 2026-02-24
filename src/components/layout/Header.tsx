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
  Settings,
  Coins,
  Home,
  LayoutDashboard,
  MapPin,
  ChevronDown,
  MessageCircle,
  Package,
  Bell,
} from 'lucide-react';
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

  return (
    <header className="sticky top-0 z-50 border-b bg-primary text-primary-foreground">
      {/* Top Bar */}
      <div className="container px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={logoImg} alt="UMKM ID" className="h-8 w-auto" />
            <span className="hidden text-xl font-bold sm:block">UMKM ID</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden flex-1 max-w-xl md:flex">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari iklan apapun di UMKM ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background text-foreground pl-10 pr-4"
              />
            </div>
          </form>

          {/* Location Selector - Desktop */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="hidden gap-1 text-primary-foreground hover:bg-primary-foreground/10 lg:flex">
                <MapPin className="h-4 w-4" />
                <span>Pilih lokasi</span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Seluruh Indonesia</DropdownMenuItem>
              <DropdownMenuItem>Jakarta</DropdownMenuItem>
              <DropdownMenuItem>Surabaya</DropdownMenuItem>
              <DropdownMenuItem>Bandung</DropdownMenuItem>
              <DropdownMenuItem>Medan</DropdownMenuItem>
              <DropdownMenuItem>Semarang</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Pasang Iklan Button */}
            <Button
              onClick={() => navigate(user ? '/listing/create' : '/auth')}
              className="hidden gap-2 bg-background text-foreground hover:bg-background/90 sm:flex"
            >
              <Plus className="h-4 w-4" />
              Pasang Iklan
            </Button>

            {user ? (
              <>
                {/* Credits Badge - Desktop */}
                <Button
                  variant="ghost"
                  onClick={() => navigate('/credits')}
                  className="hidden gap-1 text-primary-foreground hover:bg-primary-foreground/10 md:flex"
                >
                  <Coins className="h-4 w-4" />
                  <span>{credits?.balance || 0}</span>
                </Button>

                {/* Notifications Badge - Desktop */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/notifications')}
                  className="relative hidden text-primary-foreground hover:bg-primary-foreground/10 md:flex"
                >
                  <Bell className="h-5 w-5" />
                  {notifCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-xs flex items-center justify-center text-destructive-foreground">
                      {notifCount > 9 ? '9+' : notifCount}
                    </span>
                  )}
                </Button>

                {/* Messages Badge - Desktop */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate('/messages')}
                  className="relative hidden text-primary-foreground hover:bg-primary-foreground/10 md:flex"
                >
                  <MessageCircle className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-xs flex items-center justify-center text-destructive-foreground">
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
                      className="text-primary-foreground hover:bg-primary-foreground/10"
                    >
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.email}</p>
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
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Pengaturan
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
                variant="ghost"
                onClick={() => navigate('/auth')}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <User className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Masuk</span>
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary-foreground hover:bg-primary-foreground/10 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col gap-4 py-4">
                  {/* Mobile Search */}
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Cari iklan..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </form>

                  {/* Mobile Nav Links */}
                  <nav className="flex flex-col gap-1">
                    {navLinks.map((link) => (
                      <Button
                        key={link.href}
                        variant={isActive(link.href) ? 'secondary' : 'ghost'}
                        className="justify-start"
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

                  {/* Mobile Pasang Iklan */}
                  <Button
                    onClick={() => {
                      navigate(user ? '/listing/create' : '/auth');
                      setIsSheetOpen(false);
                    }}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Pasang Iklan
                  </Button>

                  {user && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          navigate('/credits');
                          setIsSheetOpen(false);
                        }}
                        className="w-full justify-between"
                      >
                        <span className="flex items-center gap-2">
                          <Coins className="h-4 w-4" />
                          Kredit Saya
                        </span>
                        <Badge variant="secondary">{credits?.balance || 0}</Badge>
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          navigate('/profile');
                          setIsSheetOpen(false);
                        }}
                        className="w-full justify-start"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profil Saya
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          navigate('/messages');
                          setIsSheetOpen(false);
                        }}
                        className="w-full justify-start"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Pesan
                      </Button>

                      <Button
                        variant="outline"
                        onClick={() => {
                          navigate('/dashboard');
                          setIsSheetOpen(false);
                        }}
                        className="w-full justify-start"
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Button>

                      <Button
                        variant="ghost"
                        onClick={() => {
                          handleLogout();
                          setIsSheetOpen(false);
                        }}
                        className="w-full justify-start text-destructive hover:text-destructive"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Keluar
                      </Button>
                    </>
                  )}

                  {!user && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate('/auth');
                        setIsSheetOpen(false);
                      }}
                      className="w-full"
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

      {/* Secondary Nav - Desktop */}
      <div className="hidden border-t border-primary-foreground/20 bg-primary/95 md:block">
        <div className="container px-4">
          <nav className="flex h-10 items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`text-sm font-medium transition-colors hover:text-primary-foreground/80 ${
                  isActive(link.href)
                    ? 'text-primary-foreground'
                    : 'text-primary-foreground/70'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/credits"
              className={`text-sm font-medium transition-colors hover:text-primary-foreground/80 ${
                isActive('/credits')
                  ? 'text-primary-foreground'
                  : 'text-primary-foreground/70'
              }`}
            >
              Beli Kredit
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
