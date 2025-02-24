import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { type GetServerSidePropsContext } from "next";
import {
  getServerSession,
  type NextAuthOptions,
  type DefaultSession,
  DefaultUser,
} from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "@/env.mjs";
import { prisma } from "@/server/db";
import bcrypt from "bcrypt";
import type { Devices, UserRoles, UserScreen } from "@prisma/client";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken: string;
    user: {
      id: string;
      phone: string;
      email: string;
      userRoles: UserRoles[];
      userScreens: UserScreen[];
      device: Devices | null;
      emailVerified: Date | null;
      hasPassword: boolean;
      // ...other properties
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    phone: string;
    email: string;
    userRoles: UserRoles[];
    userScreens: UserScreen[];
    device: Devices | null;
    emailVerified: Date | null;
    hasPassword: boolean;
    // ...other properties
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "login",
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      id: "credentials",
      credentials: {
        email: { label: "email", type: "text" },
        password: { label: "password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) return null;

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user || !user.hashedPassword) throw new Error("Incorrect email or password!");

        const checkPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!checkPassword) throw new Error("Incorrect email or password!");

        return { ...user, emailVerified: user.emailVerified, hasPassword: true };
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  callbacks: {
    async signIn({ user, account }) {

      const { email, name, image, emailVerified, phone } = user;
      const isEmailVerified = !!emailVerified || account?.provider === "google";

      // Check if user exists in the database
      if (!email) return `?error=${encodeURIComponent("Email was not provided!")}`
      let userDoc = await prisma.user.findUnique({
        where: { email },
      });

      // Handle user creation if not present
      if (!userDoc) {
        if (!name) return `?error=${encodeURIComponent("Name was not provided!")}`
        userDoc = await prisma.user.create({
          data: {
            email,
            name,
            phone: phone || "",
            image,
            emailVerified: isEmailVerified ? new Date() : null,
          },
        });
        if (!!account && !!account.provider && !!account.providerAccountId && !!account.type) {
          const { provider, providerAccountId, type, access_token, expires_at, id_token, scope, token_type } = account
          await prisma.account.create({
            data: {
              provider,
              providerAccountId,
              access_token,
              expires_at,
              scope,
              type,
              token_type,
              id_token,
              user: { connect: { email } }
            },
          });
        }
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update") {
        return {
          ...token,
          name: session.name,
          email: session.email,
          phone: session.phone,
          picture: session.image,
          device: session.device,
          emailVerified: session.emailVerified,
          userRoles: session.userRoles,
          userScreens: session.userScreens,
        }
      }
      if (user) {
        return {
          ...token,
          userRoles: user.userRoles,
          userScreens: user.userScreens,
          name: user.name,
          email: user.email,
          phone: user.phone,
          picture: user.image,
          device: user.device,
          hasPassword: user.hasPassword,
          emailVerified: !!user.emailVerified,
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          name: token.name,
          email: token.email,
          phone: token.phone,
          hasPassword: token.hasPassword,
          picture: token.picture,
          userRoles: token.userRoles,
          userScreens: token.userScreens,
          device: token.device,
          emailVerified: token.emailVerified,
          id: token.sub,
        }
      }
    }
  },
  debug: env.NODE_ENV === "development",
  session: { strategy: "jwt" },
  secret: env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/authentication',
    signOut: '/authentication',
  }
};

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext["req"];
  res: GetServerSidePropsContext["res"];
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions);
};
