/**
 * Navigation principale
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/shared/hooks/use-auth';
import { LogOut, User, Loader2, KeyRound } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

import { ROLES, ROLE_LABELS_AR } from '@/shared/constants';

// Tous les éléments de navigation possibles
const allNavItems = [
  { href: '/dashboard', label: 'لوحة التحكم', roles: [ROLES.ADMIN] },
  { href: '/users', label: 'إدارة المستخدمين', roles: [ROLES.ADMIN] },
  { href: '/', label: 'طلب جديد', roles: [ROLES.ADMIN, ROLES.GESTIONNAIRE_CLIENTELE] },
  { href: '/orders', label: 'الطلبات', roles: [ROLES.ADMIN, ROLES.GESTIONNAIRE_CLIENTELE] },
  { href: '/stock', label: 'إدارة المخزون', roles: [ROLES.ADMIN, ROLES.GESTIONNAIRE_STOCK] },
  { href: '/accounts', label: 'إدارة الحسابات', roles: [ROLES.ADMIN, ROLES.COMPTABLE] },
  { href: '/fleet', label: 'إدارة السيارات', roles: [ROLES.ADMIN, ROLES.GESTIONNAIRE_TRUCKS] },
];

/**
 * Filtrer les éléments de navigation selon le rôle de l'utilisateur
 */
function getNavItemsForRole(userRole: string | undefined) {
  if (!userRole) return [];
  
  // ADMIN voit tout
  if (userRole === ROLES.ADMIN) {
    return allNavItems;
  }
  
  // Filtrer selon le rôle
  return allNavItems.filter(item => item.roles.includes(userRole as any));
}

export function MainNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const resetPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'تنبيه',
        description: 'يرجى تعبئة جميع الحقول',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'تنبيه',
        description: 'كلمة المرور الجديدة غير متطابقة',
        variant: 'destructive',
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      toast({
        title: 'نجاح',
        description: 'تم تغيير كلمة المرور بنجاح',
      });
      setIsPasswordOpen(false);
      resetPasswordForm();
    } catch (error: any) {
      const message = error?.message || 'فشل في تغيير كلمة المرور';
      toast({
        title: 'خطأ',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Obtenir les éléments de navigation autorisés pour cet utilisateur
  const navItems = getNavItemsForRole(user?.role);

  return (
    <>
      <nav className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">نظام إدارة الشركة</h2>
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User className="h-4 w-4" />
                    {user.firstName} {user.lastName}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>حسابي</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.firstName} {user.lastName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground mt-1">
                        الدور: {ROLE_LABELS_AR[user.role] || user.role}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsPasswordOpen(true)} className="cursor-pointer">
                    <KeyRound className="ml-2 h-4 w-4" />
                    تغيير كلمة المرور
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="ml-2 h-4 w-4" />
                    تسجيل الخروج
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          {navItems.length > 0 && (
            <div className="flex gap-2 flex-wrap justify-center">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button variant={pathname === item.href ? 'default' : 'ghost'}>
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>

      <ChangePasswordDialog
        open={isPasswordOpen}
        onOpenChange={(open) => {
          setIsPasswordOpen(open);
          if (!open) {
            resetPasswordForm();
          }
        }}
        currentPassword={currentPassword}
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        onCurrentPasswordChange={setCurrentPassword}
        onNewPasswordChange={setNewPassword}
        onConfirmPasswordChange={setConfirmPassword}
        onSubmit={handleChangePassword}
        isLoading={isChangingPassword}
      />
    </>
  );
}

// Dialog pour changer le mot de passe
export function ChangePasswordDialog({
  open,
  onOpenChange,
  currentPassword,
  newPassword,
  confirmPassword,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  onCurrentPasswordChange: (value: string) => void;
  onNewPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle>تغيير كلمة المرور</DialogTitle>
          <DialogDescription>أدخل كلمة المرور الحالية وكلمة المرور الجديدة.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>كلمة المرور الحالية</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => onCurrentPasswordChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>كلمة المرور الجديدة</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => onNewPasswordChange(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>تأكيد كلمة المرور الجديدة</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => onConfirmPasswordChange(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button onClick={onSubmit} disabled={isLoading}>
              {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حفظ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
