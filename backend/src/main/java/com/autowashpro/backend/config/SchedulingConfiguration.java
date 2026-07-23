package com.autowashpro.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Keeps background jobs out of automated test environments. Test fixtures must
 * control time-dependent state explicitly instead of racing scheduled jobs.
 */
@Configuration
@EnableScheduling
@Profile("!test & !e2e")
public class SchedulingConfiguration {
}
