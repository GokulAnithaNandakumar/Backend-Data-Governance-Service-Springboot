# Backend Data Governance Service

A comprehensive Spring Boot microservice for managing user profiles, preferences, and posts with robust data governance policies including soft deletion, hard deletion with grace periods, and complex business rule validation.

## Features

### Core Functionality
- **User Profile Management**: Create, read, update, and delete user profiles
- **User Preferences**: Manage user configuration settings and preferences
- **User Posts**: Create and manage user-generated content
- **Data Governance**: Comprehensive audit trails and data integrity checks

### Advanced Data Governance
- **Soft Deletion**: Mark entities as deleted while preserving data
- **Cascading Soft Deletion**: Automatic soft deletion of related entities
- **Hard Deletion**: Permanent data removal with grace period validation
- **Cascading Hard Deletion**: Complete removal of all related data
- **Audit Trails**: Detailed tracking of all operations

### Business Rules Implemented
1. **Data Completeness Validation**: Mandatory field validation
2. **Data Format Validation**: Email format and other field validations
3. **Role/Permission Validation**: User role requirements
4. **Uniqueness Checks**: Username and email uniqueness validation
5. **Soft Deletion Filtering**: Exclude soft-deleted entities from reads
6. **Timestamp Enforcement**: Automatic timestamp management
7. **Grace Period Validation**: 24-hour grace period for hard deletion
8. **Comprehensive Auditing**: Operation tracking and audit trails
9. **Post Creation Integrity**: Active user validation for post creation
10. **Preference Integrity**: User existence and status validation
11. **Cascading Soft Deletion**: Automatic cascading for user deletion
12. **Cascading Hard Deletion**: Complete data removal with cascading

## API Endpoints

### User Profile Management
- `POST /api/v1/users` - Create new user profile
- `GET /api/v1/users/{userId}` - Get user profile by ID
- `PUT /api/v1/users/{userId}` - Update user profile
- `DELETE /api/v1/users/{userId}` - Soft delete user profile
- `POST /api/v1/users/{userId}/purge` - Hard delete user profile (after grace period)

### User Preferences
- `PUT /api/v1/users/{userId}/preferences` - Update user preferences
- `GET /api/v1/users/{userId}/preferences` - Get user preferences

### User Posts
- `POST /api/v1/users/{userId}/posts` - Create new post
- `GET /api/v1/users/{userId}/posts` - Get all user posts
- `GET /api/v1/posts/{postId}` - Get post by ID
- `DELETE /api/v1/posts/{postId}` - Soft delete post

## Technology Stack

- **Java 17**: Latest LTS version
- **Spring Boot 3.5.7**: Latest Spring Boot version
- **Spring Data MongoDB**: For MongoDB integration
- **Spring Validation**: For request validation
- **MongoDB**: NoSQL database for flexible document storage
- **SpringDoc OpenAPI**: For API documentation (Swagger)
- **Lombok**: To reduce boilerplate code
- **Maven**: Build and dependency management
- **Docker**: Containerization support

## Quick Start

### Prerequisites
- Java 17 or later
- Docker and Docker Compose
- Maven (or use included Maven wrapper)

### Running with Docker Compose (Recommended)

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd backend-data-governance-service
   ```

2. **Configure MongoDB Atlas Connection**:
   ```bash
   # Copy the environment template
   cp .env.template .env

   # Edit .env file and update your MongoDB Atlas connection string
   nano .env
   ```

3. **Build the application**:
   ```bash
   ./mvnw clean package -DskipTests
   ```

4. **Start the services**:
   ```bash
   docker-compose up -d
   ```

5. **Access the application**:
   - **API**: http://localhost:8080/api/v1
   - **Swagger UI**: http://localhost:8080/api/v1/swagger-ui.html
   - **API Docs**: http://localhost:8080/api/v1/api-docs
   - **MongoDB Atlas Dashboard**: https://cloud.mongodb.com (for database management)

6. **Stop the services**:
   ```bash
   docker-compose down
   ```

### Running Locally

1. **Configure MongoDB Atlas Connection**:
   ```bash
   # Set environment variable for your Atlas connection
   export MONGODB_URI="mongodb+srv://your_username:your_password@cluster0.bdso00i.mongodb.net/data_governance_db?retryWrites=true&w=majority&appName=Cluster0"
   ```

2. **Run the application**:
   ```bash
   ./mvnw spring-boot:run
   ```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/data_governance_db` |
