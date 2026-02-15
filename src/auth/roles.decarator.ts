import { SetMetadata } from '@nestjs/common';
import { UserRoles } from '../shared/roles.enum';

export const Roles = (...roles: UserRoles[]) => SetMetadata('roles', roles);
