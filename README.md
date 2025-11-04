# Backend Data Governance Service

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.7-green)
![Java](https://img.shields.io/badge/Java-17-orange)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Maven](https://img.shields.io/badge/Maven-4.0.0-blue)
![Docker](https://img.shields.io/badge/Docker-Compose-blue)

A comprehensive Spring Boot microservice providing robust data governance capabilities for user profiles, preferences, and posts management with MongoDB Atlas integration.

## 🚀 Features

### Core Functional Requirements (FR1-FR10)

**User Profile Management (FR1-FR5)**
- ✅ **FR1**: Create user profiles with validation and conflict detection
- ✅ **FR2**: Retrieve user profiles with role-based access
- ✅ **FR3**: Update user profiles with business rule enforcement
- ✅ **FR4**: Soft delete with configurable grace period (24 hours default)
- ✅ **FR5**: Hard delete with grace period validation and cascading cleanup

**User Preferences Management (FR6-FR7)**
- ✅ **FR6**: Update user preferences with profile verification
- ✅ **FR7**: Retrieve preferences with default fallback values

**User Posts Management (FR8-FR10)**
- ✅ **FR8**: Create posts with author validation
- ✅ **FR9**: Retrieve posts by user with profile verification
- ✅ **FR10**: Soft delete posts with acknowledgment responses

### Technical Features

- 🔒 **Data Validation**: Comprehensive input validation using Bean Validation
- 🏗️ **Clean Architecture**: Service-Repository pattern with clear separation of concerns
- 📊 **MongoDB Integration**: Native Spring Data MongoDB with Atlas cloud support
- 🔄 **Soft Delete Pattern**: Graceful data lifecycle management
- 📝 **Comprehensive Testing**: 46 unit tests with 100% success rate
- 🐳 **Containerization**: Docker and Docker Compose support
- 📋 **API Documentation**: RESTful endpoints with proper HTTP status codes
- ⚡ **Performance Monitoring**: Spring Boot Actuator integration
- 🎯 **Business Rule Engine**: Configurable grace periods and validation rules

## 🏗️ Architecture

```
├── Backend Data Governance Service
│   ├── Controllers (REST API Layer)
│   │   ├── UserProfileController
│   │   ├── UserPreferencesController
│   │   └── UserPostController
│   ├── Services (Business Logic Layer)
│   │   ├── UserProfileService
│   │   ├── UserPreferencesService
│   │   └── UserPostService
│   ├── Repositories (Data Access Layer)
│   │   ├── UserProfileRepository
│   │   ├── UserPreferencesRepository
│   │   └── UserPostRepository
│   ├── Documents (MongoDB Entities)
│   │   ├── UserProfile
│   │   ├── UserPreferences
│   │   └── UserPost
│   ├── DTOs (Data Transfer Objects)
│   │   ├── Request DTOs
│   │   └── Response DTOs
│   └── Exception Handling
│       ├── GlobalExceptionHandler
│       └── Custom Exceptions
```

## 📋 Prerequisites

- **Java 17** or higher
- **Maven 3.6+**
- **MongoDB Atlas** account (or local MongoDB instance)
- **Docker** (optional, for containerized deployment)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/GokulAnithaNandakumar/Backend-Data-Governance-Service-Springboot.git
cd Backend-Data-Governance-Service-Springboot/backend-data-governance-service
```

### 2. Configure MongoDB Connection

Create an `application-local.properties` file:

```properties
# MongoDB Configuration
spring.data.mongodb.uri=mongodb+srv://username:password@cluster.mongodb.net/data_governance_db
spring.data.mongodb.database=data_governance_db

# Application Configuration
app.data-governance.hard-delete-grace-period-hours=24

# Logging Configuration
logging.level.com.datagovernance=DEBUG
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %msg%n
```

### 3. Build and Run

#### Option A: Maven (Local Development)

```bash
# Clean and compile
./mvnw clean compile

# Run tests
./mvnw test

# Start the application
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

#### Option B: Docker Compose (Production-like)

```bash
# Update MongoDB URI in docker-compose.yml
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f app
```

### 4. Verify Installation

```bash
# Health check
curl http://localhost:8080/actuator/health

# API test
curl http://localhost:8080/api/v1/profiles
```

## 📚 API Documentation

### User Profile Endpoints

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| `POST` | `/api/v1/profiles` | Create user profile | `201`, `400`, `409` |
| `GET` | `/api/v1/profiles/{userId}` | Get user profile | `200`, `404` |
| `PUT` | `/api/v1/profiles/{userId}` | Update user profile | `200`, `400`, `404` |
| `DELETE` | `/api/v1/profiles/{userId}` | Soft delete profile | `200`, `404` |
| `DELETE` | `/api/v1/profiles/{userId}/hard` | Hard delete profile | `200`, `403`, `404` |

### User Preferences Endpoints

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| `PUT` | `/api/v1/preferences/{userId}` | Update preferences | `200`, `400`, `404` |
| `GET` | `/api/v1/preferences/{userId}` | Get preferences | `200`, `404` |

### User Posts Endpoints

| Method | Endpoint | Description | Status Codes |
|--------|----------|-------------|--------------|
| `POST` | `/api/v1/posts` | Create post | `201`, `400`, `404` |
| `GET` | `/api/v1/posts/user/{userId}` | Get user posts | `200`, `404` |
| `DELETE` | `/api/v1/posts/{postId}` | Soft delete post | `200`, `404` |

### Example API Calls

#### Create User Profile
```bash
curl -X POST http://localhost:8080/api/v1/profiles \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["USER"]
  }'
```

#### Create Post
```bash
curl -X POST http://localhost:8080/api/v1/posts \
  -H "Content-Type: application/json" \
  -d '{
    "authorId": "user123",
    "title": "My First Post",
    "content": "This is the content of my first post"
  }'
```

## 🧪 Testing

The project includes comprehensive testing with **46 unit tests** covering all functional requirements:

### Run Tests

```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=UserProfileServiceTest

# Run with coverage (if configured)
./mvnw test jacoco:report
```

### Test Coverage

- **UserProfileServiceTest**: 16 tests covering FR1-FR5
- **UserPreferencesServiceTest**: 13 tests covering FR6-FR7
- **UserPostServiceTest**: 14 tests covering FR8-FR10
- **Integration Tests**: 3 basic integration tests

### Key Test Scenarios

- ✅ Profile creation with validation
- ✅ Duplicate email/userId detection
- ✅ Grace period enforcement
- ✅ Cascading delete operations
- ✅ Default preferences handling
- ✅ Business rule violations
- ✅ Error handling and exceptions

## 🔧 Configuration

### Application Properties

```properties
# Server Configuration
server.port=8080

# MongoDB Configuration
spring.data.mongodb.uri=${MONGODB_URI:mongodb://localhost:27017}
spring.data.mongodb.database=${MONGODB_DATABASE:data_governance_db}

# Business Rules
app.data-governance.hard-delete-grace-period-hours=${GRACE_PERIOD_HOURS:24}

# Actuator Configuration
management.endpoints.web.exposure.include=health,info,metrics
management.endpoint.health.show-details=when-authorized
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017` |
| `MONGODB_DATABASE` | Database name | `data_governance_db` |
| `GRACE_PERIOD_HOURS` | Hard delete grace period | `24` |
| `SPRING_PROFILES_ACTIVE` | Active Spring profile | `default` |

## 🐳 Docker Deployment

### Build Image

```bash
# Build application JAR
./mvnw clean package -DskipTests

# Build Docker image
docker build -t data-governance-service .
```

### Run with Docker Compose

```bash
# Start services
docker-compose up -d

# Scale application (if needed)
docker-compose up -d --scale app=3

# Stop services
docker-compose down
```

## 📊 Monitoring and Health Checks

### Actuator Endpoints

- **Health**: `GET /actuator/health`
- **Info**: `GET /actuator/info`
- **Metrics**: `GET /actuator/metrics`

### Application Logs

```bash
# View application logs
docker-compose logs -f app

# Local development logs
tail -f logs/application.log
```

## 🔒 Security Considerations

- Input validation on all endpoints
- MongoDB injection prevention
- Proper error message handling
- Secure default configurations
- Environment variable usage for sensitive data

## 🚀 Performance Optimization

- MongoDB indexing on frequently queried fields
- Lazy loading for related entities
- Connection pooling configuration
- Caching strategies for preferences
- Pagination for large result sets
