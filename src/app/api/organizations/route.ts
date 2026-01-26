
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import * as z from 'zod';

const orgSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    address: z.string().optional(),
    responsibleName: z.string().optional(),
    responsiblePhone: z.string().optional(),
    inventoryYear: z.string().optional(),
    employees: z.number().optional(),
    revenue: z.number().optional(),
    productionVolume: z.number().optional(),
    productionUnit: z.string().optional(),
});

export async function GET() {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { organizations: true },
    });

    return NextResponse.json(user?.organizations || []);
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const json = await request.json();
        const body = orgSchema.parse(json);

        const user = await prisma.user.findUnique({ where: { email: session.user.email } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const newOrg = await prisma.organization.create({
            data: {
                ...body,
                userId: user.id,
            }
        });

        return NextResponse.json(newOrg);
    } catch (e) {
        return NextResponse.json({ error: 'Error creating org' }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const session = await auth();
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const json = await request.json();
        // Allow partial updates, so we don't strictly parse with the create schema or we make a partial schema
        // For simplicity, just update what's passed if it's valid

        // We need the ID to identify which org to update. 
        // Logic: specific /api/organizations/[id] route is better, but here we can pass ID in body?
        // Or assume we are updating the "Context" org, but the API is stateless.
        // Let's expect ID in the body for now, or use a separate route. 
        // The Context sends the whole object which includes ID.

        if (!json.id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const updated = await prisma.organization.update({
            where: { id: json.id },
            data: {
                name: json.name,
                address: json.address,
                inventoryYear: json.inventoryYear,
                responsibleName: json.responsibleName,
                responsiblePhone: json.responsiblePhone,
                fillingDate: json.fillingDate,
                employees: json.employees,
                revenue: json.revenue,
                productionVolume: json.productionVolume,
                productionUnit: json.productionUnit,
            }
        });

        return NextResponse.json(updated);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Error updating org' }, { status: 500 });
    }
}
