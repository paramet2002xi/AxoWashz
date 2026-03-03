package com.example.fanstatus.mqtt;

import com.example.fanstatus.dto.FanDtos;
import com.example.fanstatus.service.FanService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.integration.annotation.ServiceActivator;
import org.springframework.integration.channel.DirectChannel;
import org.springframework.integration.core.MessageProducer;
import org.springframework.integration.mqtt.core.DefaultMqttPahoClientFactory;
import org.springframework.integration.mqtt.core.MqttPahoClientFactory;
import org.springframework.integration.mqtt.inbound.MqttPahoMessageDrivenChannelAdapter;
import org.springframework.integration.mqtt.support.DefaultPahoMessageConverter;
import org.springframework.integration.mqtt.support.MqttHeaders;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageHandler;

import java.nio.charset.StandardCharsets;

@Configuration
public class MqttConfig {

    @Value("${app.mqtt.broker-url}")
    private String brokerUrl;

    @Value("${app.mqtt.client-id}")
    private String clientId;

    @Value("${app.mqtt.topic-update}")
    private String topicUpdate;

    @Value("${app.mqtt.topic-status}")
    private String topicStatus;

    @Bean
    public MqttPahoClientFactory mqttClientFactory() {
        DefaultMqttPahoClientFactory factory = new DefaultMqttPahoClientFactory();

        MqttConnectOptions options = new MqttConnectOptions();
        options.setServerURIs(new String[]{brokerUrl});
        options.setAutomaticReconnect(true);
        options.setCleanSession(true);

        factory.setConnectionOptions(options);
        return factory;
    }

    @Bean
    public MessageChannel mqttInputChannel() {
        return new DirectChannel();
    }

    @Bean
    public MessageProducer inbound(MqttPahoClientFactory factory) {
        // ✅ Subscribe 2 topics: fan/update (JSON) + fan/status (ON/OFF)
        MqttPahoMessageDrivenChannelAdapter adapter =
                new MqttPahoMessageDrivenChannelAdapter(
                        clientId + "-in",
                        factory,
                        topicUpdate,
                        topicStatus
                );

        adapter.setCompletionTimeout(5000);

        // ✅ Force payload as bytes แล้ว decode เองเป็น UTF-8
        DefaultPahoMessageConverter converter = new DefaultPahoMessageConverter();
        converter.setPayloadAsBytes(true);
        adapter.setConverter(converter);

        adapter.setQos(1);
        adapter.setOutputChannel(mqttInputChannel());
        return adapter;
    }

    @Bean
    @ServiceActivator(inputChannel = "mqttInputChannel")
    public MessageHandler mqttMessageHandler(ObjectMapper objectMapper, FanService fanService) {
        return message -> {
            String payload = "";
            String topic = "";
            try {
                topic = String.valueOf(message.getHeaders().get(MqttHeaders.RECEIVED_TOPIC));
                payload = toUtf8String(message).trim();

                System.out.println("MQTT topic=" + topic + " payload=" + payload);

                // ✅ fan/update = JSON -> parse + ingest
                if (topicUpdate.equals(topic)) {

                    // guard: ต้องเป็น JSON จริง
                    if (!(payload.startsWith("{") && payload.endsWith("}"))) {
                        System.out.println("MQTT ignored (update topic but non-JSON): " + payload);
                        return;
                    }

                    FanDtos.BoardStatusRequest req =
                            objectMapper.readValue(payload, FanDtos.BoardStatusRequest.class);

                    fanService.ingestBoardStatus(req);
                    System.out.println("MQTT ingest ok fan_id=" + req.fan_id());
                    return;
                }

                // ✅ fan/status = ON/OFF -> จะเก็บหรือ ignore ก็ได้
                if (topicStatus.equals(topic)) {
                    // ตัวอย่าง: แค่ log (หรือคุณจะทำ fanService.updateOnlineStatus(...) ก็ได้)
                    if ("ON".equalsIgnoreCase(payload) || "OFF".equalsIgnoreCase(payload)) {
                        System.out.println("MQTT status=" + payload);
                    } else {
                        System.out.println("MQTT ignored (status topic unknown payload): " + payload);
                    }
                    return;
                }

                // topic อื่นๆ
                System.out.println("MQTT ignored (unknown topic): " + topic);

            } catch (Exception e) {
                System.err.println("MQTT parse/ingest failed: " + e.getMessage());
                System.err.println("MQTT topic=" + topic);
                System.err.println("MQTT raw payload: " + payload);
                e.printStackTrace();
            }
        };
    }

    private String toUtf8String(Message<?> message) {
        Object p = message.getPayload();
        if (p == null) return "";

        if (p instanceof byte[] bytes) {
            return new String(bytes, StandardCharsets.UTF_8);
        }
        if (p instanceof String s) {
            return s;
        }
        return String.valueOf(p);
    }
}
