# --- Build Stage ---
FROM maven:3.9.6-eclipse-temurin AS build

WORKDIR /app

# Copy files from the local build context
COPY backend/CyberKids/pom.xml .
COPY backend/CyberKids/src ./src

RUN mvn clean package -DskipTests

# --- Runtime Stage ---
FROM eclipse-temurin:21-jdk-alpine

WORKDIR /app

COPY --from=build /app/target/*.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
