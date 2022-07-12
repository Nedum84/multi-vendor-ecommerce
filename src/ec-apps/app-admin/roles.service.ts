import { UserRoleStatus } from "../../ec-user/types";

const isAdmin = (role: UserRoleStatus) => {
  const allowed = [
    UserRoleStatus.ADMIN1,
    UserRoleStatus.ADMIN2,
    UserRoleStatus.ADMIN3,
    UserRoleStatus.SUPER_ADMIN,
    UserRoleStatus.OMEGA_ADMIN,
  ];
  if (allowed.includes(role)) {
    return true;
  }
  return false;
};
const allowCreate = (role: UserRoleStatus): boolean => {
  const allowed = [
    UserRoleStatus.ADMIN1,
    UserRoleStatus.ADMIN2,
    UserRoleStatus.ADMIN3,
    UserRoleStatus.SUPER_ADMIN,
    UserRoleStatus.OMEGA_ADMIN,
  ];
  if (allowed.includes(role)) {
    return true;
  }
  return false;
};
const allowUpdate = (role: UserRoleStatus): boolean => {
  const allowed = [
    UserRoleStatus.ADMIN1,
    UserRoleStatus.ADMIN2,
    UserRoleStatus.ADMIN3,
    UserRoleStatus.SUPER_ADMIN,
    UserRoleStatus.OMEGA_ADMIN,
  ];
  if (allowed.includes(role)) {
    return true;
  }
  return false;
};
const allowDelete = (role: UserRoleStatus): boolean => {
  const allowed = [
    UserRoleStatus.ADMIN1,
    UserRoleStatus.ADMIN2,
    UserRoleStatus.ADMIN3,
    UserRoleStatus.SUPER_ADMIN,
    UserRoleStatus.OMEGA_ADMIN,
  ];
  if (allowed.includes(role)) {
    return true;
  }
  return false;
};

export { isAdmin, allowCreate, allowDelete, allowUpdate };
