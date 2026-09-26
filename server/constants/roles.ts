export enum UserRoleEnum {
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  DEVELOPER = 'DEVELOPER',
}

export const ALL_ROLES = [
  UserRoleEnum.ADMIN,
  UserRoleEnum.PROJECT_MANAGER,
  UserRoleEnum.DEVELOPER,
] as const;

export type UserRoleType = keyof typeof UserRoleEnum;
