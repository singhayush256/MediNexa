import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err: any, user: any) {
    // If error or no user, do not throw; return null or guest user
    if (err || !user) {
      return null;
    }
    return user;
  }
}
