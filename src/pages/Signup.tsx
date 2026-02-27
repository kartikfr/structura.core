import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { z } from 'zod';
import { Eye, EyeOff, ArrowRight, Sparkles, Check, Mail } from 'lucide-react';
import { StructuraLogo } from '@/components/StructuraLogo';

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirmPassword?: string }>({});
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/lens');
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = signupSchema.safeParse({ email, password, confirmPassword });
    if (!validation.success) {
      const fieldErrors: { email?: string; password?: string; confirmPassword?: string } = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0] === 'email') fieldErrors.email = err.message;
        if (err.path[0] === 'password') fieldErrors.password = err.message;
        if (err.path[0] === 'confirmPassword') fieldErrors.confirmPassword = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    const { error } = await signUp(email, password);

    if (error) {
      if (error.message.includes('already registered')) {
        toast.error('Account exists', {
          description: 'This email is already registered. Please login instead.',
        });
      } else if (error.message.includes('Local network/proxy interference')) {
        toast.error('Connection issue detected', {
          description: error.message,
        });
      } else if (error.message.includes('Auth service temporarily unavailable')) {
        toast.error('Auth service unavailable', {
          description: error.message,
        });
      } else {
        toast.error('Signup failed', {
          description: error.message,
        });
      }
      setIsLoading(false);
      return;
    }

    // Show email confirmation message instead of redirecting
    setEmailSent(true);
    setIsLoading(false);
    toast.success('Verification email sent', {
      description: 'Please check your inbox to confirm your email address.',
    });
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    const { error } = await signInWithGoogle();

    if (error) {
      if (error.message.includes('Local network/proxy interference')) {
        toast.error('Connection issue detected', {
          description: error.message,
        });
      } else if (error.message.includes('Auth service temporarily unavailable')) {
        toast.error('Auth service unavailable', {
          description: error.message,
        });
      } else {
        toast.error('Google sign-in failed', {
          description: error.message,
        });
      }
      setIsGoogleLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-16 h-16 border border-primary/30 flex items-center justify-center animate-pulse">
          <span className="text-primary font-mono text-2xl">φ</span>
        </div>
      </div>
    );
  }

  const benefits = [
    '5 free mathematical audits',
    'Full Structural Intelligence metrics',
    'PDF export capability',
    'Deterministic analysis engine',
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-80 h-80 border border-primary/5 rounded-full animate-spin-slow"></div>
        <div className="absolute bottom-1/3 left-1/4 w-48 h-48 border border-accent/10 rotate-12 animate-pulse-subtle"></div>
        <div className="absolute top-1/2 left-1/3 w-24 h-24 border border-primary/10 animate-float"></div>
      </div>

      {/* Grid overlay */}
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none"></div>

      {/* Navigation */}
      <nav className="relative z-10 border-b border-primary/20 bg-card/95 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <StructuraLogo size="sm" animated={false} />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center">
                <span className="font-mono text-sm font-semibold text-foreground">STRUCTURA</span>
                <span className="font-mono text-sm font-semibold text-primary ml-1">· Core</span>
              </div>
              <p className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest">by SwadeshLABS</p>
            </div>
          </Link>
          <Link to="/login" className="group flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">
            Sign In
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center py-12 px-6">
        <div className="w-full max-w-lg">
          {emailSent ? (
            // Email confirmation sent UI
            <div className="text-center">
              <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <div className="w-20 h-20 border-2 border-primary/50 rounded-full flex items-center justify-center animate-pulse">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h1 className="text-2xl font-mono font-bold text-foreground mb-3">
                Verify Your Email
              </h1>
              <p className="font-mono text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                We've sent a confirmation link to <span className="text-primary">{email}</span>.
                Please check your inbox and click the link to activate your account.
              </p>
              <div className="terminal-panel p-6 max-w-sm mx-auto">
                <div className="space-y-3 text-left">
                  <p className="font-mono text-xs text-muted-foreground">
                    <span className="text-primary">1.</span> Open your email inbox
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    <span className="text-primary">2.</span> Click the confirmation link
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    <span className="text-primary">3.</span> Return here to sign in
                  </p>
                </div>
              </div>
              <p className="mt-6 font-mono text-xs text-muted-foreground">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-primary hover:underline"
                >
                  try again
                </button>
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 mt-4 font-mono text-sm text-primary hover:underline"
              >
                Go to Sign In
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <div className="relative w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                  <StructuraLogo size="lg" animated={true} />
                </div>
                <h1 className="text-3xl font-mono font-bold text-foreground mb-3">
                  Start with <span className="text-primary">STRUCTURA</span>
                </h1>
                <p className="font-mono text-sm text-muted-foreground">
                  5 mathematical audits, no credit card required
                </p>
              </div>

              <div className="grid md:grid-cols-[1fr_200px] gap-6">
                <div className="terminal-panel p-8 relative overflow-hidden">
                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-16 h-16 border-l border-b border-primary/20"></div>
                  <div className="absolute bottom-0 left-0 w-16 h-16 border-r border-t border-primary/20"></div>

                  <div className="space-y-5 relative">
                    {/* Google Sign In */}
                    <Button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isGoogleLoading}
                      variant="outline"
                      className="w-full h-12 font-mono text-sm border-border hover:bg-muted/50 hover:border-primary/50 transition-all"
                    >
                      {isGoogleLoading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin"></span>
                          Connecting...
                        </span>
                      ) : (
                        <span className="flex items-center gap-3">
                          <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                          </svg>
                          Continue with Google
                        </span>
                      )}
                    </Button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border"></span>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-4 text-muted-foreground font-mono">or</span>
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                          <span className="w-2 h-2 bg-primary/50"></span>
                          Email
                        </label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="analyst@domain.com"
                          required
                          className={`terminal-input h-12 font-mono text-sm ${errors.email ? 'border-destructive' : ''}`}
                        />
                        {errors.email && (
                          <p className="font-mono text-xs text-destructive">{errors.email}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                          <span className="w-2 h-2 bg-primary/50"></span>
                          Password
                        </label>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min. 8 characters"
                            required
                            minLength={8}
                            className={`terminal-input h-12 font-mono text-sm pr-12 ${errors.password ? 'border-destructive' : ''}`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="font-mono text-xs text-destructive">{errors.password}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <label className="font-mono text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                          <span className="w-2 h-2 bg-primary/50"></span>
                          Confirm Password
                        </label>
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repeat password"
                          required
                          minLength={8}
                          className={`terminal-input h-12 font-mono text-sm ${errors.confirmPassword ? 'border-destructive' : ''}`}
                        />
                        {errors.confirmPassword && (
                          <p className="font-mono text-xs text-destructive">{errors.confirmPassword}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn-institutional-solid h-12 text-sm font-mono group"
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></span>
                            Creating Account...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            Create Free Account
                            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                          </span>
                        )}
                      </Button>

                      <p className="font-mono text-[10px] text-muted-foreground leading-relaxed text-center">
                        By signing up, you acknowledge this is a mathematical analysis tool, not financial advice.
                      </p>
                    </form>
                  </div>
                </div>

                {/* Benefits sidebar */}
                <div className="hidden md:block space-y-4">
                  <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                    Free tier includes:
                  </p>
                  <div className="space-y-3">
                    {benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-4 h-4 border border-primary/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-primary" />
                        </div>
                        <span className="font-mono text-xs text-muted-foreground leading-tight">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-border">
                    <p className="font-mono text-[10px] text-muted-foreground/70">
                      Upgrade to Premium for unlimited access at $99 lifetime.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-center mt-8 font-mono text-xs text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-6 px-6 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto text-center">
          <p className="font-mono text-[10px] text-muted-foreground">
            © 2026 SwadeshLABS — STRUCTURA · Core
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Signup;
