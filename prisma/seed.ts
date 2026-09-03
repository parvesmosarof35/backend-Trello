import { Priority, PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding with rich features...');

  // Clean existing test data
  await prisma.comment.deleteMany({});
  await prisma.subtask.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.column.deleteMany({});
  await prisma.boardMember.deleteMany({});
  await prisma.board.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Users
  const parves = await prisma.user.create({
    data: {
      name: 'Parves Mosarof',
      email: 'parves@trello.com',
      password: passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const rahim = await prisma.user.create({
    data: {
      name: 'Rahim Ahmed',
      email: 'rahim@trello.com',
      password: passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  console.log('✅ Created users: Parves (parves@trello.com) & Rahim (rahim@trello.com)');

  // 2. Create Board 1: E-Commerce Platform
  const ecommerceBoard = await prisma.board.create({
    data: {
      name: '🚀 E-Commerce Platform V2',
      description: 'Main product roadmap, checkout flow, and UI redesign board',
      ownerId: parves.id,
      members: {
        create: [
          {
            userId: rahim.id,
            role: Role.MEMBER,
          },
        ],
      },
      columns: {
        create: [
          { name: 'Backlog', position: 0 },
          { name: 'To Do', position: 1 },
          { name: 'In Progress', position: 2 },
          { name: 'Review & QA', position: 3 },
          { name: 'Completed', position: 4 },
        ],
      },
    },
    include: {
      columns: true,
    },
  });

  const colMap = new Map(ecommerceBoard.columns.map((c) => [c.name, c.id]));

  // Task 1: Product Card
  const task1 = await prisma.task.create({
    data: {
      title: 'Design high-converting Product Card UI',
      description: 'Implement modern glassmorphic product cards with discount badges and quick add-to-cart animations.',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // in 2 days
      labels: ['Design', 'UI/UX'],
      position: 0,
      columnId: colMap.get('To Do')!,
      creatorId: parves.id,
      subtasks: {
        create: [
          { title: 'Create Figma wireframe mockup', isCompleted: true },
          { title: 'Write Tailwind CSS responsive tokens', isCompleted: true },
          { title: 'Add quick buy hover micro-interaction', isCompleted: false },
        ],
      },
      comments: {
        create: [
          {
            content: 'Looks great! Make sure discount badges pop on dark mode.',
            authorId: rahim.id,
          },
        ],
      },
    },
  });

  // Task 2: Stripe Checkout
  const task2 = await prisma.task.create({
    data: {
      title: 'Implement Multi-step Checkout with Stripe',
      description: 'Integrate Stripe Elements, shipping address validation, and order invoice generation.',
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67e5572263?w=600&auto=format&fit=crop&q=80',
      priority: Priority.URGENT,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // tomorrow
      labels: ['Backend', 'Feature'],
      position: 1,
      columnId: colMap.get('To Do')!,
      creatorId: parves.id,
      subtasks: {
        create: [
          { title: 'Create Stripe webhook handler in NestJS', isCompleted: true },
          { title: 'Implement Stripe PaymentSheet on frontend', isCompleted: false },
          { title: 'Send PDF invoice email via SendGrid', isCompleted: false },
        ],
      },
    },
  });

  // Task 3: DnD Engine
  const task3 = await prisma.task.create({
    data: {
      title: 'Build Drag & Drop Kanban Reordering Engine',
      description: 'Leverage @dnd-kit and transactional Prisma atomic moves for reliable multi-column ordering.',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      labels: ['Frontend', 'Feature'],
      position: 0,
      columnId: colMap.get('In Progress')!,
      creatorId: rahim.id,
      subtasks: {
        create: [
          { title: 'Setup PointerSensor & TouchSensor', isCompleted: true },
          { title: 'Isolate local state to prevent Error 185', isCompleted: true },
          { title: 'Add quick-move dropdown for mobile', isCompleted: true },
        ],
      },
      comments: {
        create: [
          {
            content: 'Super smooth! Mobile touch drag works like a charm now.',
            authorId: parves.id,
          },
        ],
      },
    },
  });

  // Task 4: Cloudinary Attachment
  await prisma.task.create({
    data: {
      title: 'Setup Cloudinary CDN Image Attachment Pipeline',
      description: 'Direct unsigned image uploads for task covers and user avatars with auto-compression.',
      priority: Priority.MEDIUM,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      labels: ['DevOps', 'Backend'],
      position: 1,
      columnId: colMap.get('In Progress')!,
      creatorId: parves.id,
    },
  });

  // Task 5: Database Indexing
  await prisma.task.create({
    data: {
      title: 'PostgreSQL Database Indexing & Query Tuning',
      description: 'Add composite indexes on boardId and columnId to guarantee sub-millisecond lookups.',
      priority: Priority.LOW,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Overdue test!
      labels: ['Backend', 'DevOps'],
      position: 0,
      columnId: colMap.get('Review & QA')!,
      creatorId: rahim.id,
    },
  });

  // Task 6: Scaffolding
  await prisma.task.create({
    data: {
      title: 'Project Architecture & Scaffolding',
      description: 'Next.js App Router, NestJS backend, and Prisma ORM baseline established with 30+ semantic git commits.',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
      priority: Priority.MEDIUM,
      labels: ['DevOps'],
      position: 0,
      columnId: colMap.get('Completed')!,
      creatorId: parves.id,
    },
  });

  // 3. Create Board 2: Mobile App Roadmap
  const mobileBoard = await prisma.board.create({
    data: {
      name: '📱 Mobile Application (iOS & Android)',
      description: 'Flutter and React Native companion app development',
      ownerId: rahim.id,
      members: {
        create: [
          {
            userId: parves.id,
            role: Role.MEMBER,
          },
        ],
      },
      columns: {
        create: [
          { name: 'To Do', position: 0 },
          { name: 'In Progress', position: 1 },
          { name: 'Done', position: 2 },
        ],
      },
    },
    include: {
      columns: true,
    },
  });

  const mobileColMap = new Map(mobileBoard.columns.map((c) => [c.name, c.id]));

  await prisma.task.create({
    data: {
      title: 'Push Notifications & WebSockets Integration',
      description: 'Real-time board update alerts when cards are moved by team members.',
      imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80',
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      labels: ['Feature'],
      position: 0,
      columnId: mobileColMap.get('To Do')!,
      creatorId: rahim.id,
      subtasks: {
        create: [
          { title: 'Configure Firebase Cloud Messaging', isCompleted: true },
          { title: 'Implement background message worker', isCompleted: false },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      title: 'Offline Sync & SQLite Storage',
      description: 'Cache board data locally for smooth offline viewing and sync on reconnect.',
      priority: Priority.MEDIUM,
      labels: ['Feature'],
      position: 0,
      columnId: mobileColMap.get('In Progress')!,
      creatorId: parves.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Biometric Login (FaceID / Fingerprint)',
      description: 'Seamless auth with SecureStore and hardware biometrics.',
      priority: Priority.LOW,
      labels: ['Security'],
      position: 0,
      columnId: mobileColMap.get('Done')!,
      creatorId: rahim.id,
    },
  });

  console.log('✨ Seed completed with Priorities, Due Dates, Subtasks, and Comments populated!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
