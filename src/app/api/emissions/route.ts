
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import * as z from 'zod';

const emissionSchema = z.object({
    scope: z.enum(['scope1', 'scope2', 'scope3']),
    category: z.string(),
    description: z.string(),
    emissions_tCO2e: z.number(),
    biogenic_tCO2e: z.number(),
    data: z.any(),
    date: z.string(),
});

export async function GET(request: Request) {
    const session = await auth();

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user organization
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { organization: true },
    });

    if (!user?.organization) {
        // If no organization, return empty list
        return NextResponse.json([]);
    }

    // Optional: Filter by month/year via query params
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    const whereClause: any = {
        organizationId: user.organization.id,
    };

    if (month) whereClause.month = parseInt(month);
    if (year) whereClause.year = parseInt(year);

    const entries = await prisma.emissionEntry.findMany({
        where: whereClause,
        orderBy: { date: 'desc' },
    });

    // Parse data JSON string back to object
    const parsedEntries = entries.map(entry => ({
        ...entry,
        data: JSON.parse(entry.data),
        date: entry.date.toISOString(),
    }));

    return NextResponse.json(parsedEntries);
}

export async function POST(request: Request) {
    const session = await auth();

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const json = await request.json();
        const body = emissionSchema.parse(json);

        // Get or Create Organization for User
        let user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { organization: true },
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        if (!user.organization) {
            // Create default organization if missing
            const newOrg = await prisma.organization.create({
                data: {
                    name: 'Minha Organização',
                    userId: user.id,
                },
            });
            user = await prisma.user.findUnique({
                where: { email: session.user.email },
                include: { organization: true }
            });
        }

        if (!user?.organization) throw new Error("Failed to create organization");

        const dateObj = new Date(body.date);

        const entry = await prisma.emissionEntry.create({
            data: {
                organizationId: user.organization.id,
                scope: body.scope,
                category: body.category,
                description: body.description,
                emissions_tCO2e: body.emissions_tCO2e,
                biogenic_tCO2e: body.biogenic_tCO2e,
                data: JSON.stringify(body.data),
                date: dateObj,
                month: dateObj.getMonth() + 1, // 1-12
                year: dateObj.getFullYear(),
            },
        });

        return NextResponse.json({
            ...entry,
            data: JSON.parse(entry.data), // Return as object
            date: entry.date.toISOString()
        });

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: (error as any).errors }, { status: 400 });
        }
        console.error("POST emission error:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
