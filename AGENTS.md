# AGENTS.md

## Project

Container Registry & Tracking System (CRTS)

## Project Goal

Develop a centralized container registry and lifecycle tracking platform for managing container assets, movement history, surveys, repairs, maintenance, and operational status.

The system serves as a Single Source of Truth for all container-related information.

---

## Technology Stack

### Frontend

* Nuxt 3
* TypeScript
* Pinia
* Nuxt UI
* TailwindCSS
* VueUse

### Backend

* Nuxt 4 Server API (Nitro)
* Prisma ORM
* Session Authentication (`nuxt-auth-utils`)
* Zod Validation
* Layered Architecture (API → Service → Repository)

### Database

* Microsoft SQL Server

### Storage

* MinIO / S3 Compatible Storage

### Reporting

* QuestPDF
* Excel Export

---

## Architecture

Frontend (Nuxt 4)
↓
Nuxt Server API (Nitro)
↓
Prisma ORM
↓
SQL Server

External Systems
├── Container Survey System
├── QR Code Service
├── File Storage
└── Future GPS / RFID

---

## Development Principles

### Clean Architecture

Application
Domain
Infrastructure
Presentation

Never place business logic inside Controllers.

---

### Repository Pattern

Controllers
→ Services
→ Repositories
→ Database

---

### Naming Convention

Controllers
ContainerController

Services
ContainerService

Repositories
ContainerRepository

DTOs
CreateContainerRequest
ContainerResponse

Entities
Container
ContainerMovement
ContainerSurvey

---

## Coding Standards

### API Response

Success

{
"success": true,
"message": "Success",
"data": {}
}

Error

{
"success": false,
"message": "Validation Failed",
"errors": []
}

---

### Database Naming

Tables

tb_container
tb_container_event
tb_container_survey
tb_container_document

Primary Key

containerId

Audit Fields

createdBy
createdDate
updatedBy
updatedDate

---

## Security Rules

* JWT Authentication Required
* Role Based Authorization
* Validate all inputs
* Never trust client data
* Log all critical operations

Roles

Administrator
RegistryOfficer
SurveyTeam
Management

---

## AI Development Rules

Before generating code:

1. Read Design.md
2. Read Database Schema
3. Read Existing APIs
4. Follow Clean Architecture
5. Generate Production Ready Code

Never:

* Generate mock database code
* Generate fake repositories
* Hardcode IDs
* Skip validation

Always:

* Create DTOs
* Create Service Layer
* Create Repository Layer
* Create Unit Test Skeleton

---

## Git Workflow

main
develop
feature/*

Commit Format

feat:
fix:
refactor:
docs:
test:

Example

feat(container): add container registration module

---

## Definition Of Done

A task is complete when:

* Build succeeds
* No compilation errors
* Validation implemented
* Logging implemented
* API documented
* Database migration created
* Tested locally

---

## Future Phases

Phase 1

* Registry
* Profile
* Survey Integration
* QR Management
* Timeline
* Dashboard

Phase 2

* Repair Management
* Gate In/Out
* Workflow Approval
* Notification

Phase 3

* GPS Tracking
* RFID Tracking
* IoT Integration
* AI Analytics
