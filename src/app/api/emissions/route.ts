
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

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organizationId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!organizationId) {
        return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
    }

    // Get user and verify access to organization
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { organizations: true } as any,
    });

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Cast user to any to avoid TS errors if Prisma Client is outdated
    const userAny = user as any;
    const hasAccess = userAny.organizations?.some((org: any) => org.id === organizationId);

    if (!hasAccess && userAny.role !== 'ADMIN') { // simple allow-all for admin, or strict check? defaulting to strict for now
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const whereClause: any = {
        organizationId: organizationId,
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
        // Allow organizationId in body for validation
        const bodyWithOrg = { ...json };
        const body = emissionSchema.parse(bodyWithOrg);

        // Check organizationId provided in body (or we could require it)
        // ideally the body.data or the root object should have organizationId, but schema above didn't have it.
        // We will read it from the raw json or expect the client to pass it.
        // The previous context sent { ...entry, organizationId: currentOrg.id }
        const organizationId = json.organizationId;

        if (!organizationId) {
            return NextResponse.json({ error: 'Organization ID required' }, { status: 400 });
        }



        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { organizations: true } as any,
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Verify access or auto-create if it's the first time/default scenario? 
        // For now, strict check.
        const userAny = user as any;
        const hasAccess = userAny.organizations?.some((org: any) => org.id === organizationId);
        if (!hasAccess) {
            // Edge case: If user has NO organizations, maybe we should create one?
            // But usually organization creation happens elsewhere.
            return NextResponse.json({ error: 'Forbidden: User not in this organization' }, { status: 403 });
        }

        const dateObj = new Date(body.date);

        const entry = await prisma.emissionEntry.create({
            data: {
                organizationId: organizationId,
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
