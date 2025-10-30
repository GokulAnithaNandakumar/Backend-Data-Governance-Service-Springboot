# Use official OpenJDK 17 runtime as parent image
FROM openjdk:17-jdk-slim

# Set working directory in container
WORKDIR /app

# Copy the built jar file
COPY target/backend-data-governance-service-*.jar app.jar

# Expose port 8080
EXPOSE 8080

# Set environment variables
ENV SPRING_PROFILES_ACTIVE=docker
ENV MONGODB_URI=mongodb://mongo:27017/data_governance_db

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]