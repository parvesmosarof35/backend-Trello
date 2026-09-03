import { Priority, PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding with 4 Users & 3 Boards...');

  // Clean existing test data
  await prisma.comment.deleteMany({});
  await prisma.subtask.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.column.deleteMany({});
  await prisma.boardMember.deleteMany({});
  await prisma.board.deleteMany({});
  await prisma.user.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create 4 Users
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

  const sarah = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah@trello.com',
      password: passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  const alex = await prisma.user.create({
    data: {
      name: 'Alex Chen',
      email: 'alex@trello.com',
      password: passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  });

  console.log('✅ Created 4 users: Parves, Rahim, Sarah & Alex (Password: password123)');

  // ==========================================
  // BOARD 1: E-Commerce Platform V2
  // ==========================================
  const ecommerceBoard = await prisma.board.create({
    data: {
      name: '🚀 E-Commerce Platform V2',
      description: 'Main product roadmap, checkout flow, and UI redesign board',
      ownerId: parves.id,
      members: {
        create: [
          { userId: rahim.id, role: Role.MEMBER },
          { userId: sarah.id, role: Role.MEMBER },
          { userId: alex.id, role: Role.VIEWER },
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

  const colMap1 = new Map(ecommerceBoard.columns.map((c) => [c.name, c.id]));

  // Task 1: Product Card UI
  await prisma.task.create({
    data: {
      title: 'Design high-converting Product Card UI',
      description: 'Implement modern glassmorphic product cards with discount badges, color swatches, and quick add-to-cart animations.',
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      labels: ['Design', 'UI/UX'],
      position: 0,
      columnId: colMap1.get('To Do')!,
      creatorId: sarah.id,
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
            content: 'Looks awesome! Make sure discount badges contrast well on dark mode.',
            authorId: rahim.id,
          },
          {
            content: 'Agreed, will test with high-contrast amber accents!',
            authorId: sarah.id,
          },
        ],
      },
    },
  });

  // Task 2: Multi-step Stripe Checkout
  await prisma.task.create({
    data: {
      title: 'Implement Multi-step Checkout with Stripe',
      description: 'Integrate Stripe Elements, shipping address validation, and automatic PDF invoice generation.',
      imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67e5572263?w=600&auto=format&fit=crop&q=80',
      priority: Priority.URGENT,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      labels: ['Backend', 'Feature'],
      position: 1,
      columnId: colMap1.get('To Do')!,
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

  // Task 3: Drag and Drop Engine
  await prisma.task.create({
    data: {
      title: 'Build Drag & Drop Kanban Reordering Engine',
      description: 'Leverage @dnd-kit and transactional Prisma atomic moves for reliable multi-column ordering.',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      labels: ['Frontend', 'Feature'],
      position: 0,
      columnId: colMap1.get('In Progress')!,
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

  // Task 4: Cloudinary Upload Pipeline
  await prisma.task.create({
    data: {
      title: 'Setup Cloudinary CDN Image Attachment Pipeline',
      description: 'Direct unsigned image uploads for task covers and user avatars with auto-compression.',
      priority: Priority.MEDIUM,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      labels: ['DevOps', 'Backend'],
      position: 1,
      columnId: colMap1.get('In Progress')!,
      creatorId: parves.id,
    },
  });

  // Task 5: Database Indexing (Overdue test)
  await prisma.task.create({
    data: {
      title: 'PostgreSQL Database Indexing & Query Tuning',
      description: 'Add composite indexes on boardId and columnId to guarantee sub-millisecond lookups.',
      priority: Priority.LOW,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // Overdue!
      labels: ['Backend', 'DevOps'],
      position: 0,
      columnId: colMap1.get('Review & QA')!,
      creatorId: alex.id,
    },
  });

  // Task 6: Completed Scaffolding
  await prisma.task.create({
    data: {
      title: 'Project Architecture & Scaffolding',
      description: 'Next.js App Router, NestJS backend, and Prisma ORM baseline established with 35+ git commits.',
      imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80',
      priority: Priority.MEDIUM,
      labels: ['DevOps'],
      position: 0,
      columnId: colMap1.get('Completed')!,
      creatorId: parves.id,
    },
  });

  // ==========================================
  // BOARD 2: Mobile Application (iOS & Android)
  // ==========================================
  const mobileBoard = await prisma.board.create({
    data: {
      name: '📱 Mobile Application (iOS & Android)',
      description: 'Flutter and React Native companion app development',
      ownerId: rahim.id,
      members: {
        create: [
          { userId: parves.id, role: Role.MEMBER },
          { userId: sarah.id, role: Role.MEMBER },
        ],
      },
      columns: {
        create: [
          { name: 'To Do', position: 0 },
          { name: 'In Progress', position: 1 },
          { name: 'Testing', position: 2 },
          { name: 'Done', position: 3 },
        ],
      },
    },
    include: {
      columns: true,
    },
  });

  const colMap2 = new Map(mobileBoard.columns.map((c) => [c.name, c.id]));

  await prisma.task.create({
    data: {
      title: 'Push Notifications & WebSockets Integration',
      description: 'Real-time board update alerts when cards are moved by team members.',
      imageUrl: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80',
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      labels: ['Feature', 'Mobile'],
      position: 0,
      columnId: colMap2.get('To Do')!,
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
      description: 'Cache board data locally for smooth offline viewing and automatic sync on reconnect.',
      priority: Priority.MEDIUM,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      labels: ['Feature', 'Mobile'],
      position: 0,
      columnId: colMap2.get('In Progress')!,
      creatorId: parves.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Dark Mode HSL Theme Switcher',
      description: 'Add fluid animated theme toggle between Midnight Slate and OLED Pitch Black.',
      priority: Priority.LOW,
      labels: ['Design', 'UI/UX'],
      position: 0,
      columnId: colMap2.get('Testing')!,
      creatorId: sarah.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'Biometric Login (FaceID / Fingerprint)',
      description: 'Seamless authentication with SecureStore and native hardware biometrics.',
      imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
      priority: Priority.URGENT,
      labels: ['Security'],
      position: 0,
      columnId: colMap2.get('Done')!,
      creatorId: rahim.id,
    },
  });

  // ==========================================
  // BOARD 3: Brand Redesign & Marketing Campaign
  // ==========================================
  const marketingBoard = await prisma.board.create({
    data: {
      name: '🎨 Brand Redesign & Marketing Campaign',
      description: 'Figma design systems, marketing landing pages, and launch press kits',
      ownerId: sarah.id,
      members: {
        create: [
          { userId: parves.id, role: Role.MEMBER },
          { userId: alex.id, role: Role.MEMBER },
        ],
      },
      columns: {
        create: [
          { name: 'Ideas & Brainstorming', position: 0 },
          { name: 'Design Sprint', position: 1 },
          { name: 'Development', position: 2 },
          { name: 'Published', position: 3 },
        ],
      },
    },
    include: {
      columns: true,
    },
  });

  const colMap3 = new Map(marketingBoard.columns.map((c) => [c.name, c.id]));

  await prisma.task.create({
    data: {
      title: 'Design 3D Glassmorphic Icon Set for Website',
      description: 'Create 20+ isometric and 3D icons for feature callouts and hero sections.',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      priority: Priority.HIGH,
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      labels: ['Design', 'Marketing'],
      position: 0,
      columnId: colMap3.get('Ideas & Brainstorming')!,
      creatorId: sarah.id,
      subtasks: {
        create: [
          { title: '3D Blender renders', isCompleted: false },
          { title: 'Export SVG and WebP sprites', isCompleted: false },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      title: 'High-Converting Landing Page Copy & Hero Section',
      description: 'Draft headline variations, customer testimonials, and interactive product demo CTA.',
      imageUrl: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&auto=format&fit=crop&q=80',
      priority: Priority.URGENT,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      labels: ['Marketing', 'Feature'],
      position: 0,
      columnId: colMap3.get('Design Sprint')!,
      creatorId: sarah.id,
      comments: {
        create: [
          {
            content: 'Check out the copy in Notion. Highlight the instant real-time sync!',
            authorId: parves.id,
          },
        ],
      },
    },
  });

  await prisma.task.create({
    data: {
      title: 'SEO Core Web Vitals & OpenGraph Meta Tags',
      description: 'Optimize Lighthouse score to 99+, dynamic Twitter / LinkedIn cards, and sitemap.xml.',
      priority: Priority.MEDIUM,
      dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      labels: ['DevOps', 'Marketing'],
      position: 0,
      columnId: colMap3.get('Development')!,
      creatorId: alex.id,
    },
  });

  await prisma.task.create({
    data: {
      title: 'New Logo & Color Palette Guidelines V1',
      description: 'Finalized modern geometric Trello logo, Inter font pairing, and dark mode tokens.',
      imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
      priority: Priority.LOW,
      labels: ['Design'],
      position: 0,
      columnId: colMap3.get('Published')!,
      creatorId: sarah.id,
    },
  });

  console.log('✨ Seed completed with 4 Users, 3 Boards, 13 Columns, and 14 Rich Tasks!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
