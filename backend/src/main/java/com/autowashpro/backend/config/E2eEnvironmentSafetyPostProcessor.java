package com.autowashpro.backend.config;

import java.util.Arrays;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.env.ConfigurableEnvironment;

/**
 * Fails before the application context (and Hibernate) starts when the E2E
 * profile points at a database that is not explicitly named as an E2E DB.
 */
public class E2eEnvironmentSafetyPostProcessor implements EnvironmentPostProcessor, Ordered {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        boolean e2eProfile = Arrays.stream(environment.getActiveProfiles())
                .anyMatch("e2e"::equalsIgnoreCase);
        if (!e2eProfile) {
            return;
        }

        String datasourceUrl = environment.getProperty("spring.datasource.url", "");
        if (!datasourceUrl.toLowerCase().contains("_e2e")) {
            throw new IllegalStateException(
                    "Refusing to start E2E profile: spring.datasource.url must target a database containing '_e2e'");
        }
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }
}
