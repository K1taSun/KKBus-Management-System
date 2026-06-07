import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true; // No roles required
    }

    const { user } = context.switchToHttp().getRequest();
    
    // user.role is attached by the JWT Strategy
    if (!user || !user.role) return false;

    // We compare case insensitively or exact match depending on DB, assume exact but capitalize first
    const hasRole = requiredRoles.some((role) => user.role.toLowerCase() === role.toLowerCase());
    return hasRole;
  }
}
