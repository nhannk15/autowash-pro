package com.autowashpro.backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.autowashpro.backend.schedule.AvailableSlotScheduler;

@SpringBootApplication
@EnableScheduling
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

    @Bean
    CommandLineRunner commandLineRunner(AvailableSlotScheduler availableSlotScheduler) {
        return args -> {
            availableSlotScheduler.generateMoreSlots();
        };
    }

}
