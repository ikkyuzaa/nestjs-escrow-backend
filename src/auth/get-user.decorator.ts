import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../user/entities/user.entity'; // Import the User entity

/**
 * Custom decorator to extract the authenticated user from the request.
 * Usage: `@GetUser() user: User` in a controller method.
 */
export const GetUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // Assuming Passport has attached the user object to req.user
  },
);
