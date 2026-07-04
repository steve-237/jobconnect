# JobConnect - Temporary Jobs Platform

JobConnect is a full-stack platform connecting individuals for temporary jobs and micro-tasks (cleaning, moving, DIY, babysitting, etc.). The platform allows quick job posting, intelligent matching, and secure escrow payments.

## 🏗️ Architecture Overview

The system follows a modern **Modular Monolith** architecture (3-tier) using a full TypeScript stack. This ensures rapid development for the MVP while maintaining the ability to split into microservices in the future if needed.

### Core Tech Stack

- **Backend API:** Node.js with NestJS (TypeScript)
- **Database:** PostgreSQL with Prisma ORM
- **Web Client (Employer / Admin):** Next.js (React) + TailwindCSS
- **Mobile App (Candidate / Employer):** React Native (Expo)
- **Payments:** Stripe Connect (Escrow & KYC)
- **Infrastructure:** Docker, AWS / Vercel

---

## 📊 System Diagrams

### 1. High-Level Architecture

```mermaid
graph TD
    subgraph Clients
        Web[Next.js Web Portal\nEmployers & Admins]
        Mobile[Expo Mobile App\nCandidates & Employers]
    end

    subgraph Backend Services
        API[NestJS Modular API]
        Auth[Authentication JWT]
        Matching[Matching Engine]
    end

    subgraph Data & Third-Party
        DB[(PostgreSQL)]
        Redis[(Redis Cache / Queue)]
        Stripe[Stripe Connect\nPayments & Escrow]
    end

    Web <-->|REST / GraphQL| API
    Mobile <-->|REST / GraphQL| API
    
    API --- Auth
    API --- Matching
    API <--> DB
    API <--> Redis
    API <--> Stripe
```

### 2. NestJS Modular Structure

```mermaid
classDiagram
    class AppModule {
        +imports: [UsersModule, JobsModule, PaymentsModule]
    }
    class UsersModule {
        +AuthService
        +UsersController
        +KYCService
    }
    class JobsModule {
        +JobsService
        +MatchingService
        +CategoriesController
    }
    class PaymentsModule {
        +StripeService
        +EscrowController
    }
    
    AppModule --> UsersModule
    AppModule --> JobsModule
    AppModule --> PaymentsModule
```

### 3. Escrow Payment Flow (Stripe Connect)

```mermaid
sequenceDiagram
    participant Employer
    participant JobConnect API
    participant Stripe
    participant Candidate
    
    Employer->>JobConnect API: Accept Candidate & Pay Mission
    JobConnect API->>Stripe: Hold Funds in Escrow (Stripe Connect)
    Stripe-->>JobConnect API: Payment Intent Success
    JobConnect API-->>Employer: Mission Confirmed
    
    Candidate->>JobConnect API: Mission Completed
    Employer->>JobConnect API: Validate Mission
    
    JobConnect API->>Stripe: Release Escrow (Payout Candidate)
    JobConnect API->>Stripe: Deduct Platform Commission
    Stripe-->>Candidate: Funds Transferred
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL (Local or Docker)
- Yarn or NPM

*(Detailed instructions for running Web, Mobile, and Backend will be provided in their respective directories).*
