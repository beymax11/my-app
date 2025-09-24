import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';

type ResetPasswordBody = {
    password: string;
    confirmPassword: string;
};

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as Partial<ResetPasswordBody>;
        const { password, confirmPassword } = body;
        
        if (!password || !confirmPassword) {
            return NextResponse.json({ error: 'Password and confirmation are required' }, { status: 400 });
        }

        if (password !== confirmPassword) {
            return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        const supabase = await getSupabaseServerClient();
        
        // Update the user's password
        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            console.error('Password reset error:', error);
            return NextResponse.json({ error: error.message || 'Failed to reset password' }, { status: 400 });
        }

        return NextResponse.json({ 
            message: 'Password has been successfully reset' 
        }, { status: 200 });

    } catch (err) {
        console.error('Reset password error:', err);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
