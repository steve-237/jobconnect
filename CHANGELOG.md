# Project Tracking & Changelog

This document tracks all implemented steps and modifications for the JobConnect MVP.

## [Unreleased]
- Fix PostgreSQL connection issue by switching host to `127.0.0.1`.
- Update `.env` and `docker-compose.yml`.

## [v0.1.0] - Sprint 1 Foundations

### Architecture & Specs
- Initialized root `.gitignore` to exclude temporary AI agents and local docs.
- Created `README.md` containing full architecture diagrams (Mermaid) and English documentation.
- Ignored initial project specifications (`Cahier des charges - Plateforme Jobs Ponctuels.docx`).

### Codebase Initialization
- Generated Next.js workspace for Web Portal (Employers & Admin).
- Generated React Native Expo workspace for Mobile App (Candidates & Employers).
- Generated NestJS workspace for the Backend API.

### Database & Models
- Configured PostgreSQL Docker container (`docker-compose.yml`).
- Initialized Prisma ORM in the backend.
- Designed the database schema (`backend/prisma/schema.prisma`) featuring:
  - `User`
  - `Job`
  - `Category`
  - `Application`
- Generated basic REST API CRUD controllers and services in NestJS for `users`, `jobs`, and `categories`.

### Security & Authentication
- Installed `@nestjs/jwt`, `@nestjs/passport`, `bcrypt` and their types.
- Generated NestJS `auth` module, service, and controller as the foundation for the JWT authentication system.
- Implemented `/auth/register` endpoint using `bcrypt` for secure password hashing.
- Implemented `/auth/login` endpoint that returns a signed JWT token on valid credentials.
- Configured Passport `JwtStrategy` and `JwtAuthGuard` to protect authenticated API routes.

## Sprint 2: Frontend Web (Next.js)
### Authentication UI
- Installed `axios`, `lucide-react`, `clsx`, `tailwind-merge`.
- Created a premium Tailwind v4 theme in `globals.css` (Glassmorphism, gradients).
- Developed a modern `/login` page with JWT saving to `localStorage`.
- Developed a modern `/register` page with auto-login on success.
- Configured `api.ts` Axios client to auto-attach the JWT to requests.

### Landing Page Redesign
- Complete professional redesign with sticky navbar, hero section with illustration, features section with generated images, how-it-works 4-step flow, testimonials, CTA banner, and footer.
- Added fade-in animations, gradient-border effects, and glassmorphism utilities.
- Updated layout.tsx with Inter font and proper SEO metadata.

### New Pages
- **Dashboard** (`/dashboard`): Stats cards, recent jobs, quick actions sidebar, activity feed. Auth-guarded with JWT decode for personalized greeting.
- **Browse Jobs** (`/jobs`): Job grid with search bar, category filter, 6 realistic mock jobs (French), pagination UI.
- **Profile** (`/profile`): User profile with avatar, editable personal info form, account settings, stats cards. Auth-guarded.

## [v0.3.0] - Job Management
- feat(backend): Implement Prisma service for Jobs and Categories
- feat(backend): Protect job creation routes with JwtAuthGuard
- chore(backend): Add seed script for default categories
- feat(web): Create /jobs/create page for posting new jobs
- feat(web): Update /jobs page to fetch dynamic data from API
- feat(web): Create /jobs/[id] detailed view page

## [v0.4.0] - Role-Based Dashboards & Admin (Sprint 4)
- feat(auth): Added role selection (`CANDIDATE` | `EMPLOYER`) during registration.
- feat(backend): Secured user routes and job creation route with role-based checks.
- feat(web): Splitted dashboard into visually distinct `CandidateDashboard` and `EmployerDashboard`.
- feat(web): Created `/admin` interface with global statistics and user management table.
- chore(backend): Updated Prisma seed to inject default `ADMIN`, `EMPLOYER`, and `CANDIDATE` test users.
- feat(web): Auto-redirect logged-in users from the landing page to their dashboard.
- feat(web): Added functional logout buttons across all dashboards.

## [v0.5.0] - Application Management (Sprint 5)
- feat(backend): Generated `applications` NestJS module, controller, and service.
- feat(backend): Implemented application creation, list per candidate, list per job, and acceptance endpoints.
- feat(backend): Added `employer/my-jobs` endpoint to retrieve jobs and application counts for an employer.
- feat(web): Updated `jobs/[id]` page with a message textarea and API connection for candidates to apply.
- feat(web): Replaced mocked applications in `CandidateDashboard` with real API data.
- feat(web): Replaced mocked jobs in `EmployerDashboard` with real API data.
- feat(web): Added an "Applicants" modal in `EmployerDashboard` to view candidate messages and Accept/Reject them.

## [v0.6.0] - Real-time Chat (Sprint 6)
- feat(backend): Integrated `@nestjs/websockets` and `socket.io`.
- feat(backend): Created `Message` model in Prisma.
- feat(backend): Developed `MessagesGateway` to handle bidirectional socket communication in isolated application rooms.
- feat(backend): Added `MessagesController` and `MessagesService` for persisting and retrieving message histories.
- feat(web): Created a dedicated custom hook `useSocket` to manage connections and JWT authentication.
- feat(web): Built the Chat Room UI (`/messages/[applicationId]`) with auto-scroll and instant message display.
- feat(web): Added "Discuter" buttons on both `CandidateDashboard` and `EmployerDashboard` for accepted applications.

## [v0.7.0] - Mobile App MVP (Sprint 7)
- feat(mobile): Initialized Expo project with Expo Router (`app/` directory).
- feat(mobile): Created `api/client.ts` with Axios interceptors for automatic JWT injection via `expo-secure-store`.
- feat(mobile): Developed `LoginScreen` for Candidate authentication.
- feat(mobile): Implemented `JobsScreen` with `FlatList` to fetch and display available jobs dynamically.
- feat(mobile): Added `ProfileScreen` with SecureStore token deletion (Logout) functionality.
- chore(backend): Adjusted CORS settings in NestJS `main.ts` to accept mobile requests.

## [v0.8.0] - Employer Mobile Experience (Sprint 9)
- feat(mobile): Created dynamic role-based routing in `_layout.tsx` (redirects `CANDIDATE` to `(tabs)` and `EMPLOYER` to `(employer_tabs)`).
- feat(mobile): Added Employer Bottom Navigation Tabs (My Jobs, Create, Profile).
- feat(mobile): Developed `CreateJobScreen` allowing employers to post jobs directly from their phone.
- feat(mobile): Implemented `EmployerJobsScreen` showing live statistics on applicants per job.
- feat(mobile): Created `ApplicantsScreen` allowing employers to review, accept candidates, and start chatting directly on mobile.