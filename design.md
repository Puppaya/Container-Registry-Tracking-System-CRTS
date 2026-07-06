# DESIGN.md

# Container Registry & Tracking System (CRTS)

## System Overview

CRTS is a centralized platform for container asset registration, lifecycle tracking, survey integration, and operational monitoring.

Primary Objective:

Provide complete visibility of every container throughout its lifecycle.

---

# Functional Modules

## Module 1 - Container Registry

### Purpose

Manage master data of containers.

### Features

* Register Container
* Edit Container
* Activate Container
* Deactivate Container
* Duplicate Validation
* Check Digit Validation
* QR Code Generation

### Data Fields

Container Number
ISO Type
Container Size
Container Category
Owner
Manufacturer
Year Built
Registration Date
Current Status

---

## Module 2 - Container Profile

### Purpose

Single page containing complete information of a container.

### Sections

#### General Information

Container Details

#### Current Status

Current Operational Status

#### Survey Summary

Latest Survey Information

#### Movement Summary

Recent Movements

#### Documents

Attached Files

#### Timeline

Historical Events

---

## Module 3 - Lifecycle Tracking

### Purpose

Track all events occurring to a container.

### Event Types

Registration
Survey
Repair
Maintenance
Relocation
Gate In
Gate Out
Status Change

### Timeline Example

2026-01-01 Registered

2026-01-05 Survey Completed

2026-01-10 Repair Requested

2026-01-15 Repair Completed

2026-01-20 Gate Out

---

## Module 4 - Survey Integration

### Purpose

Connect CRTS with existing Survey System.

### Imported Data

Survey Result
Survey Date
Inspector
Damage Summary
Survey Images
Survey Report

### Integration Type

REST API

Sync Schedule

Real-time Preferred

Fallback Every 15 Minutes

---

## Module 5 - Search & Tracking

### Search Filters

Container Number
Owner
Container Type
Status
Survey Status
Registration Date

### Search Modes

Quick Search
Advanced Search
QR Scan Search

---

## Module 6 - Dashboard & Reporting

### Dashboard Widgets

Total Containers

Active Containers

Inactive Containers

Surveyed Containers

Containers Requiring Attention

Recent Activities

### Reports

Container Registry Report

Container Lifecycle Report

Survey Coverage Report

Status Summary Report

### Export

Excel

PDF

---

# Database Design

## tb_container

containerId PK

containerNumber

isoType

containerSize

containerCategory

owner

manufacturer

yearBuilt

registrationDate

status

qrCode

createdBy

createdDate

updatedBy

updatedDate

---

## tb_container_event

eventId PK

containerId FK

eventType

eventDescription

eventDate

createdBy

createdDate

---

## tb_container_survey

surveyId PK

containerId FK

surveyReferenceNo

surveyDate

inspector

result

damageSummary

reportUrl

createdDate

---

## tb_container_document

documentId PK

containerId FK

documentType

fileName

fileUrl

uploadedBy

uploadedDate

---

# API Design

## Container APIs

POST
/api/containers

GET
/api/containers

GET
/api/containers/{id}

PUT
/api/containers/{id}

DELETE
/api/containers/{id}

---

## Timeline APIs

GET
/api/containers/{id}/timeline

POST
/api/containers/{id}/events

---

## Survey APIs

GET
/api/containers/{id}/surveys

POST
/api/survey/sync

---

## Dashboard APIs

GET
/api/dashboard/summary

GET
/api/dashboard/recent-activities

---

# User Roles

## Administrator

User Management
Permission Management
Configuration

## Registry Officer

Register Container
Update Container
Status Management

## Survey Team

View Registry
Access Survey History

## Management

Dashboard
Reports
Analytics

---

# Non Functional Requirements

### Performance

Search Response

< 2 seconds

Dashboard Loading

< 3 seconds

---

### Security

JWT Authentication

Role Based Access Control

Audit Logging

Input Validation

---

### Scalability

Support

100,000+ Containers

1,000,000+ Events

Multi Branch Expansion

---

# MVP Scope

Container Registry

Container Profile

Survey Integration

QR Code Management

Lifecycle Timeline

Dashboard

Estimated Duration

4-8 Weeks
