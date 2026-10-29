import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAvailabilityDto {
  @IsString()
  @IsNotEmpty()
  date!: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;
}