| `MONGODB_DATABASE` | MongoDB database name | `data_governance_db` |
| `GRACE_PERIOD_HOURS` | Hard delete grace period | `24` |
| `PORT` | Application port | `8080` |

### Application Properties

Key configuration options in `application.yml`:

```yaml
app:
  data-governance:
    hard-delete-grace-period-hours: 24
    audit:
      enabled: true
    validation:
      email-format: "^[A-Za-z0-9+_.-]+@([A-Za-z0-9.-]+\\.[A-Za-z]{2,})$"
```

## Data Model

### User Profile
```json
{
  "id": "string",
  "username": "string (unique)",
  "email": "string (unique, validated)",
  "firstName": "string",
  "lastName": "string",
  "roles": ["USER", "ADMIN", "MODERATOR", "GUEST"],
  "bio": "string",
  "profileImageUrl": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "deleted": "boolean",
  "deletedAt": "datetime",
  "auditTrail": []
}
```

### User Preferences
```json
{
  "id": "string",
  "userId": "string",
  "theme": "light|dark",
  "language": "string",
  "emailNotifications": "boolean",
  "pushNotifications": "boolean",
  "smsNotifications": "boolean",
  "profileVisible": "boolean",
  "showEmail": "boolean",
  "showLastSeen": "boolean",
  "contentFilter": "strict|moderate|off",
  "customSettings": {},
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### User Post
```json
{
  "id": "string",
  "userId": "string",
  "title": "string",
  "content": "string",
  "imageUrls": [],
  "tags": [],
  "isPublic": "boolean",
  "status": "DRAFT|PUBLISHED|ARCHIVED",
  "viewCount": "number",
  "likeCount": "number",
  "commentCount": "number",
  "createdAt": "datetime",
  "updatedAt": "datetime",
  "deleted": "boolean",
  "deletedAt": "datetime"
}
```

## Testing

### Run Unit Tests
```bash
./mvnw test
```

### Run Integration Tests
```bash
./mvnw verify
```

### Test Coverage
```bash
./mvnw jacoco:report
```

## API Usage Examples

### Create a User
```bash
curl -X POST http://localhost:8080/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["USER"],
    "bio": "Software Developer"
  }'
```

### Get User Profile
```bash
curl -X GET http://localhost:8080/api/v1/users/{userId}
```

### Update User Preferences
```bash
curl -X PUT http://localhost:8080/api/v1/users/{userId}/preferences \
  -H "Content-Type: application/json" \
  -d '{
    "theme": "dark",
    "emailNotifications": false,
    "language": "en"
  }'
```

### Create a Post
```bash
curl -X POST http://localhost:8080/api/v1/users/{userId}/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My First Post",
    "content": "This is the content of my first post.",
    "isPublic": true,
    "tags": ["introduction", "first-post"]
  }'
```

## Monitoring and Health Checks

- **Health Check**: `GET /api/v1/actuator/health`
- **Application Info**: `GET /api/v1/actuator/info`
- **Metrics**: `GET /api/v1/actuator/metrics`

## Business Logic Validation

### Soft Deletion Grace Period
- Users must be soft-deleted for 24 hours before hard deletion is allowed
- Hard deletion removes all associated preferences and posts permanently

### Cascading Operations
- **Soft Delete User**: Automatically soft deletes all user posts
- **Hard Delete User**: Permanently removes user, preferences, and all posts

### Data Integrity
- Username and email uniqueness validation
- Active user validation for post creation
- User existence validation for preference updates

## Security Considerations

- Input validation on all endpoints
- Email format validation with configurable regex
- Role-based access validation
- Comprehensive audit trails for compliance

## Production Considerations

### Scaling
- Stateless service design for horizontal scaling
- MongoDB sharding support
- Connection pooling configuration

### Monitoring
- Comprehensive logging with structured format
- Application metrics via Spring Actuator
- Health checks for dependencies

### Backup and Recovery
- MongoDB regular backups
- Audit trail preservation
- Grace period for data recovery

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes with tests
4. Ensure all tests pass
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.