export class CreateDisputeDto {
  jobId: string;
  reason: string;
  description: string;
  evidenceUrls?: string[];
}

export class RespondDisputeDto {
  reply: string;
  evidenceUrls?: string[];
}

export class ArbitrateDisputeDto {
  decision: 'REFUND_EMPLOYER' | 'PAY_CANDIDATE' | 'SPLIT' | 'DISMISS';
  resolutionNotes: string;
}
