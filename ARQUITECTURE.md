graph TB
    subgraph "API Gateway"
        API[Express API]
        ROUTES["/images/process"]
    end

    subgraph "Image Processing Pipeline"
        direction TB
        PROCESS[ProcessImagesUseCase]
        READ[ReadImagesNamesUseCase]
        CREATE_DB[CreateImagesInDbUseCase]
    end

    subgraph "Queue System"
        Q1[Categorization Queue]
        Q2[Transformation Queue]
        Q3[Detection Queue]
        W1[Categorization Worker]
        W2[Transformation Worker]
        W3[Detection Worker]
    end

    subgraph "Storage"
        DB[(PostgreSQL)]
        FS[File System]
    end

    %% Flow of data
    API --> ROUTES
    ROUTES --> PROCESS
    PROCESS --> READ
    READ --> FS
    PROCESS --> CREATE_DB
    CREATE_DB --> DB
    
    PROCESS --> Q1
    PROCESS --> Q2
    PROCESS --> Q3
    
    Q1 --> W1
    Q2 --> W2
    Q3 --> W3
    
    W1 --> DB
    W2 --> DB
    W3 --> DB
    
    W1 --> FS
    W2 --> FS
    W3 --> FS

    %% Styles
    classDef primary fill:#2374ab,stroke:#2374ab,stroke-width:2px,color:#fff
    classDef queue fill:#ff7e67,stroke:#ff7e67,stroke-width:2px,color:#fff
    classDef storage fill:#95b8d1,stroke:#95b8d1,stroke-width:2px,color:#fff
    
    class API,ROUTES,PROCESS primary
    class Q1,Q2,Q3,W1,W2,W3 queue
    class DB,FS storage


# Image Processing System Architecture

## Overview
The system processes images through multiple stages using a queue-based architecture to handle operations asynchronously and ensure scalability.

## Key Components

### 1. API Gateway
- **Express API Server**: Entry point for HTTP requests
- **Routes**: 
  - `/images/process`: Triggers image processing pipeline
  - `/images`: Retrieves processed images
  - `/admin/queues`: Queue monitoring dashboard

### 2. Image Processing Pipeline
- **Process Images Use Case**: Orchestrates the entire process
- **Read Images Use Case**: Handles file system operations
- **Create Images in DB Use Case**: Manages database records

### 3. Queue System
Three parallel queues handle different aspects of image processing:
- **Categorization Queue**: Image classification using MobileNet
- **Transformation Queue**: Image modifications (resize, format conversion)
- **Detection Queue**: Object detection using COCO-SSD

### 4. Storage
- **PostgreSQL Database**: Stores image metadata and processing results
- **File System**: Stores original and processed images

## Data Flow

1. Client sends request to `/images/process`
2. ProcessImagesUseCase:
   - Reads images from input directory
   - Creates database records
   - Distributes work to queues

3. Queue Workers:
   - Process images asynchronously
   - Update database with results
   - Save processed images to file system

## Technical Implementation

- **Language**: TypeScript/Node.js
- **Framework**: Express.js
- **Queue System**: BullMQ with Redis
- **ORM**: Prisma
- **ML Models**: TensorFlow.js (MobileNet, COCO-SSD)
- **Image Processing**: Sharp

