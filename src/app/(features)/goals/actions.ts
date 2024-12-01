'use server';

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import * as z from "zod";

const _goalSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(10),
    category: z.enum(["PASSION", "PROFESSION", "MISSION", "VOCATION"]),
    deadline: z.date(),
});

type GoalInput = z.infer<typeof _goalSchema>;

export const createGoal = async (values: GoalInput) => {
    const { userId } = await auth();
    if (!userId) {
        redirect("/sign-in");
        return;
    }

    return await db.goal.create({
        data: {
            userId: userId.toString(),
            title: values.title,
            description: values.description,
            category: values.category,
            deadline: values.deadline,
            status: 'IN_PROGRESS',
        },
    });
};
