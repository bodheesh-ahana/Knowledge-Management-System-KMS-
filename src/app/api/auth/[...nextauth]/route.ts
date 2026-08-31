import NextAuth, { type NextAuthOptions, type Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { JWT } from 'next-auth/jwt';
import { encode as jwtEncode, type JWTEncodeParams } from 'next-auth/jwt';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import { User } from '@/models';

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'email@example.com' },
        password: { label: 'Password', type: 'password' },
        remember: { label: 'Remember me', type: 'text' },
      },
      async authorize(credentials) {
        console.log('🔐 [AUTH] authorize() called');
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ [AUTH] Missing credentials');
          throw new Error('Invalid email or password');
        }

        try {
          await connectDB();
          console.log('✅ [AUTH] Database connected');

          const user = await User.findOne({ email: credentials.email }).select('+password');

          if (!user) {
            console.log(`❌ [AUTH] User not found: ${credentials.email}`);
            throw new Error('Invalid email or password');
          }

          console.log(`✅ [AUTH] User found: ${user.email}`);

          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

          if (!isPasswordCorrect) {
            console.log('❌ [AUTH] Invalid password');
            throw new Error('Invalid email or password');
          }

          console.log('✅ [AUTH] Password verified');

          const remember = credentials?.remember === 'true';

          const returnUser = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            remember,
          };

          console.log('✅ [AUTH] Returning user');
          return returnUser as any;
        } catch (error) {
          console.error('❌ [AUTH] Error:', error);
          throw error;
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: any }) {
      console.log('🔐 [JWT] Called');
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.remember = user.remember;
        const now = Math.floor(Date.now() / 1000);
        const maxAgeSeconds = user.remember
          ? 30 * 24 * 60 * 60
          : 8 * 60 * 60;
        token.exp = now + maxAgeSeconds;
        console.log('✅ [JWT] Token updated with user');
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      console.log('🔐 [SESSION] Called');
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        if (typeof token.exp === 'number') {
          session.expires = new Date(token.exp * 1000).toISOString();
        }
        console.log('✅ [SESSION] Session updated');
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60,
    encode: async ({ token, secret, maxAge }: JWTEncodeParams) => {
      const now = Date.now() / 1000;
      const age = token && typeof token.exp === 'number'
        ? Math.max(1, Math.floor(token.exp - now))
        : (maxAge ?? 30 * 24 * 60 * 60);
      return jwtEncode({ token, secret, maxAge: age });
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

