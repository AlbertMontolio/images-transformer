# Image Processing Service

A Node.js/Express API that processes images stored in an input path and outputs the processed images to an output path:
- **categorization**, with machine learning model **mobilenet**, using **tensorflow.js**
- **object detection**, with machine learning model **coco-ssd**, using **tensorflow.js**
- **image transformation**, with **sharp** library for resizing, filter application and watermark addition .

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
- **Testing**: Jest with coverage
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

### CQRS Pattern
In order to allow app to scale, we use CQRS pattern. Worker is only responsible for orchestrating which handler to use. Handler is responsible for the actual processing of the image, whether it's categorization, object detection or transformation.
- **Command**: Send image to the queue
- **Query**: Get image from the queue

## Core Features

### Image Processing
- Resizing and optimization
- Metadata extraction
- Error handling and validation
- Apply watermark text
- Apply filters: blur, greyscale, tint, etc.

### Machine Learning Capabilities
- **Image Categorization**: MobileNet model for image classification
- **Object Detection**: COCO-SSD model for identifying objects
- **Batch Processing**: Efficient handling of multiple images

### Monitoring & Administration
- Bull Dashboard for queue monitoring
- Performance metrics collection
- Job status tracking
- Error logging and reporting

## API life-cycle
- user defines env variables for the input and output paths
- user hits endpoint /images/process
- image file names are read from the input path
- images are created in postgresql database so that we can track the status of the image
- while looping over the images, we send the images to the three queues: categorization, object detection and transformation in a batch manner.
- we use bull dashboard to monitor the queues
- corresponding worker consumes payload of the queue
- every worker registers the command bus and handler to delegate
- handler orchestrates the process of processing the image.
- handler calls the appropriate service to process the image.
- in the case of writing transformed image to the output path, we use sharp to write the image to the output path and a bulk writing system with batches to improve performance

## Missing Features

### Error handling
better error handling can be achieved, enriching the message and the ErrorTypes.

### Monitoring - logs
better monitoring can be achieved with datadog etc.

### Stats
better stats can be achieved, after understanding what business needs etc.

### Performance
better performance can be achieved, after expierincing with big amounts of images and finding bottlenecks.

### TODOs
the todos that are marked within the codebase could be added into jira tickets.

### Swagger
swagger documentation could be extended

### Webhook
webhook could be added to notify the client when the image is processed.
