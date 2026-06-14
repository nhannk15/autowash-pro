package com.autowashpro.backend.seeder;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.model.entity.AvailableSlot;
import com.autowashpro.backend.model.entity.TimeSlot;
import com.autowashpro.backend.model.entity.WashBay;
import com.autowashpro.backend.repository.AvailableSlotRepository;
import com.autowashpro.backend.repository.TimeSlotRepository;
import com.autowashpro.backend.repository.WashBayRepository;

@Component
public class AvailableSlotSeeder {

    @Autowired
    private AvailableSlotRepository availableSlotRepository;

    @Autowired
    private WashBayRepository washBayRepository;

    @Autowired
    private TimeSlotRepository timeSlotRepository;

    private static final int MAX_WINDOW_DAY = 14;
    private static final int MAX_SLOT_PER_DAY = 14;
    private static final int MAX_NUMBER_OF_BAY = 5;

    public void seed() {

        List<TimeSlot> timeSlots = timeSlotRepository.findAll();
        List<WashBay> washBays = washBayRepository.findAll();
        LocalDate today = LocalDate.now();

        for (int day = 0; day < MAX_WINDOW_DAY; day++) {
            LocalDate date = today.plusDays(day);
            List<TimeSlot> slotsOfDay = getSlotsAccordingToDate(date, timeSlots);

            for (TimeSlot timeSlot: slotsOfDay) {
                for(WashBay washBay: washBays) {
                    AvailableSlot availableSlot = new AvailableSlot(null, date, null, timeSlot, washBay);
                    availableSlotRepository.save(availableSlot);
                }
            }
        }
    }

    private List<TimeSlot> getSlotsAccordingToDate(LocalDate date, List<TimeSlot> allSlots) {
        DayOfWeek day = date.getDayOfWeek();

        boolean isWeekend = day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY;
        if (isWeekend) {
            return allSlots;
        } else {
            return allSlots.stream()
                .filter(currentDate -> currentDate.getEndTime().getHour() <= 17)
                .toList();
        }
    }
}
