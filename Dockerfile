# ---------- build stage ----------
FROM gradle:8.8.0-jdk17 AS build
WORKDIR /home/gradle/project
COPY . .
RUN gradle --no-daemon clean bootJar

# ---------- run stage ----------
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /home/gradle/project/build/libs/*.jar app.jar
EXPOSE 4658
ENTRYPOINT ["java","-jar","/app/app.jar"]
