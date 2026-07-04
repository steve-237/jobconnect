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
