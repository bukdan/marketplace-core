import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Loader2, Search, RefreshCw, Users, Shield, UserCog, Calendar,
  Mail, Phone, Ban, Pencil, ShieldOff, Key, Eye, CheckSquare,
  UserCheck, UserX, Coins, MoreHorizontal, Trash2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

interface UserWithRole {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  phone_number: string | null;
  avatar_url: string | null;
  is_active: boolean;
  primary_role: string;
  address: string | null;
  created_at: string;
  role: string;
  listing_count?: number;
}

export default function AdminUsers() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Detail sheet
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);

  // Role dialog
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [processing, setProcessing] = useState(false);

  // Block/Unblock dialog
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [blocking, setBlocking] = useState(false);

  // Edit profile dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);

  // Add credits dialog
  const [creditDialogOpen, setCreditDialogOpen] = useState(false);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditNote, setCreditNote] = useState('');
  const [addingCredits, setAddingCredits] = useState(false);

  // Bulk selection
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [bulkBlockDialogOpen, setBulkBlockDialogOpen] = useState(false);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  // Delete user dialog
  const [deleteUserDialog, setDeleteUserDialog] = useState<{ open: boolean; user: UserWithRole | null }>({ open: false, user: null });
  const [deletingUser, setDeletingUser] = useState(false);

  const logAuditAction = async (action: string, targetId: string, details: Record<string, unknown>) => {
    try {
      await supabase.from('audit_logs').insert({
        user_id: currentUser?.id,
        action,
        entity_type: 'user',
        entity_id: targetId,
        details: details as any,
      });
    } catch (e) {
      console.error('Audit log error:', e);
    }
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles for all users
      const userIds = (profiles || []).map(p => p.user_id);
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role')
        .in('user_id', userIds.length > 0 ? userIds : ['__none__']);

      const roleMap = new Map<string, string>();
      roles?.forEach(r => roleMap.set(r.user_id, r.role));

      // Fetch listing counts per user
      const { data: listingCounts } = await supabase
        .from('listings')
        .select('user_id')
        .is('deleted_at', null)
        .in('user_id', userIds.length > 0 ? userIds : ['__none__']);

      const countMap = new Map<string, number>();
      listingCounts?.forEach(l => {
        countMap.set(l.user_id, (countMap.get(l.user_id) || 0) + 1);
      });

      const enriched: UserWithRole[] = (profiles || []).map(p => ({
        ...p,
        is_active: p.is_active !== false,
        role: roleMap.get(p.user_id) || 'user',
        listing_count: countMap.get(p.user_id) || 0,
      }));

      setUsers(enriched);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal memuat data users' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Assign role
  const handleAssignRole = async () => {
    if (!selectedUser || !newRole) return;
    setProcessing(true);
    const previousRole = selectedUser.role;

    try {
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', selectedUser.user_id)
        .maybeSingle();

      if (existingRole) {
        const { error } = await supabase
          .from('user_roles')
          .update({ role: newRole as any })
          .eq('user_id', selectedUser.user_id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: selectedUser.user_id, role: newRole as any });
        if (error) throw error;
      }

      await logAuditAction('user_role_changed', selectedUser.user_id, {
        user_name: selectedUser.name,
        previous_role: previousRole,
        new_role: newRole,
      });

      setUsers(prev => prev.map(u =>
        u.user_id === selectedUser.user_id ? { ...u, role: newRole } : u
      ));

      toast({ title: 'Role Updated', description: `Role berhasil diubah menjadi ${newRole}` });
      setRoleDialogOpen(false);
      setSelectedUser(null);
      setNewRole('');
    } catch (error) {
      console.error('Error updating role:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal mengubah role' });
    } finally {
      setProcessing(false);
    }
  };

  // Toggle active status (block/unblock)
  const handleToggleStatus = async () => {
    if (!selectedUser) return;
    setBlocking(true);
    const newStatus = !selectedUser.is_active;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_active: newStatus })
        .eq('user_id', selectedUser.user_id);
      if (error) throw error;

      await logAuditAction(newStatus ? 'user_activated' : 'user_deactivated', selectedUser.user_id, {
        user_name: selectedUser.name,
        email: selectedUser.email,
      });

      setUsers(prev => prev.map(u =>
        u.user_id === selectedUser.user_id ? { ...u, is_active: newStatus } : u
      ));

      toast({
        title: newStatus ? 'User Diaktifkan' : 'User Dinonaktifkan',
        description: `${selectedUser.name || selectedUser.email} berhasil ${newStatus ? 'diaktifkan' : 'dinonaktifkan'}`,
      });
      setBlockDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error toggling status:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal mengubah status user' });
    } finally {
      setBlocking(false);
    }
  };

  // Edit profile
  const handleEditProfile = async () => {
    if (!selectedUser) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: editName, phone_number: editPhone })
        .eq('user_id', selectedUser.user_id);
      if (error) throw error;

      await logAuditAction('user_profile_updated', selectedUser.user_id, {
        previous_name: selectedUser.name,
        new_name: editName,
      });

      setUsers(prev => prev.map(u =>
        u.user_id === selectedUser.user_id ? { ...u, name: editName, phone_number: editPhone } : u
      ));

      toast({ title: 'Profile Updated', description: 'Profile user berhasil diperbarui' });
      setEditDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal memperbarui profile' });
    } finally {
      setSaving(false);
    }
  };

  // Add credits manual by admin
  const handleAddCredits = async () => {
    if (!selectedUser || !creditAmount) return;
    const amount = parseInt(creditAmount);
    if (isNaN(amount) || amount <= 0 || amount > 100000) {
      toast({ variant: 'destructive', title: 'Error', description: 'Jumlah kredit harus antara 1 - 100.000' });
      return;
    }
    setAddingCredits(true);
    try {
      const { data, error } = await supabase.rpc('admin_add_credits', {
        p_user_id: selectedUser.user_id,
        p_amount: amount,
        p_description: creditNote || `Penambahan kredit oleh admin`,
        p_admin_id: currentUser?.id,
      });
      if (error) throw error;
      const result = data as any;
      if (!result.success) throw new Error(result.message);

      await logAuditAction('credits_added', selectedUser.user_id, {
        user_name: selectedUser.name,
        amount,
        note: creditNote,
        new_balance: result.new_balance,
      });

      toast({ title: 'Kredit Ditambahkan', description: `${amount} kredit berhasil ditambahkan ke ${selectedUser.name || selectedUser.email}` });
      setCreditDialogOpen(false);
      setCreditAmount('');
      setCreditNote('');
      setSelectedUser(null);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Gagal', description: error.message });
    } finally {
      setAddingCredits(false);
    }
  };

  // Bulk block
  const handleBulkBlock = async () => {
    if (selectedUsers.size === 0) return;
    setBulkProcessing(true);

    try {
      const usersToBlock = users.filter(u => selectedUsers.has(u.user_id) && u.is_active);

      for (const u of usersToBlock) {
        await supabase.from('profiles').update({ is_active: false }).eq('user_id', u.user_id);
        await logAuditAction('user_deactivated', u.user_id, {
          user_name: u.name,
          email: u.email,
          action: 'bulk_block',
        });
      }

      toast({ title: 'Users Dinonaktifkan', description: `${usersToBlock.length} user berhasil dinonaktifkan` });
      setSelectedUsers(new Set());
      setBulkBlockDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error bulk blocking:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal menonaktifkan users' });
    } finally {
      setBulkProcessing(false);
    }
  };

  // Delete user (soft: deactivate + remove listings)
  const handleDeleteUser = async () => {
    if (!deleteUserDialog.user) return;
    setDeletingUser(true);
    const targetUser = deleteUserDialog.user;

    try {
      // Deactivate profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ is_active: false, name: `[Deleted] ${targetUser.name || ''}` })
        .eq('user_id', targetUser.user_id);
      if (profileError) throw profileError;

      // Soft delete all listings
      await supabase
        .from('listings')
        .update({ deleted_at: new Date().toISOString(), status: 'expired' as any })
        .eq('user_id', targetUser.user_id)
        .is('deleted_at', null);

      await logAuditAction('user_deleted', targetUser.user_id, {
        user_name: targetUser.name,
        email: targetUser.email,
        action: 'admin_delete',
      });

      toast({ title: 'User Dihapus', description: `${targetUser.name || targetUser.email} berhasil dihapus` });
      setDeleteUserDialog({ open: false, user: null });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal menghapus user' });
    } finally {
      setDeletingUser(false);
    }
  };

  // Selection helpers
  const toggleSelectUser = (userId: string) => {
    const next = new Set(selectedUsers);
    next.has(userId) ? next.delete(userId) : next.add(userId);
    setSelectedUsers(next);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && user.is_active) ||
      (statusFilter === 'inactive' && !user.is_active);
    const userDate = new Date(user.created_at);
    const matchesDateFrom = !dateFrom || userDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || userDate <= new Date(dateTo + 'T23:59:59');
    return matchesSearch && matchesRole && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const toggleSelectAll = () => {
    if (selectedUsers.size === filteredUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map(u => u.user_id)));
    }
  };

  function getRoleBadge(role: string) {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      admin: { label: 'Admin', variant: 'destructive' },
      umkm_owner: { label: 'UMKM Owner', variant: 'default' },
      bandar: { label: 'Bandar', variant: 'default' },
      user: { label: 'User', variant: 'secondary' },
    };
    const config = map[role] || map.user;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  }

  // Stats
  const adminCount = users.filter(u => u.role === 'admin').length;
  const activeCount = users.filter(u => u.is_active).length;
  const inactiveCount = users.filter(u => !u.is_active).length;

  return (
    <AdminLayout title="User Management" description="Kelola semua users dan assign roles">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama atau email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Role</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="umkm_owner">UMKM Owner</SelectItem>
                  <SelectItem value="bandar">Bandar</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={fetchUsers} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground">Joined:</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-[150px]"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-[150px]"
                />
              </div>
              {(statusFilter !== 'all' || roleFilter !== 'all' || dateFrom || dateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setRoleFilter('all');
                    setStatusFilter('all');
                    setDateFrom('');
                    setDateTo('');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {filteredUsers.length !== users.length && (
              <p className="text-sm text-muted-foreground">
                Menampilkan {filteredUsers.length} dari {users.length} users
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bulk Action Bar */}
      {selectedUsers.size > 0 && (
        <Card className="mb-4 border-primary">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{selectedUsers.size} user dipilih</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBulkBlockDialogOpen(true)}
                  className="gap-2"
                >
                  <Ban className="h-4 w-4" />
                  Nonaktifkan
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedUsers(new Set())}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={selectedUsers.size === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Listings</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    Tidak ada user ditemukan
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedUsers.has(user.user_id)}
                        onCheckedChange={() => toggleSelectUser(user.user_id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name || 'No Name'}</p>
                        {user.email && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </p>
                        )}
                        {user.phone_number && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.phone_number}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {user.is_active ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>{user.listing_count}</TableCell>
                    <TableCell>
                      {format(new Date(user.created_at), 'dd MMM yyyy', { locale: localeId })}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => { setSelectedUser(user); setDetailSheetOpen(true); }} title="Detail">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setSelectedUser(user); setEditName(user.name || ''); setEditPhone(user.phone_number || ''); setEditDialogOpen(true); }}>
                              <Pencil className="h-4 w-4 mr-2" /> Edit Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedUser(user); setNewRole(user.role); setRoleDialogOpen(true); }}>
                              <UserCog className="h-4 w-4 mr-2" /> Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedUser(user); setCreditAmount(''); setCreditNote(''); setCreditDialogOpen(true); }}>
                              <Coins className="h-4 w-4 mr-2" /> Tambah Kredit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => { setSelectedUser(user); setBlockDialogOpen(true); }}>
                              {user.is_active ? <><Ban className="h-4 w-4 mr-2" /> Blokir User</> : <><ShieldOff className="h-4 w-4 mr-2" /> Aktifkan User</>}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteUserDialog({ open: true, user })}>
                              <Trash2 className="h-4 w-4 mr-2" /> Hapus User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Detail Sheet */}
      <Sheet open={detailSheetOpen} onOpenChange={setDetailSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>User Details</SheetTitle>
            <SheetDescription>Informasi lengkap user</SheetDescription>
          </SheetHeader>
          {selectedUser && (
            <div className="mt-6 space-y-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-muted-foreground text-xs">Nama</Label>
                  <p className="font-medium">{selectedUser.name || 'No Name'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Email</Label>
                  <p className="font-medium">{selectedUser.email || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Phone</Label>
                  <p className="font-medium">{selectedUser.phone_number || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Address</Label>
                  <p className="font-medium">{selectedUser.address || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Role</Label>
                  <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Status</Label>
                  <div className="mt-1">
                    {selectedUser.is_active ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Total Listings</Label>
                  <p className="font-medium">{selectedUser.listing_count}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Joined</Label>
                  <p className="font-medium">
                    {format(new Date(selectedUser.created_at), 'dd MMMM yyyy', { locale: localeId })}
                  </p>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-2">
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => {
                    setDetailSheetOpen(false);
                    setNewRole(selectedUser.role);
                    setRoleDialogOpen(true);
                  }}
                >
                  <UserCog className="h-4 w-4" />
                  Change Role
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Assign Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
            <DialogDescription>
              Ubah role untuk user: {selectedUser?.name || 'Unknown'}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Select Role</Label>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  <span className="flex items-center gap-2"><Shield className="h-4 w-4" /> Admin</span>
                </SelectItem>
                <SelectItem value="umkm_owner">
                  <span className="flex items-center gap-2"><UserCog className="h-4 w-4" /> UMKM Owner</span>
                </SelectItem>
                <SelectItem value="bandar">
                  <span className="flex items-center gap-2"><UserCog className="h-4 w-4" /> Bandar</span>
                </SelectItem>
                <SelectItem value="user">
                  <span className="flex items-center gap-2"><Users className="h-4 w-4" /> User</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>Batal</Button>
            <Button onClick={handleAssignRole} disabled={processing}>
              {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block/Unblock Dialog */}
      <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.is_active ? 'Nonaktifkan User?' : 'Aktifkan User?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.is_active
                ? `User ${selectedUser?.name || selectedUser?.email} akan dinonaktifkan dan tidak dapat mengakses platform.`
                : `User ${selectedUser?.name || selectedUser?.email} akan diaktifkan kembali.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleStatus} disabled={blocking}>
              {blocking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {selectedUser?.is_active ? 'Nonaktifkan' : 'Aktifkan'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update profile untuk {selectedUser?.name || selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Nama</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Batal</Button>
            <Button onClick={handleEditProfile} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Credits Dialog */}
      <Dialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-primary" />
              Tambah Kredit Manual
            </DialogTitle>
            <DialogDescription>
              Tambah kredit untuk: <strong>{selectedUser?.name || selectedUser?.email}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Jumlah Kredit *</Label>
              <Input
                type="number"
                min="1"
                max="100000"
                placeholder="Contoh: 500"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">Maksimal 100.000 kredit sekali tambah</p>
            </div>
            <div>
              <Label>Catatan / Alasan</Label>
              <Input
                placeholder="Contoh: Bonus promosi, kompensasi, dll."
                value={creditNote}
                onChange={(e) => setCreditNote(e.target.value)}
                className="mt-1"
                maxLength={100}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreditDialogOpen(false)}>Batal</Button>
            <Button onClick={handleAddCredits} disabled={addingCredits || !creditAmount}>
              {addingCredits && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Coins className="mr-2 h-4 w-4" />
              Tambah Kredit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Block Dialog */}
      <AlertDialog open={bulkBlockDialogOpen} onOpenChange={setBulkBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Nonaktifkan {selectedUsers.size} Users?</AlertDialogTitle>
            <AlertDialogDescription>
              Semua user yang dipilih akan dinonaktifkan. Tindakan ini dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkBlock} disabled={bulkProcessing}>
              {bulkProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Nonaktifkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete User Dialog */}
      <AlertDialog open={deleteUserDialog.open} onOpenChange={(open) => setDeleteUserDialog({ open, user: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus User?</AlertDialogTitle>
            <AlertDialogDescription>
              User <strong>{deleteUserDialog.user?.name || deleteUserDialog.user?.email}</strong> akan dihapus. 
              Akun akan dinonaktifkan dan semua listing akan dihapus. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} disabled={deletingUser} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deletingUser && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
