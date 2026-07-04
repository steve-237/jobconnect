import { PartialType } from '@nestjs/mapped-types';

export class CreateUserDto {
  email!: string;
  password!: string;
  firstName!: string;
  lastName!: string;
}
