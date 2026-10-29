export type Role = 'ADMIN' | 'EMPLOYER' | 'CANDIDATE';

export type JobStatus =
  | 'PENDING'
  | 'PUBLISHED'
  | 'MATCHING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type KycStatus = 'UNVERIFIED' | 'PENDING' | 'APPROVED' | 'REJECTED';

export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  bio?: string | null;
  avatarUrl?: string | null;
  isVerified?: boolean;
  kycStatus?: KycStatus;
  kycDocType?: string | null;
  kycDocUrl?: string | null;
  kycSelfieUrl?: string | null;
  kycSubmittedAt?: string | null;
  expoPushToken?: string | null;
  skills?: string[];
  portfolio?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  iconUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  price: number;
  status: JobStatus;
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isPaid?: boolean;
  stripeSessionId?: string | null;
  scheduledDate?: string | null;
  estimatedDuration?: number | null;
  categoryId: string;
  category?: Category;
  employerId: string;
  employer?: Partial<User>;
  applications?: Application[];
  _count?: { applications: number };
  createdAt: string;
  updatedAt?: string;
}

export interface Application {
  id: string;
  message?: string | null;
  isAccepted: boolean;
  status: ApplicationStatus | string;
  jobId: string;
  jobTitle?: string;
  job?: Job;
  candidateId: string;
  candidate?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string | null;
    bio?: string | null;
    isVerified?: boolean;
    skills?: string[];
  };
  createdAt: string;
  updatedAt?: string;
}

export type CandidateApplication = Application & {
  job: Job;
};

export type EmployerApplication = Application & {
  candidate: NonNullable<Application['candidate']>;
};

export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender?: Partial<User>;
  applicationId: string;
  createdAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string | null;
  jobId: string;
  job?: Partial<Job>;
  reviewerId: string;
  reviewer?: Partial<User>;
  revieweeId: string;
  reviewee?: Partial<User>;
  createdAt: string;
}

export interface Transaction {
  id: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  stripeSessionId?: string | null;
  jobId: string;
  job?: Partial<Job>;
  employerId: string;
  employer?: Partial<User>;
  candidateId: string;
  candidate?: Partial<User>;
  createdAt: string;
}

export interface Dispute {
  id: string;
  reason: string;
  description: string;
  evidenceUrls?: string[];
  defendantReply?: string | null;
  defendantProof?: string[];
  resolutionNotes?: string | null;
  status: string;
  jobId: string;
  job?: Partial<Job>;
  initiatorId: string;
  initiator?: Partial<User>;
  defendantId: string;
  defendant?: Partial<User>;
  createdAt: string;
  updatedAt?: string;
}

export interface Availability {
  id: string;
  date: string;
  startTime?: string | null;
  endTime?: string | null;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
}
