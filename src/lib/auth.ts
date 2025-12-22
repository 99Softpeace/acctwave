import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                await dbConnect();

                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please enter an email and password');
                }

                const user = await User.findOne({ email: credentials.email });

                if (!user) {
                    throw new Error('No user found with this email');
                }

                if (user.isSuspended) {
                    throw new Error('Account suspended. Contact support.');
                }

                const isMatch = await bcrypt.compare(credentials.password, user.password);

                if (!isMatch) {
                    throw new Error('Invalid password');
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phoneNumber: user.phoneNumber
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }: any) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.phoneNumber = (user as any).phoneNumber;
            }

            if (trigger === "update" && session?.name) {
                token.name = session.name;
            }
            // Allow updating phone number in session
            if (trigger === "update" && session?.phoneNumber) {
                token.phoneNumber = session.phoneNumber;
            }
            return token;
        },
        async session({ session, token }: any) {
            // [NEW] Check DB on every session access because 'jwt' doesn't always run
            console.log('[Auth Debug] Session Callback Running');
            if (token.id) {
                try {
                    await dbConnect();
                    // console.log(`[Auth Debug] Checking DB for User ID: ${token.id}`); // Reducing log noise
                    const dbUser = await User.findById(token.id).select('isSuspended email');
                    // console.log(`[Auth Debug] DB Result:`, dbUser ? { email: dbUser.email, isSuspended: dbUser.isSuspended } : 'User Not Found');

                    if (dbUser?.isSuspended) {
                        console.log('[Auth Debug] User is SUSPENDED. Destroying Session.');
                        return null; // FORCE LOGOUT
                    }
                } catch (error) {
                    console.error('Session DB check failed:', error);
                }
            }

            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).phoneNumber = token.phoneNumber;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
