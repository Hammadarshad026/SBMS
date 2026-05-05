import { SetMetadata } from '@nestjs/common';
import { Role } from '../../common/enums/business.enums';

export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
