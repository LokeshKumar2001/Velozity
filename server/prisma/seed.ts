import { PrismaClient, UserRole, TaskStatus, TaskPriority } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // 1. Clean existing records in reverse dependency order
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await bcrypt.hash('Password@123', 10);

  // 2. Create Users: 1 Admin, 2 PMs, 4 Developers
  const admin = await prisma.user.create({
    data: {
      name: 'Sarah Connor',
      email: 'admin@velozity.com',
      passwordHash: defaultPasswordHash,
      role: UserRole.ADMIN,
    },
  });

  const pmPriya = await prisma.user.create({
    data: {
      name: 'Priya Sharma',
      email: 'priya@velozity.com',
      passwordHash: defaultPasswordHash,
      role: UserRole.PROJECT_MANAGER,
    },
  });

  const pmRahul = await prisma.user.create({
    data: {
      name: 'Rahul Kumar',
      email: 'rahul@velozity.com',
      passwordHash: defaultPasswordHash,
      role: UserRole.PROJECT_MANAGER,
    },
  });

  const devRavi = await prisma.user.create({
    data: {
      name: 'Ravi Teja',
      email: 'ravi@velozity.com',
      passwordHash: defaultPasswordHash,
      role: UserRole.DEVELOPER,
    },
  });

  const devVikram = await prisma.user.create({
    data: {
      name: 'Vikram Patel',
      email: 'vikram@velozity.com',
      passwordHash: defaultPasswordHash,
      role: UserRole.DEVELOPER,
    },
  });

  const devSneha = await prisma.user.create({
    data: {
      name: 'Sneha Reddy',
      email: 'sneha@velozity.com',
      passwordHash: defaultPasswordHash,
      role: UserRole.DEVELOPER,
    },
  });

  const devAlex = await prisma.user.create({
    data: {
      name: 'Alex Chen',
      email: 'alex@velozity.com',
      passwordHash: defaultPasswordHash,
      role: UserRole.DEVELOPER,
    },
  });

  console.log('✅ Created 7 users (1 Admin, 2 PMs, 4 Developers)');

  // 3. Create Clients
  const clientAcme = await prisma.client.create({
    data: {
      name: 'Acme Corp',
      email: 'contact@acmecorp.com',
    },
  });

  const clientGlobex = await prisma.client.create({
    data: {
      name: 'Globex Inc.',
      email: 'contact@globex.com',
    },
  });

  const clientNextGen = await prisma.client.create({
    data: {
      name: 'NextGen Ltd',
      email: 'operations@nextgen.com',
    },
  });

  console.log('✅ Created 3 clients');

  // 4. Create Projects
  const projectEcommerce = await prisma.project.create({
    data: {
      name: 'E-commerce Platform',
      description: 'Full-stack multi-vendor online commerce solution with live payment processing and inventory tracking.',
      clientId: clientAcme.id,
      managerId: pmPriya.id,
    },
  });

  const projectMobileApp = await prisma.project.create({
    data: {
      name: 'Mobile App Redesign',
      description: 'Next-generation iOS and Android cross-platform mobile experience with modern typography and animations.',
      clientId: clientGlobex.id,
      managerId: pmRahul.id,
    },
  });

  const projectCRM = await prisma.project.create({
    data: {
      name: 'CRM System',
      description: 'Enterprise pipeline tracking, contact lifecycle management, and revenue analytics for sales teams.',
      clientId: clientNextGen.id,
      managerId: pmRahul.id,
    },
  });

  console.log('✅ Created 3 projects with assigned Project Managers');

  const now = new Date();
  const pastDate1 = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago (overdue)
  const pastDate2 = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000); // 5 days ago (overdue)
  const futureDate1 = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const futureDate2 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const futureDate3 = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  // 5. Create Tasks for Project 1: E-commerce Platform (6 tasks)
  const task1 = await prisma.task.create({
    data: {
      projectId: projectEcommerce.id,
      title: 'API Integration',
      description: 'Integrate payment gateway with the existing system. Handle success, webhook events, and failure cases.',
      assignedTo: devRavi.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: futureDate1,
      isOverdue: false,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      projectId: projectEcommerce.id,
      title: 'Payment gateway',
      description: 'Implement Stripe and PayPal checkout flows with 3D Secure verification.',
      assignedTo: devRavi.id,
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.CRITICAL,
      dueDate: futureDate2,
      isOverdue: false,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      projectId: projectEcommerce.id,
      title: 'Fix responsive layout in checkout',
      description: 'Mobile responsive styling fixes on smaller viewports (iOS Safari & Android Chrome).',
      assignedTo: devSneha.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: pastDate1, // OVERDUE TASK 1
      isOverdue: true,
    },
  });

  const task4 = await prisma.task.create({
    data: {
      projectId: projectEcommerce.id,
      title: 'Product catalog caching',
      description: 'Cache frequently accessed categories and product listings in Redis with 10-minute TTL.',
      assignedTo: devVikram.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      dueDate: futureDate2,
      isOverdue: false,
    },
  });

  const task5 = await prisma.task.create({
    data: {
      projectId: projectEcommerce.id,
      title: 'Project setup & DB migrations',
      description: 'Initial PostgreSQL relational schema setup with Prisma ORM and seed configs.',
      assignedTo: devAlex.id,
      status: TaskStatus.DONE,
      priority: TaskPriority.LOW,
      dueDate: pastDate2,
      isOverdue: false,
    },
  });

  const task6 = await prisma.task.create({
    data: {
      projectId: projectEcommerce.id,
      title: 'Order confirmation email templates',
      description: 'Create responsive HTML email templates with dynamic order items and tax breakdowns.',
      assignedTo: devSneha.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: futureDate3,
      isOverdue: false,
    },
  });

  // 6. Create Tasks for Project 2: Mobile App Redesign (6 tasks)
  const task7 = await prisma.task.create({
    data: {
      projectId: projectMobileApp.id,
      title: 'Design login page',
      description: 'Implement dark navy theme, smooth micro-animations, and form validation for authentication.',
      assignedTo: devAlex.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: futureDate1,
      isOverdue: false,
    },
  });

  const task8 = await prisma.task.create({
    data: {
      projectId: projectMobileApp.id,
      title: 'UI components library',
      description: 'Build reusable UI tokens, buttons, inputs, modals, and badge components.',
      assignedTo: devVikram.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      dueDate: futureDate2,
      isOverdue: false,
    },
  });

  const task9 = await prisma.task.create({
    data: {
      projectId: projectMobileApp.id,
      title: 'Push notification integration',
      description: 'Configure APNS and FCM push notification certificates and background handlers.',
      assignedTo: devRavi.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.CRITICAL,
      dueDate: pastDate2, // OVERDUE TASK 2
      isOverdue: true,
    },
  });

  const task10 = await prisma.task.create({
    data: {
      projectId: projectMobileApp.id,
      title: 'Biometric authentication (FaceID & Fingerprint)',
      description: 'Support local authentication fallback for secure token retrieval.',
      assignedTo: devAlex.id,
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.HIGH,
      dueDate: futureDate2,
      isOverdue: false,
    },
  });

  const task11 = await prisma.task.create({
    data: {
      projectId: projectMobileApp.id,
      title: 'Landing page onboarding tour',
      description: 'Multi-step carousel onboarding walkthrough explaining core capabilities.',
      assignedTo: devSneha.id,
      status: TaskStatus.DONE,
      priority: TaskPriority.LOW,
      dueDate: pastDate1,
      isOverdue: false,
    },
  });

  const task12 = await prisma.task.create({
    data: {
      projectId: projectMobileApp.id,
      title: 'Deep linking configuration',
      description: 'Universal links configuration on iOS and Android intent filters for shared URLs.',
      assignedTo: devVikram.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      dueDate: futureDate3,
      isOverdue: false,
    },
  });

  // 7. Create Tasks for Project 3: CRM System (6 tasks)
  const task13 = await prisma.task.create({
    data: {
      projectId: projectCRM.id,
      title: 'Build user authentication',
      description: 'JWT token pairs with HttpOnly cookie refresh token rotation and role-based guard middleware.',
      assignedTo: devRavi.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.HIGH,
      dueDate: futureDate1,
      isOverdue: false,
    },
  });

  const task14 = await prisma.task.create({
    data: {
      projectId: projectCRM.id,
      title: 'Database optimization & indexing',
      description: 'Analyze slow queries and create composite indexes on activity_logs and notifications.',
      assignedTo: devVikram.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      dueDate: futureDate2,
      isOverdue: false,
    },
  });

  const task15 = await prisma.task.create({
    data: {
      projectId: projectCRM.id,
      title: 'Bug fixes in lead export',
      description: 'Resolve memory leak in CSV export stream for large customer datasets.',
      assignedTo: devSneha.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: futureDate1,
      isOverdue: false,
    },
  });

  const task16 = await prisma.task.create({
    data: {
      projectId: projectCRM.id,
      title: 'Performance testing with k6',
      description: 'Benchmark real-time WebSocket connection handling under 1,000 concurrent client loads.',
      assignedTo: devAlex.id,
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.MEDIUM,
      dueDate: futureDate2,
      isOverdue: false,
    },
  });

  const task17 = await prisma.task.create({
    data: {
      projectId: projectCRM.id,
      title: 'API documentation & Swagger OpenAPI',
      description: 'Comprehensive endpoint documentation with response schemas and status code examples.',
      assignedTo: devRavi.id,
      status: TaskStatus.DONE,
      priority: TaskPriority.LOW,
      dueDate: pastDate1,
      isOverdue: false,
    },
  });

  const task18 = await prisma.task.create({
    data: {
      projectId: projectCRM.id,
      title: 'Audit logging middleware',
      description: 'Capture all resource mutations with actor ID, timestamp, and before/after state diffs.',
      assignedTo: devVikram.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: futureDate3,
      isOverdue: false,
    },
  });

  console.log('✅ Created 18 tasks across 3 projects (including 2 intentionally overdue tasks)');

  // 8. Create Pre-existing Activity Logs
  const logEntries = [
    {
      projectId: projectEcommerce.id,
      taskId: task2.id,
      userId: devRavi.id,
      action: 'TASK_STATUS_UPDATED',
      oldStatus: TaskStatus.IN_PROGRESS,
      newStatus: TaskStatus.IN_REVIEW,
      metadata: { taskTitle: task2.title, message: 'Ravi moved Task #2 from In Progress → In Review' },
      createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 mins ago
    },
    {
      projectId: projectEcommerce.id,
      taskId: null,
      userId: pmPriya.id,
      action: 'PROJECT_CREATED',
      oldStatus: null,
      newStatus: null,
      metadata: { projectTitle: projectEcommerce.name, message: "Priya created a new project 'E-commerce Platform'" },
      createdAt: new Date(Date.now() - 12 * 60 * 1000), // 12 mins ago
    },
    {
      projectId: projectMobileApp.id,
      taskId: task8.id,
      userId: pmRahul.id,
      action: 'TASK_ASSIGNED',
      oldStatus: null,
      newStatus: null,
      metadata: { taskTitle: task8.title, assigneeName: 'Vikram Patel', message: 'Vikram was assigned to Task #8' },
      createdAt: new Date(Date.now() - 25 * 60 * 1000), // 25 mins ago
    },
    {
      projectId: projectCRM.id,
      taskId: task15.id,
      userId: devSneha.id,
      action: 'COMMENT_ADDED',
      oldStatus: null,
      newStatus: null,
      metadata: { taskTitle: task15.title, message: 'Sneha commented on Task #15' },
      createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
    },
    {
      projectId: projectEcommerce.id,
      taskId: task5.id,
      userId: devAlex.id,
      action: 'TASK_STATUS_UPDATED',
      oldStatus: TaskStatus.IN_REVIEW,
      newStatus: TaskStatus.DONE,
      metadata: { taskTitle: task5.title, message: 'Alex updated Task #5 status to Done' },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      projectId: projectMobileApp.id,
      taskId: null,
      userId: admin.id,
      action: 'CLIENT_CREATED',
      oldStatus: null,
      newStatus: null,
      metadata: { clientName: 'NextGen Ltd', message: "Admin created a new client 'NextGen Ltd'" },
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    },
  ];

  for (const entry of logEntries) {
    await prisma.activityLog.create({ data: entry });
  }

  console.log('✅ Created 6 pre-existing activity log entries');

  // 9. Create Pre-existing Notifications
  const notifications = [
    {
      userId: devRavi.id,
      taskId: task1.id,
      type: 'TASK_ASSIGNED',
      message: "You have been assigned to Task 'API Integration' in 'E-commerce Platform'",
      isRead: false,
      createdAt: new Date(Date.now() - 2 * 60 * 1000),
    },
    {
      userId: pmPriya.id,
      taskId: task2.id,
      type: 'TASK_IN_REVIEW',
      message: "Task 'Payment gateway' was moved to In Review by Ravi Teja",
      isRead: false,
      createdAt: new Date(Date.now() - 10 * 60 * 1000),
    },
    {
      userId: devSneha.id,
      taskId: task3.id,
      type: 'TASK_OVERDUE',
      message: "Task 'Fix responsive layout in checkout' is past its due date and flagged as Overdue",
      isRead: false,
      createdAt: new Date(Date.now() - 50 * 60 * 1000),
    },
    {
      userId: devVikram.id,
      taskId: task8.id,
      type: 'TASK_ASSIGNED',
      message: "You have been assigned to Task 'UI components library' in 'Mobile App Redesign'",
      isRead: true,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
    {
      userId: admin.id,
      taskId: null,
      type: 'SYSTEM_ALERT',
      message: 'Automated background task inspection completed successfully.',
      isRead: true,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
  ];

  for (const notif of notifications) {
    await prisma.notification.create({ data: notif });
  }

  console.log('✅ Created 5 sample notifications');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
