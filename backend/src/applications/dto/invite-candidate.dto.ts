import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class InviteCandidateDto {
  @IsString()
  @IsNotEmpty()
  candidateId!: string;

  @IsString()
  @IsNotEmpty()
  jobId!: string;

  @IsOptional()
  @IsString()
  message?: string;
}
