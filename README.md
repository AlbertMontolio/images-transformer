# Image Processing Service

A Node.js/Express microservice that processes images using machine learning for categorization and object detection, with queue-based processing for scalability.

## Table of Contents
- [Technical Overview](#technical-overview)
- [Architecture](#architecture)
- [Core Features](#core-features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Development](#development)
- [Performance & Scalability](#performance--scalability)
- [Security](#security)

## Technical Overview

### Tech Stack
- **Runtime**: Node.js v22.12.0
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Queue System**: BullMQ with Redis
- **ML Models**: TensorFlow.js (MobileNet, COCO-SSD)
- **Image Processing**: Sharp
- **Containerization**: Docker & Docker Compose
- **Testing**: Jest with Istanbul for coverage
- **Dependency Injection**: TSyringe
- **Type Safety**: TypeScript

## Architecture

### Clean Architecture Implementation
The project follows Clean Architecture principles with clear separation of concerns:

1. **Domain Layer**
   - Contains business logic and domain entities
   - Technology-agnostic
   - No dependencies on external frameworks

2. **Application Layer**
   - Use cases implementation
   - Orchestrates domain objects
   - Contains application-specific business rules

3. **Infrastructure Layer**
   - External interfaces (REST API, queues)
   - Database implementations
   - Framework-specific code
   - Third-party services integration

### Queue-Based Processing
- **BullMQ Workers**: Distributed processing of image operations
- **Queue Types**:
  - Image Categorization Queue
  - Image Transformation Queue
  - Object Detection Queue
- **Redis Backend**: Reliable message broker for queue management

## Core Features

### Image Processing
- Image format conversion (JPEG, PNG, WebP)
- Resizing and optimization
- Metadata extraction
- Error handling and validation

### Machine Learning Capabilities
- **Image Categorization**: MobileNet model for image classification
- **Object Detection**: COCO-SSD model for identifying objects
- **Batch Processing**: Efficient handling of multiple images

### Monitoring & Administration
- Bull Dashboard for queue monitoring
- Performance metrics collection
- Job status tracking
- Error logging and reporting

## Project Structure
