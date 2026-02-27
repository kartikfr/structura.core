import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Copy, Check, Wallet, AlertCircle, ArrowLeft, Send } from 'lucide-react';
import { StructuraLogo } from '@/components/StructuraLogo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WalletQRCode } from '@/components/WalletQRCode';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface WalletInfo {
  currency: string;
  network: string;
  address: string;
  amount: number;
}

export const CryptoPayment = () => {
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<number>(0);
  const [transactionHash, setTransactionHash] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchWallets = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-wallet-addresses');

        if (error) throw error;

        if (data?.wallets) {
          setWallets(data.wallets);
        }
      } catch (error) {
        console.error('Failed to fetch wallet addresses:', error);
        toast.error('Failed to load payment addresses');
      } finally {
        setLoading(false);
      }
    };

    fetchWallets();
  }, [authLoading, user, navigate]);

  const copyToClipboard = async (address: string, index: number) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedIndex(index);
      toast.success('Address copied to clipboard');
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast.error('Failed to copy address');
    }
  };

  const handlePaymentSubmit = async () => {
    if (!user) {
      toast.error('Please log in to submit payment');
      navigate('/login');
      return;
    }

    if (!transactionHash.trim()) {
      toast.error('Please enter your transaction hash');
      return;
    }

    setSubmitting(true);
    const selectedWalletInfo = wallets[selectedWallet];

    try {
      const { data, error } = await supabase.functions.invoke('submit-payment', {
        body: {
          currency: selectedWalletInfo.currency,
          network: selectedWalletInfo.network,
          walletAddress: selectedWalletInfo.address,
          transactionHash: transactionHash.trim()
        }
      });

      if (error) throw error;

      toast.success('Payment submitted! We\'ll verify and activate your account within 24 hours.');
      setTransactionHash('');
    } catch (error) {
      console.error('Payment submission error:', error);
      toast.error('Failed to submit payment. Please try again or contact support.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse font-mono text-muted-foreground">Loading payment options...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* Grid overlay */}
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 border-b border-border bg-card/95 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <StructuraLogo size="sm" animated={false} />
            </div>
            <div>
              <div className="flex items-center">
                <span className="font-mono text-sm font-semibold text-foreground">STRUCTURA</span>
                <span className="font-mono text-sm font-semibold text-primary ml-1">· Core</span>
              </div>
              <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">by SwadeshLABS</p>
            </div>
          </Link>
          <Link
            to="/pricing"
            className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Back
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="relative z-10 py-16 px-6">
        <div className="container mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-10 text-center">
            <div className="w-16 h-16 border border-border flex items-center justify-center mx-auto mb-6 bg-muted/30">
              <Wallet className="w-7 h-7 text-primary" />
            </div>
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Crypto Payment
            </span>
            <h1 className="text-2xl md:text-3xl font-mono font-bold text-foreground mt-2 mb-3">
              Pay with Stablecoins
            </h1>
            <p className="font-mono text-sm text-muted-foreground max-w-md mx-auto">
              Send exactly <span className="text-foreground font-semibold">$99</span> in USDC or USDT to the address below for permanent access.
            </p>
          </div>

          {/* Wallet Selection */}
          {wallets.length > 1 && (
            <div className="flex gap-3 mb-6 justify-center">
              {wallets.map((wallet, index) => (
                <button
                  key={wallet.currency}
                  onClick={() => setSelectedWallet(index)}
                  className={`px-5 py-2.5 font-mono text-xs uppercase tracking-wider border transition-all ${selectedWallet === index
                      ? 'border-primary bg-primary/10 text-foreground'
                      : 'border-border text-muted-foreground hover:border-muted-foreground'
                    }`}
                >
                  {wallet.currency}
                </button>
              ))}
            </div>
          )}

          {/* Selected Wallet Card */}
          {wallets.length > 0 && (
            <div className="structura-panel">
              <div className="p-6 md:p-8 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-mono text-lg font-semibold text-foreground">
                      {wallets[selectedWallet].currency}
                    </h3>
                    <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                      {wallets[selectedWallet].network}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-2xl font-bold text-foreground">
                      ${wallets[selectedWallet].amount}
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
                      Exact Amount
                    </p>
                  </div>
                </div>

                {/* QR Code and Wallet Address */}
                <div className="flex flex-col md:flex-row gap-6 mt-4">
                  <div className="flex-shrink-0">
                    <WalletQRCode
                      address={wallets[selectedWallet].address}
                      currency={wallets[selectedWallet].currency}
                      size={120}
                    />
                  </div>
                  <div className="flex-1 bg-muted/30 border border-border p-4">
                    <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
                      Wallet Address
                    </p>
                    <div className="flex items-center gap-3">
                      <code className="font-mono text-xs text-foreground break-all flex-1 select-all">
                        {wallets[selectedWallet].address}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(wallets[selectedWallet].address, selectedWallet)}
                        className="flex-shrink-0 h-8 w-8 p-0"
                      >
                        {copiedIndex === selectedWallet ? (
                          <Check className="w-4 h-4 text-primary" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="p-6 md:p-8 border-b border-border">
                <h4 className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-4">
                  Payment Instructions
                </h4>
                <ol className="space-y-3">
                  {[
                    `Send exactly $99 in ${wallets[selectedWallet].currency}`,
                    'Use a compatible network (check supported networks above)',
                    'Copy the wallet address using the button above',
                    'Complete the transfer from your wallet',
                    'Click "I\'ve Sent Payment" and provide your transaction hash'
                  ].map((step, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="w-5 h-5 border border-border flex items-center justify-center flex-shrink-0 font-mono text-[10px] text-muted-foreground">
                        {index + 1}
                      </span>
                      <span className="font-mono text-xs text-foreground">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Transaction Hash Input */}
              <div className="p-6 md:p-8">
                <div className="mb-4">
                  <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block mb-2">
                    Transaction Hash
                  </label>
                  <Input
                    type="text"
                    placeholder="Paste your transaction hash here..."
                    value={transactionHash}
                    onChange={(e) => setTransactionHash(e.target.value)}
                    className="font-mono text-xs"
                  />
                  <p className="font-mono text-[9px] text-muted-foreground mt-2">
                    Find this in your wallet's transaction history after sending
                  </p>
                </div>
                <Button
                  onClick={handlePaymentSubmit}
                  disabled={submitting || !transactionHash.trim()}
                  className="w-full btn-structura-solid h-12 font-mono text-xs"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {submitting ? 'Submitting...' : 'Submit Payment for Verification'}
                </Button>
                <p className="font-mono text-[9px] text-muted-foreground text-center mt-4">
                  {user ? 'Access activated within 24 hours after verification' : 'Please log in to submit your payment'}
                </p>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="mt-8 p-4 border border-border bg-muted/20 flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
                <span className="text-foreground font-semibold">Important:</span> Only send stablecoins on supported networks.
                Sending other tokens or using incompatible networks may result in permanent loss of funds.
                SwadeshLABS is not responsible for incorrectly sent payments.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 px-6 mt-auto">
        <div className="container mx-auto flex items-center justify-between">
          <p className="font-mono text-[9px] text-muted-foreground">
            © 2026 SwadeshLABS — STRUCTURA · Core
          </p>
          <Link to="/" className="font-mono text-[9px] text-muted-foreground hover:text-foreground transition-colors">
            Back to Home
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default CryptoPayment;
