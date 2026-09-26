export enum TaskStatusEnum {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
}

export enum TaskPriorityEnum {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export const ALL_TASK_STATUSES = [
  TaskStatusEnum.TODO,
  TaskStatusEnum.IN_PROGRESS,
  TaskStatusEnum.IN_REVIEW,
  TaskStatusEnum.DONE,
] as const;

export const ALL_TASK_PRIORITIES = [
  TaskPriorityEnum.LOW,
  TaskPriorityEnum.MEDIUM,
  TaskPriorityEnum.HIGH,
  TaskPriorityEnum.CRITICAL,
] as const;
