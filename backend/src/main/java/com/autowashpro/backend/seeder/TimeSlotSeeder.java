package com.autowashpro.backend.seeder;

import java.time.LocalTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.model.entity.TimeSlot;
import com.autowashpro.backend.repository.TimeSlotRepository;

@Component
@Order(13)
public class TimeSlotSeeder implements Seeder {
    
    private final int MAX_NUMBER_OF_SLOT_PER_DAY = 14;
    private final TimeSlotRepository timeSlotRepository;

    @Autowired
    public TimeSlotSeeder(TimeSlotRepository timeSlotRepository) {
        this.timeSlotRepository = timeSlotRepository;
    }

    @Override
    public void seed() {
        LocalTime time = LocalTime.of(7, 0);
        for (int numberOfSlot = 0; numberOfSlot < MAX_NUMBER_OF_SLOT_PER_DAY; numberOfSlot++) {
            TimeSlot timeSlot = new TimeSlot(null, time, time.plusHours(1L), true);
            timeSlotRepository.save(timeSlot);
            time = time.plusHours(1L);
        }
    }

}
