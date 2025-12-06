import { Injectable, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
class UserOnlyGuard extends AuthGuard('jwt') {}

export function UserOnly() {
  return UseGuards(UserOnlyGuard);
}
