
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL || "file:./dev.db"
});

async function main() {
    const password = await hash('L0tus@123', 12);

    // Upsert Lotus Admin
    const admin = await prisma.user.upsert({
        where: { email: 'lotusadm@ghg.com' },
        update: {
            password: password,
            role: 'ADMIN',
        },
        create: {
            email: 'lotusadm@ghg.com',
            name: 'Lotus Admin',
            password: password,
            role: 'ADMIN',
        },
    });

    console.log({ admin });

    // Ensure Admin has at least one organization for testing
    const org = await prisma.organization.create({
        data: {
            name: 'Lotus Environment',
            userId: admin.id
        }
    });

    console.log({ org });
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
