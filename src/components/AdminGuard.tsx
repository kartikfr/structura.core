import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminGuardProps {
    children: ReactNode;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [checkingRole, setCheckingRole] = useState(true);

    useEffect(() => {
        const checkAdmin = async () => {
            if (authLoading) return;

            if (!user) {
                navigate('/login');
                return;
            }

            try {
                const { data, error } = await supabase.rpc('has_role', {
                    _user_id: user.id,
                    _role: 'admin',
                });

                if (error) {
                    console.error('Error checking admin role:', error);
                    toast.error('Failed to verify permissions');
                    navigate('/');
                    return;
                }

                if (!data) {
                    toast.error('Access denied: Admin privileges required');
                    navigate('/');
                }

                setIsAdmin(data);
            } catch (err) {
                console.error('Unexpected error in AdminGuard:', err);
                navigate('/');
            } finally {
                setCheckingRole(false);
            }
        };

        checkAdmin();
    }, [user, authLoading, navigate]);

    if (authLoading || checkingRole) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border border-primary/30 flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-primary font-mono text-2xl">φ</span>
                    </div>
                    <p className="font-mono text-sm text-muted-foreground">Verifying access...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return null; // Will have redirected in useEffect
    }

    return <>{children}</>;
};
