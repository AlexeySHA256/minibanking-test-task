'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { useTransactionsStore } from './store';
import { useUserStore } from '../user/store';
import { toast } from 'sonner';

export function ExchangeForm() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const getExchangeRate = useTransactionsStore(state => state.getExchangeRate)
  const exchangeRate = useTransactionsStore(state => state.exchangeRate)
  const exchange = useTransactionsStore(state => state.exchange)
  const currenciesMap = useTransactionsStore(state => state.currenciesMap)
  const loading = useTransactionsStore(state => state.loading)
  const user = useUserStore(state => state.user)

  const isFormValid = from.trim() && to.trim() && convertedAmount

  useEffect(() => {
    if (from.trim() && to.trim()) getExchangeRate(from, to)
  }, [from, to]);

  useEffect(() => {
    if (!exchangeRate || !amount) setConvertedAmount(null);

    const balance = user?.accounts.find(acc => acc.currency === from.trim())?.balance
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || !balance || numAmount > balance) return setConvertedAmount(null);

    setConvertedAmount(numAmount * exchangeRate);
  }, [amount, exchangeRate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    try {
      await exchange({ from, to, amount: parseFloat(amount) })
    } catch (error) {
      toast.error("Exchange failed", { description: error instanceof Error ? error.message : undefined })
    }

    // Reset form
    setAmount('');
    setConvertedAmount(null);
  };

  return (
    <Card className='w-md'>
      <CardHeader>
        <CardTitle>Exchange Currency</CardTitle>
        <CardDescription>Convert money between currencies</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label>Select currencies to exchange</Label>

            <Select
              value={from}
              onValueChange={setFrom}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select from currency" />
              </SelectTrigger>
              <SelectContent>
                {user?.accounts
                  .filter(acc => to.trim() ? acc.currency !== to.trim() : true)
                  .map(acc => (
                    <SelectItem key={acc.id} value={acc.currency}>{currenciesMap[acc.currency]}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>


          <Select
            value={to}
            onValueChange={setTo}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select to currency" />
            </SelectTrigger>
            <SelectContent>
              {user?.accounts
                .filter(acc => from.trim() ? acc.currency !== from.trim() : true)
                .map(acc => (
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

          {exchangeRate ? (
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Exchange Rate</span>
                <span className="font-semibold">
                  1 {from} = {exchangeRate} {to}
                </span>
              </div>
              {convertedAmount !== null && (
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-muted-foreground">You will receive</span>
                  <span className="text-lg font-bold text-primary">
                    {to}{convertedAmount.toFixed(2)} {currenciesMap[to]}
                  </span>
                </div>
              )}
            </div>
          ) : null}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !isFormValid}
          >
            {loading ? 'Processing...' : 'Exchange Currency'}
          </Button>
        </form>
      </CardContent>
    </Card >
  );
}
