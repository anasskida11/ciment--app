/**
 * Liste des comptes
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit2, Trash2, DollarSign, Eye } from 'lucide-react';
import type { Account } from '../types';
import { formatCurrency, formatDate } from '@/shared/utils/format';

interface AccountListProps {
  accounts: Account[];
  searchTerm: string;
  selectedType: 'all' | 'CLIENT' | 'SUPPLIER';
  onEdit: (account: Account) => void;
  onDelete: (id: string) => void;
  onAdjustBalance: (id: string) => void;
  onHistory: (account: Account) => void;
}

const getTypeLabel = (type: 'CLIENT' | 'SUPPLIER'): string => {
  return type === 'CLIENT' ? 'عميل' : 'مورد';
};

const getBalanceColor = (balance: number | string): string => {
  const numBalance = typeof balance === 'string' ? parseFloat(balance) : balance;
  if (numBalance > 0) return 'text-green-600';
  if (numBalance < 0) return 'text-red-600';
  return 'text-gray-600';
};

export function AccountList({
  accounts,
  searchTerm,
  selectedType,
  onEdit,
  onDelete,
  onAdjustBalance,
  onHistory,
}: AccountListProps) {
  const filteredAccounts = accounts.filter((a) => {
    const matchesType = selectedType === 'all' || a.accountType === selectedType;
    const matchesSearch =
      a.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>الحسابات</CardTitle>
        <CardDescription>
          {filteredAccounts.length} حساب
          {selectedType !== 'all' && ` (${getTypeLabel(selectedType as 'CLIENT' | 'SUPPLIER')})`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border overflow-hidden">
          <Table dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">الرصيد</TableHead>
                <TableHead className="text-right">آخر تحديث</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    لا توجد حسابات
                  </TableCell>
                </TableRow>
              ) : (
                filteredAccounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-semibold text-right">
                      {account.client?.name || account.supplier?.name || 'غير محدد'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{getTypeLabel(account.accountType)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={getBalanceColor(account.balance)}>
                        {formatCurrency(account.balance)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground text-right">
                      {formatDate(account.updatedAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => onHistory(account)} title="السجل">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onAdjustBalance(account.id)}>
                          <DollarSign className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onEdit(account)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onDelete(account.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
