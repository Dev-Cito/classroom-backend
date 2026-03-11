import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db"; // your drizzle instance
import * as schema from "../db/schema/auth";

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET!,
    trustedOrigins: [process.env.FRONTEND_URL!],
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: schema,
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    user: {
        additionalFields: {
            role: {
                type: "string", required: true, defaultValue: "student", input: true,
            },
            imageCldPubId: {
                type: "string", required: false, input: true,
            }
        }
    },

    databaseHooks: {
        user: {
            create: {
                before: async (userData) => {
                    return {
                        data: {
                            ...userData,
                            createdAt: new Date(userData.createdAt),
                            updatedAt: new Date(userData.updatedAt),
                        }
                    };
                }
            }
        }
    }
});