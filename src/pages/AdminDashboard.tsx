import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Clock, RefreshCw, ExternalLink, ArrowLeft } from 'lucide-react';
import { StructuraLogo } from '@/components/StructuraLogo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Database } from '@/integrations/supabase/types';

type PaymentRequest = Database['public']['Tables']['payment_requests']['Row'];
type PaymentStatus = Database['public']['Enums']['payment_status'];

export const AdminDashboard = () => {
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [filter, setFilter] = useState<PaymentStatus | 'all'>('pending');

  const fetchPayments = useCallback(async () => {
    let query = supabase
      .from('payment_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } else {
      setPayments(data || []);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const verifyPayment = async (paymentId: string, approve: boolean) => {
    setVerifying(paymentId);

    try {
      const { error } = await supabase.functions.invoke('verify-payment', {
        body: { paymentId, approve }
      });

      if (error) throw error;

      toast.success(approve ? 'Payment verified and user upgraded!' : 'Payment rejected');
      fetchPayments();
    } catch (error) {
      console.error('Verification error:', error);
      toast.error('Failed to update payment status');
    } finally {
      setVerifying(null);
    }
  };

  const autoVerify = async (paymentId: string) => {
    setVerifying(paymentId);

    try {
      const { data, error } = await supabase.functions.invoke('auto-verify-payment', {
        body: { paymentId }
      });

      if (error) throw error;

      if (data?.verified) {
        toast.success('Payment verified on blockchain!');
      } else {
        toast.info(data?.message || 'Transaction not found or pending');
      }
      fetchPayments();
    } catch (error) {
      console.error('Auto-verify error:', error);
      toast.error('Failed to verify on blockchain');
    } finally {
      setVerifying(null);
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const variants: Record<PaymentStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      pending: { variant: 'outline', label: 'Pending' },
      verified: { variant: 'default', label: 'Verified' },
      rejected: { variant: 'destructive', label: 'Rejected' },
      expired: { variant: 'secondary', label: 'Expired' }
    };
    const { variant, label } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getExplorerUrl = (payment: PaymentRequest) => {
    if (!payment.transaction_hash) return null;

    if (payment.network.toLowerCase().includes('tron') || payment.network.toLowerCase().includes('trc')) {
      return `https://tronscan.org/#/transaction/${payment.transaction_hash}`;
    }
    return `https://etherscan.io/tx/${payment.transaction_hash}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse font-mono text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/95 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <StructuraLogo size="sm" animated={false} />
            <div>
              <div className="flex items-center">
                <span className="font-mono text-sm font-semibold text-foreground">STRUCTURA</span>
                <span className="font-mono text-sm font-semibold text-primary ml-1">· Admin</span>
              </div>
              <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">Payment Dashboard</p>
            </div>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Back
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-mono text-2xl font-bold text-foreground mb-1">Payment Requests</h1>
            <p className="font-mono text-sm text-muted-foreground">
              {payments.length} {filter === 'all' ? 'total' : filter} payment(s)
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as PaymentStatus | 'all')}
              className="font-mono text-xs bg-background border border-border px-3 py-2 rounded"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
              <option value="expired">Expired</option>
            </select>
            <Button variant="outline" size="sm" onClick={fetchPayments}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-16 border border-border bg-muted/20">
            <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-mono text-sm text-muted-foreground">No {filter === 'all' ? '' : filter} payments found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="border border-border bg-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      {getStatusBadge(payment.status)}
                      <span className="font-mono text-xs text-muted-foreground">
                        {new Date(payment.created_at).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Email</p>
                        <p className="font-mono text-sm text-foreground">{payment.email}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Amount</p>
                        <p className="font-mono text-sm text-foreground">${payment.amount} {payment.currency}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Network</p>
                        <p className="font-mono text-sm text-foreground">{payment.network}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">Transaction Hash</p>
                        {payment.transaction_hash ? (
                          <div className="flex items-center gap-2">
                            <code className="font-mono text-xs text-foreground truncate max-w-[200px]">
                              {payment.transaction_hash}
                            </code>
                            {getExplorerUrl(payment) && (
                              <a
                                href={getExplorerUrl(payment)!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <p className="font-mono text-xs text-muted-foreground italic">Not provided</p>
                        )}
                      </div>
                    </div>

                    {payment.notes && (
                      <div className="mt-4 p-3 bg-muted/30 border border-border">
                        <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Notes</p>
                        <p className="font-mono text-xs text-foreground">{payment.notes}</p>
                      </div>
                    )}
                  </div>

                  {payment.status === 'pending' && (
                    <div className="flex flex-col gap-2">
                      {payment.transaction_hash && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => autoVerify(payment.id)}
                          disabled={verifying === payment.id}
                          className="font-mono text-[10px]"
                        >
                          <RefreshCw className={`w-3 h-3 mr-1 ${verifying === payment.id ? 'animate-spin' : ''}`} />
                          Auto-Verify
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => verifyPayment(payment.id, true)}
                        disabled={verifying === payment.id}
                        className="font-mono text-[10px]"
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => verifyPayment(payment.id, false)}
                        disabled={verifying === payment.id}
                        className="font-mono text-[10px]"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
