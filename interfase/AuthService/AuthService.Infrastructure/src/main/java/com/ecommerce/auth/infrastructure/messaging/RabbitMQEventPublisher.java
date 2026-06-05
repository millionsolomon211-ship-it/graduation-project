package com.ecommerce.auth.infrastructure.messaging;

import com.ecommerce.auth.application.ports.EventPublisher;
import com.ecommerce.shared.messaging.event.BaseEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RabbitMQEventPublisher implements EventPublisher {

    private final RabbitTemplate rabbitTemplate;
    private static final String EXCHANGE = "app.exchange";

    @Override
    public void publish(BaseEvent event) {
        String routingKey = getRoutingKey(event);
        rabbitTemplate.convertAndSend(EXCHANGE, routingKey, event);
    }

    private String getRoutingKey(BaseEvent event) {
        // Simple mapping logic based on class name or property
        if (event instanceof com.ecommerce.shared.messaging.event.UserRegisteredEvent) return "user.registered";
        if (event instanceof com.ecommerce.shared.messaging.event.UserLoggedInEvent) return "user.logged_in";
        // Add other mappings as needed
        return "default.key";
    }
}
