import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const { PrismaClient } = require(process.cwd() + '/node_modules/.prisma/client/default') as {
  PrismaClient: new (...args: any[]) => any;
};

async function main() {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });

  const prisma = new PrismaClient({ adapter });

  try {
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
      console.log('Admin user already exists. Seed skipped.');
      return;
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);

    await prisma.$transaction(async (transactionClient: any) => {
      const user = await transactionClient.user.create({
        data: {
          name: 'Business Owner',
          email: 'admin@business.com',
          password: hashedPassword,
          role: 'ADMIN',
        },
      });

      await transactionClient.employee.create({
        data: {
          position: 'CEO',
          salary: 0,
          userId: user.id,
        },
      });
    });

    console.log('Initial admin seeded successfully: admin@business.com');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});