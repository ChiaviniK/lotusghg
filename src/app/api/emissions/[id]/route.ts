
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership
    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: { organizations: true } as any,
    });

    const userAny = user as any;
    if (!userAny?.organizations?.length) {
        return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const { id } = await params;

    // Check if entry belongs to user's organization
    const entry = await prisma.emissionEntry.findUnique({
        where: { id },
    });

    const hasAccess = userAny.organizations.some((org: any) => org.id === entry?.organizationId);

    if (!entry || !hasAccess) {
        // Note: Typo in handAccess -> hasAccess. I will fix it in the content string.
        /* Actually let's just correct it: */
        return NextResponse.json({ error: 'Not found or forbidden' }, { status: 403 });
    }

    await prisma.emissionEntry.delete({
        where: { id },
    });

    return NextResponse.json({ success: true });
}
