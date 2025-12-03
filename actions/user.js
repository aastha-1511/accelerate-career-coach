"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    try {
        function normalizeInsights(i) {
            return {
                ...i,
                demandLevel: i.demandLevel?.toUpperCase(),
                marketOutlook: i.marketOutlook?.toUpperCase(),
            };
        }


        const result = await db.$transaction(
            async (tx) => {
                // find if the industry exists
                let industryInsight = await tx.industryInsight.findUnique({
                    where: { industry: data.industry },
                });

                // If industry doesn't exist, create it (replace with AI later)
                if (!industryInsight) {
                    const insights = await generateAIInsights(data.industry);
                    const normalizedInsights = normalizeInsights(insights);


                    industryInsight = await tx.industryInsight.create({
                        data: {
                            industry: data.industry,
                            ...normalizedInsights,
                            nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                        },
                    });
                }

                // Update the user within the same transaction
                const updatedUser = await tx.user.update({
                    where: { id: user.id },
                    data: {
                        industry: data.industry,
                        experience: data.experience,
                        bio: data.bio,
                        skills: data.skills,
                    },
                });

                return { updatedUser, industryInsight };
            },
            {
                timeout: 60000, // default: 5000
            }
        );

        return { success: true, ...result };
    } catch (error) {
        // log the full error object (stack included) for debugging
        console.error("Error updating user and industry:", error);
        // Throw clearer message while preserving original message if present
        throw new Error(`Failed to update profile: ${error?.message ?? String(error)}`);
    }
}

export async function getUserOnboardingStatus() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    // single lookup is enough
    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
        select: { industry: true },
    });

    if (!user) throw new Error("User not found");

    try {
        return { isOnboarded: !!user.industry };
    } catch (error) {
        console.error("Error checking onboarding status:", error);
        throw new Error("Failed to check onboarding status");
    }
}
