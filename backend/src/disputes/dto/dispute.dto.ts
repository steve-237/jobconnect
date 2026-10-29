import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDisputeDto {
  @IsString()
  @IsNotEmpty()
  jobId!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidenceUrls?: string[];
}

export class RespondDisputeDto {
  @IsString()
  @IsNotEmpty()
  reply!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidenceUrls?: string[];
}

export class ArbitrateDisputeDto {
  @IsIn(['REFUND_EMPLOYER', 'PAY_CANDIDATE', 'SPLIT', 'DISMISS'])
  decision!: 'REFUND_EMPLOYER' | 'PAY_CANDIDATE' | 'SPLIT' | 'DISMISS';

  @IsString()
  @IsNotEmpty()
  resolutionNotes!: string;
}
