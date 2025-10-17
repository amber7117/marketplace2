'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet as WalletIcon, ArrowUpCircle, ArrowDownCircle, Clock } from 'lucide-react';
import { walletAPI } from '@/lib/api';
import { formatCurrency } from '@/lib/currencies';
import { formatDate } from '@/lib/utils';
import { useCartStore } from '@/store';
import type { Wallet, Transaction } from '@/types';

export default function WalletPage() {
  const t = useTranslations('wallet');
  const tCommon = useTranslations('common');
  const { currency } = useCartStore();

  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, []);

  const fetchWallet = async () => {
    try {
      const response = await walletAPI.getWallet();
      setWallet(response.data.data ?? null);
    } catch (error) {
      console.error('Failed to fetch wallet:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await walletAPI.getTransactions({
        page: 1,
      });
      setTransactions(response.data.data ?? []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      alert(t('invalidAmount'));
      return;
    }

    setProcessing(true);
    try {
      await walletAPI.deposit(depositAmount, currency);
      setAmount('');
      setShowDeposit(false);
      fetchWallet();
      fetchTransactions();
      alert(t('depositSuccess'));
    } catch (error) {
      console.error('Deposit failed:', error);
      alert(t('depositFailed'));
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      alert(t('invalidAmount'));
      return;
    }

    if (wallet && withdrawAmount > wallet.balance) {
      alert(t('insufficientBalance'));
      return;
    }

    setProcessing(true);
    try {
      await walletAPI.withdraw(withdrawAmount, currency);
      setAmount('');
      setShowWithdraw(false);
      fetchWallet();
      fetchTransactions();
      alert(t('withdrawSuccess'));
    } catch (error) {
      console.error('Withdraw failed:', error);
      alert(t('withdrawFailed'));
    } finally {
      setProcessing(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    return type === 'deposit' ? (
      <ArrowDownCircle className="h-5 w-5 text-green-600" />
    ) : (
      <ArrowUpCircle className="h-5 w-5 text-red-600" />
    );
  };

  const getTransactionColor = (type: string) => {
    return type === 'deposit' ? 'text-green-600' : 'text-red-600';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">{t('title')}</h1>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Wallet Balance */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WalletIcon className="h-5 w-5" />
                {t('balance')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">
                  {wallet ? formatCurrency(wallet.balance, currency) : '---'}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('availableBalance')}
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => {
                    setShowDeposit(!showDeposit);
                    setShowWithdraw(false);
                    setAmount('');
                  }}
                >
                  <ArrowDownCircle className="mr-2 h-4 w-4" />
                  {t('deposit')}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setShowWithdraw(!showWithdraw);
                    setShowDeposit(false);
                    setAmount('');
                  }}
                >
                  <ArrowUpCircle className="mr-2 h-4 w-4" />
                  {t('withdraw')}
                </Button>
              </div>

              {/* Deposit Form */}
              {showDeposit && (
                <div className="space-y-4 border-t pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('amount')}</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleDeposit}
                    disabled={processing}
                  >
                    {processing ? tCommon('processing') : t('confirmDeposit')}
                  </Button>
                </div>
              )}

              {/* Withdraw Form */}
              {showWithdraw && (
                <div className="space-y-4 border-t pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t('amount')}</label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0"
                      step="0.01"
                      max={wallet?.balance || 0}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleWithdraw}
                    disabled={processing}
                  >
                    {processing ? tCommon('processing') : t('confirmWithdraw')}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t('transactionHistory')}</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                if (loading) {
                  return (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={`skeleton-${Date.now()}-${i}`} className="h-16 animate-pulse rounded bg-muted" />
                      ))}
                    </div>
                  );
                }

                if (transactions.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Clock className="h-16 w-16 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">{t('noTransactions')}</p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div
                        key={transaction._id}
                        className="flex items-center justify-between border-b pb-3 last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          {getTransactionIcon(transaction.type)}
                          <div>
                            <p className="font-medium">
                              {t(`type.${transaction.type}` as unknown)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(transaction.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-lg font-bold ${getTransactionColor(
                              transaction.type
                            )}`}
                          >
                            {transaction.type === 'deposit' ? '+' : '-'}
                            {formatCurrency(transaction.amount, currency)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
