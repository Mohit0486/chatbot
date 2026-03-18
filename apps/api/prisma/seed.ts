import { PrismaClient, WorkspaceRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'owner@demo.ai';
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return;
  }

  const user = await prisma.user.create({
    data: {
      name: 'Demo Owner',
      email,
      passwordHash: await bcrypt.hash('DemoPass123!', 10),
    },
  });

  const workspace = await prisma.workspace.create({
    data: {
      name: 'Demo Workspace',
      slug: 'demo-workspace',
    },
  });

  await prisma.workspaceMember.create({
    data: {
      userId: user.id,
      workspaceId: workspace.id,
      role: WorkspaceRole.OWNER,
    },
  });

  await prisma.subscription.create({
    data: {
      workspaceId: workspace.id,
      planName: 'Starter',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
