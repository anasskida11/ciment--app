/**
 * Résumé des comptes par type
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Account } from '../types';
import { formatCurrency } from '@/shared/utils/format';

interface AccountSummaryProps {
  accounts: Account[];
  clientsCount?: number;
  suppliersCount?: number;
}

const getBalanceColor = (balance: number): string => {
  if (balance > 0) return 'text-green-600';
  if (balance < 0) return 'text-red-600';
  return 'text-gray-600';
};

export function AccountSummary({ accounts, clientsCount, suppliersCount }: AccountSummaryProps) {
  const clientAccounts = accounts.filter((a) => a.accountType === 'CLIENT');
  const supplierAccounts = accounts.filter((a) => a.accountType === 'SUPPLIER');

  const totalByType = {
    client: clientAccounts.reduce((sum, a) => {
      const balance = typeof a.balance === 'string' ? parseFloat(a.balance) : a.balance;
      return sum + (balance || 0);
    }, 0),
    supplier: supplierAccounts.reduce((sum, a) => {
      const balance = typeof a.balance === 'string' ? parseFloat(a.balance) : a.balance;
      return sum + (balance || 0);
    }, 0),
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">العملاء</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-3xl font-bold">{clientsCount ?? clientAccounts.length}</p>
          <p className={`text-sm font-semibold ${getBalanceColor(totalByType.client)}`}>
            {totalByType.client > 0 ? 'نحن مدينون: ' : 'يدينون لنا: '}
            {formatCurrency(Math.abs(totalByType.client))}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-muted-foreground">الموردين</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-3xl font-bold">{suppliersCount ?? supplierAccounts.length}</p>
          <p className={`text-sm font-semibold ${getBalanceColor(totalByType.supplier)}`}>
            {totalByType.supplier > 0 ? 'نحن مدينون: ' : 'يدينون لنا: '}
            {formatCurrency(Math.abs(totalByType.supplier))}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
