import { NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabase-server';
import { supabaseAdmin } from '@/lib/supabase-admin';

type ForgotPasswordBody = {
    identifier: string; // email or phone
};

export async function POST(request: Request) {
    try {
        const body = (await request.json()) as Partial<ForgotPasswordBody>;
        const identifier = (body?.identifier || '').toString().trim();
        
        if (!identifier) {
            return NextResponse.json({ error: 'Email or phone is required' }, { status: 400 });
        }

        const isProbablyPhone = /^\+?\d{10,15}$/.test(identifier.replace(/[^\d+]/g, ''));

        let userEmail = '';
        
        if (isProbablyPhone) {
            // Handle phone number lookup
            const digits = identifier.replace(/\D/g, '');
            const candidates: string[] = [];
            
            if (digits) {
                // Derive a stable local 10-digit mobile number if possible
                let local10 = digits;
                if (digits.startsWith('63') && digits.length >= 12) {
                    local10 = digits.slice(-10);
                } else if (digits.startsWith('0') && digits.length >= 11) {
                    local10 = digits.slice(-10);
                } else if (digits.length >= 10) {
                    local10 = digits.slice(-10);
                }

                const local0 = `0${local10}`;
                const cc63 = `63${local10}`;
                const plus63 = `+63${local10}`;

                candidates.push(
                    digits,
                    local10,
                    local0,
                    cc63,
                    plus63,
                );
            }

            // Try to find profile by any candidate value
            let profile: { id: string } | null = null;
            for (const cand of Array.from(new Set(candidates))) {
                const { data, error } = await supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .eq('phone', cand)
                    .maybeSingle();
                if (!error && data?.id) { 
                    profile = data; 
                    break; 
                }
            }

            if (profile?.id) {
                // Fetch the auth user to get their email
                const { data: userResp } = await supabaseAdmin.auth.admin.getUserById(profile.id);
                userEmail = userResp?.user?.email || '';
            } else {
                // Fallback: scan auth users for matching metadata.phone
                try {
                    const uniqueCands = new Set(candidates);
                    const raw = identifier.replace(/\D/g, '');
                    let targetLocal10 = raw;
                    if (raw.startsWith('63') && raw.length >= 12) targetLocal10 = raw.slice(-10);
                    else if (raw.startsWith('0') && raw.length >= 11) targetLocal10 = raw.slice(-10);
                    else if (raw.length >= 10) targetLocal10 = raw.slice(-10);

                    let page = 1;
                    const perPage = 100;
                    let found: string | null = null;
                    
                    while (!found && page <= 10) {
                        const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
                        const users = list?.users || [];
                        for (const u of users) {
                            const m = (u as any)?.user_metadata || {};
                            const metaPhone = (m.phone || '').toString();
                            const metaDigits = metaPhone.replace(/\D/g, '');
                            let metaLocal10 = metaDigits;
                            if (metaDigits.startsWith('63') && metaDigits.length >= 12) metaLocal10 = metaDigits.slice(-10);
                            else if (metaDigits.startsWith('0') && metaDigits.length >= 11) metaLocal10 = metaDigits.slice(-10);
                            else if (metaDigits.length >= 10) metaLocal10 = metaDigits.slice(-10);

                            if (
                                (metaPhone && uniqueCands.has(metaPhone)) ||
                                (metaDigits && uniqueCands.has(metaDigits)) ||
                                (metaLocal10 && metaLocal10 === targetLocal10)
                            ) {
                                found = u.email || null;
                                break;
                            }
                        }
                        if (found) break;
                        if (!list || users.length < perPage) break;
                        page += 1;
                    }
                    if (found) userEmail = found;
                } catch {}
            }

            if (!userEmail) {
                // Don't reveal if user exists or not for security
                return NextResponse.json({ 
                    message: 'If an account with that email or phone exists, we\'ve sent a password reset link.' 
                }, { status: 200 });
            }
        } else {
            userEmail = identifier; // treat as email
        }

        const supabase = await getSupabaseServerClient();
        
        // Send password reset email
        const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
        });

        if (error) {
            console.error('Password reset error:', error);
            // Don't reveal the error for security reasons
        }

        // Always return success message for security (don't reveal if user exists)
        return NextResponse.json({ 
            message: 'If an account with that email or phone exists, we\'ve sent a password reset link.' 
        }, { status: 200 });

    } catch (err) {
        console.error('Forgot password error:', err);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
