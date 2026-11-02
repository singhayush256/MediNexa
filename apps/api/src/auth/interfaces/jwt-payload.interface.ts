import { RoleCode, UserStatus } from '@medinexa/types';

export interface JwtPayload {
  sub: string;
  email: string;
  role: RoleCode;
  status: UserStatus;
  organizationId: string;
  facilityId?: string;
}
