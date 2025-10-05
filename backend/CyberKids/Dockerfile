# --- Build Stage ---
FROM maven:3.9.6-eclipse-temurin AS build

WORKDIR /app

# Copy project files
COPY backend/CyberKids/pom.xml .
COPY backend/CyberKids/src ./src

# Build the Spring Boot app (skip tests for faster build)
RUN mvn clean package -DskipTests

# --- Runtime Stage ---
FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/target/*.jar app.jar

# Default port for local testing
ENV PORT=8080
EXPOSE 8080

# Use Render's dynamic PORT when deployed
CMD ["sh", "-c", "java -jar app.jar --server.port=$PORT"]
