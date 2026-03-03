# MQTT Broker (Eclipse Mosquitto) สำหรับ deploy บน Railway
FROM eclipse-mosquitto:2
COPY mosquitto/mosquitto.conf /mosquitto/config/mosquitto.conf
EXPOSE 1883
CMD ["/usr/sbin/mosquitto", "-c", "/mosquitto/config/mosquitto.conf"]
