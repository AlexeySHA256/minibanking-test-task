'use client';

import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { useUserStore } from '@/features/user/store';
import { useTransactionsStore } from './store';
import { toast } from 'sonner';

export function TransferForm() {
  const [toAccountId, setToAccountId] = useState('');
  const [currency, setCurrency] = useState('');
  const [amount, setAmount] = useState('');
  const user = useUserStore(state => state.user)
  const currenciesMap = useTransactionsStore(state => state.currenciesMap)
  const loading = useTransactionsStore(state => state.loading)
  const transfer = useTransactionsStore(state => state.transfer)

  const isFormValid = toAccountId.trim() && currency.trim() && !isNaN(parseFloat(amount))

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      await transfer({ toAccountId, currency, amount: parseFloat(amount) })
    } catch (error) {
      toast.error("Transfer failed", { description: error instanceof Error ? error.message : undefined })
    }

    // Reset form
    setToAccountId('');
    setAmount('');
  };

  return (
    <Card className='w-md'>
      <CardHeader>
        <CardTitle>Transfer Money</CardTitle>
        <CardDescription>Send money to another account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipientId">Recipient Account ID</Label>
            <Input
              id="recipientId"
              type="text"
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              placeholder="4718dd6a-b997-4a6a-95bf-ec6a7be4e7db"
              required
            />
          </div>

          <Select
            value={currency}
            onValueChange={setCurrency}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {user?.accounts.map(acc => (
                <SelectItem key={acc.id} value={acc.currency}>{currenciesMap[acc.currency]}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || !isFormValid}>
            {loading ? 'Processing...' : 'Send Transfer'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
