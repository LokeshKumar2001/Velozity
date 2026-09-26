import { PrismaClient, UserRole, TaskStatus, TaskPriority } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  const defaultPasswordHash = await bcrypt.hash('Password@123', 10);

  // Seed default team members across roles
  const admin = await prisma.user.create({
    data: {
      name: 'Aarav Mehta',
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

  const devAnanya = await prisma.user.create({
    data: {
      name: 'Ananya Roy',
      email: 'ananya@velozity.com',
      passwordHash: defaultPasswordHash,
      role: UserRole.DEVELOPER,
    },
  });

  // Clients
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

  // Projects
  const projectEcommerce = await prisma.project.create({
    data: {
      name: 'E-commerce Platform',
      description: 'Multi-vendor store with payment processing and stock management.',
      clientId: clientAcme.id,
      managerId: pmPriya.id,
    },
  });

  const projectMobileApp = await prisma.project.create({
    data: {
      name: 'Mobile App Redesign',
      description: 'Cross-platform app redesign with revised navigation and theming.',
      clientId: clientGlobex.id,
      managerId: pmRahul.id,
    },
  });

  const projectCRM = await prisma.project.create({
    data: {
      name: 'CRM System',
      description: 'Sales pipeline and lead tracking system.',
      clientId: clientNextGen.id,
      managerId: pmRahul.id,
    },
  });

  const pastDate1 = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
  const pastDate2 = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
  const futureDate1 = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  const futureDate2 = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const futureDate3 = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  // E-commerce Platform tasks
  const task1 = await prisma.task.create({
    data: {
      projectId: projectEcommerce.id,
      title: 'API Integration',
      description: 'Hook up payment provider webhook handlers and verify edge failure states.',
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
      description: 'Integrate checkout redirect and 3D Secure callbacks.',
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
      description: 'Layout bugs reported on mobile viewports.',
      assignedTo: devSneha.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
      dueDate: pastDate1,
      isOverdue: true,
    },
  });

  const task4 = await prisma.task.create({
    data: {
      projectId: projectEcommerce.id,
      title: 'Product catalog caching',
      description: 'Cache high-traffic category listing endpoints.',
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
      description: 'Baseline schema setup and initial seed configuration.',
      assignedTo: devAnanya.id,
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
      description: 'Email receipt templates with tax breakdowns.',
      assignedTo: devSneha.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: futureDate3,
      isOverdue: false,
    },
  });

  // Tasks - Mobile App Redesign
  const task7 = await prisma.task.create({
    data: {
      projectId: projectMobileApp.id,
      title: 'Design login page',
      description: 'Theme updates and form validation.',
      assignedTo: devAnanya.id,
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
      description: 'Reusable buttons, inputs, modals, and badge components.',
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
      description: 'Push notification credentials and background token handlers.',
      assignedTo: devRavi.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.CRITICAL,
      dueDate: pastDate2,
      isOverdue: true,
    },
  });

  const task10 = await prisma.task.create({
    data: {
      projectId: projectMobileApp.id,
      title: 'Biometric authentication fallback',
      description: 'FaceID and fingerprint unlock for session token retrieval.',
      assignedTo: devAnanya.id,
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
      description: 'Product walkthrough for first-time signups.',
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
      description: 'App link routing for incoming share links.',
      assignedTo: devVikram.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      dueDate: futureDate3,
      isOverdue: false,
    },
  });

  // Tasks - CRM System
  const task13 = await prisma.task.create({
    data: {
      projectId: projectCRM.id,
      title: 'Build user authentication',
      description: 'JWT token pair with refresh cookies and role guards.',
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
      description: 'Indexes on activity_logs and notifications.',
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
      description: 'Fix stream buffering in CSV export.',
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
      title: 'Performance testing',
      description: 'Benchmarking socket connection throughput under concurrency.',
      assignedTo: devAnanya.id,
      status: TaskStatus.IN_REVIEW,
      priority: TaskPriority.MEDIUM,
      dueDate: futureDate2,
      isOverdue: false,
    },
  });

  const task17 = await prisma.task.create({
    data: {
      projectId: projectCRM.id,
      title: 'API documentation & Swagger setup',
      description: 'Endpoint definitions and status codes.',
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
      description: 'Audit trail for status and role updates.',
      assignedTo: devVikram.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: futureDate3,
      isOverdue: false,
    },
  });

  // Activity logs
  const logEntries = [
    {
      projectId: projectEcommerce.id,
      taskId: task2.id,
      userId: devRavi.id,
      action: 'TASK_STATUS_UPDATED',
      oldStatus: TaskStatus.IN_PROGRESS,
      newStatus: TaskStatus.IN_REVIEW,
      metadata: { taskTitle: task2.title, message: 'Ravi moved Task #2 from In Progress → In Review' },
      createdAt: new Date(Date.now() - 2 * 60 * 1000),
    },
    {
      projectId: projectEcommerce.id,
      taskId: null,
      userId: pmPriya.id,
      action: 'PROJECT_CREATED',
      oldStatus: null,
      newStatus: null,
      metadata: { projectTitle: projectEcommerce.name, message: "Priya created a new project 'E-commerce Platform'" },
      createdAt: new Date(Date.now() - 12 * 60 * 1000),
    },
    {
      projectId: projectMobileApp.id,
      taskId: task8.id,
      userId: pmRahul.id,
      action: 'TASK_ASSIGNED',
      oldStatus: null,
      newStatus: null,
      metadata: { taskTitle: task8.title, assigneeName: 'Vikram Patel', message: 'Vikram was assigned to Task #8' },
      createdAt: new Date(Date.now() - 25 * 60 * 1000),
    },
    {
      projectId: projectCRM.id,
      taskId: task15.id,
      userId: devSneha.id,
      action: 'COMMENT_ADDED',
      oldStatus: null,
      newStatus: null,
      metadata: { taskTitle: task15.title, message: 'Sneha commented on Task #15' },
      createdAt: new Date(Date.now() - 60 * 60 * 1000),
    },
    {
      projectId: projectEcommerce.id,
      taskId: task5.id,
      userId: devAnanya.id,
      action: 'TASK_STATUS_UPDATED',
      oldStatus: TaskStatus.IN_REVIEW,
      newStatus: TaskStatus.DONE,
      metadata: { taskTitle: task5.title, message: 'Ananya updated Task #5 status to Done' },
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      projectId: projectMobileApp.id,
      taskId: null,
      userId: admin.id,
      action: 'CLIENT_CREATED',
      oldStatus: null,
      newStatus: null,
      metadata: { clientName: 'NextGen Ltd', message: "Admin created a new client 'NextGen Ltd'" },
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
  ];

  for (const entry of logEntries) {
    await prisma.activityLog.create({ data: entry });
  }

  // Notifications
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
      message: 'Background scheduler completed task inspection.',
      isRead: true,
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
  ];

  for (const notif of notifications) {
    await prisma.notification.create({ data: notif });
  }

  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
