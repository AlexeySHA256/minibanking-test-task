'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { useUserStore } from '@/features/user/store';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useUserStore(state => state.login)
  const loading = useUserStore(state => state.loading)

  const isValidForm = Boolean(email.trim() && password.trim().length >= 8)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isValidForm) return toast.error("Invalid form values", { description: "Please enter a valid data and try again" })

    try {
      await login({ email, password })
    } catch (error) {
      toast.error("Login failed", { description: error instanceof Error ? error.message : undefined })
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || !isValidForm}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/auth/register" className="text-primary hover:underline font-medium">
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
