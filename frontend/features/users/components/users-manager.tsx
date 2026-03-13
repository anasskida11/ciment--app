/**
 * Gestionnaire des utilisateurs (Admin)
 */

'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2, RotateCw } from 'lucide-react';
import { useUsers } from '../hooks/use-users';
import { ROLES, ROLE_LABELS_AR } from '@/shared/constants';
import type { CreateUserDto, User } from '../types';

const roleOptions = [
  ROLES.ADMIN,
  ROLES.GESTIONNAIRE_CLIENTELE,
  ROLES.GESTIONNAIRE_STOCK,
  ROLES.GESTIONNAIRE_TRUCKS,
  ROLES.COMPTABLE,
];

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    numberingSystem: 'latn',
  } as Intl.DateTimeFormatOptions);
}

export function UsersManager() {
  const { users, loading, createUser, updateUser, resetUserPassword, refetch } = useUsers();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);

  const [form, setForm] = useState<CreateUserDto>({
    email: '',
    firstName: '',
    lastName: '',
    role: ROLES.GESTIONNAIRE_CLIENTELE,
    isActive: true,
  });

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'all' ? true : user.role === roleFilter;
      const matchesStatus =
        statusFilter === 'all' ? true : statusFilter === 'active' ? user.isActive : !user.isActive;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const resetForm = () => {
    setForm({
      email: '',
      firstName: '',
      lastName: '',
      role: ROLES.GESTIONNAIRE_CLIENTELE,
      isActive: true,
    });
  };

  const handleCreateUser = async () => {
    if (!form.email || !form.firstName || !form.lastName) {
      toast({
        title: 'تنبيه',
        description: 'يرجى تعبئة جميع الحقول المطلوبة',
        variant: 'destructive',
      });
      return;
    }

    setIsCreating(true);
    try {
      await createUser(form);
      setIsCreateOpen(false);
      resetForm();
      await refetch(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleToggleActive = async (user: User, isActive: boolean) => {
    setUpdatingId(user.id);
    try {
      await updateUser(user.id, { isActive });
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResetPassword = async (user: User) => {
    const confirmed = window.confirm(`هل تريد إعادة تعيين كلمة المرور للمستخدم ${user.email}؟`);
    if (!confirmed) return;

    setResettingId(user.id);
    try {
      await resetUserPassword(user.id);
    } finally {
      setResettingId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">إدارة المستخدمين</h1>
        <p className="text-muted-foreground">إنشاء وإدارة مستخدمي النظام</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle>قائمة المستخدمين</CardTitle>
              <CardDescription>إدارة الحسابات وتفعيلها وإعادة تعيين كلمات المرور</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => refetch(true)}>
                <RotateCw className="ml-2 h-4 w-4" />
                تحديث
              </Button>
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="ml-2 h-4 w-4" />
                    مستخدم جديد
                  </Button>
                </DialogTrigger>
                <DialogContent dir="rtl">
                  <DialogHeader>
                    <DialogTitle>إنشاء مستخدم جديد</DialogTitle>
                    <DialogDescription>
                      كلمة المرور الافتراضية هي 00000000. يمكنك تفعيل الحساب مباشرة من هنا.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label>الاسم الأول</Label>
                      <Input
                        value={form.firstName}
                        onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        placeholder="محمد"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>الاسم الأخير</Label>
                      <Input
                        value={form.lastName}
                        onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        placeholder="العربي"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>البريد الإلكتروني</Label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="user@company.com"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>الدور</Label>
                      <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الدور" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((role) => (
                            <SelectItem key={role} value={role}>
                              {ROLE_LABELS_AR[role] || role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="text-sm font-medium">تفعيل الحساب</p>
                        <p className="text-xs text-muted-foreground">يمكن للمستخدم تسجيل الدخول عند التفعيل</p>
                      </div>
                      <Switch
                        checked={!!form.isActive}
                        onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                        إلغاء
                      </Button>
                      <Button onClick={handleCreateUser} disabled={isCreating}>
                        {isCreating && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                        إنشاء
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Input
              placeholder="ابحث بالاسم أو البريد..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="min-w-[220px] flex-1"
            />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأدوار</SelectItem>
                {roleOptions.map((role) => (
                  <SelectItem key={role} value={role}>
                    {ROLE_LABELS_AR[role] || role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">معطل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table dir="rtl">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الاسم</TableHead>
                  <TableHead className="text-right">البريد الإلكتروني</TableHead>
                  <TableHead className="text-right">الدور</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                  <TableHead className="text-right">إجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      لا يوجد مستخدمون مطابقون
                    </TableCell>
                  </TableRow>
                )}
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-right font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell className="text-right">{user.email}</TableCell>
                    <TableCell className="text-right">{ROLE_LABELS_AR[user.role] || user.role}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Switch
                          checked={user.isActive}
                          disabled={updatingId === user.id}
                          onCheckedChange={(checked) => handleToggleActive(user, checked)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {user.isActive ? 'نشط' : 'معطل'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetPassword(user)}
                        disabled={resettingId === user.id}
                      >
                        {resettingId === user.id ? (
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCw className="ml-2 h-4 w-4" />
                        )}
                        إعادة تعيين كلمة المرور
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
