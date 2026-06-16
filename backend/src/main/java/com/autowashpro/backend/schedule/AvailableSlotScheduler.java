package com.autowashpro.backend.schedule;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.model.entity.AvailableSlot;
import com.autowashpro.backend.model.entity.TimeSlot;
import com.autowashpro.backend.model.entity.WashBay;
import com.autowashpro.backend.repository.AvailableSlotRepository;
import com.autowashpro.backend.repository.TimeSlotRepository;
import com.autowashpro.backend.repository.WashBayRepository;

@Component
public class AvailableSlotScheduler {

    private final AvailableSlotRepository availableSlotRepository;
    private final WashBayRepository washBayRepository;
    private final TimeSlotRepository timeSlotRepository;

    @Autowired
    public AvailableSlotScheduler(AvailableSlotRepository availableSlotRepository, WashBayRepository washBayRepository,
            TimeSlotRepository timeSlotRepository) {
        this.availableSlotRepository = availableSlotRepository;
        this.washBayRepository = washBayRepository;
        this.timeSlotRepository = timeSlotRepository;
    }

    private static final int MAX_WINDOW_DAY = 14;
    private static final int MAX_SLOT_PER_DAY = 14;
    private static final int MAX_NUMBER_OF_BAY = 5;

    @Scheduled(cron = "0 0 0 * * *")
    public void generateNextSlotsForThatNextDay() {

        LocalDate thatNextDay = LocalDate.now().plusDays(MAX_WINDOW_DAY);

        if (availableSlotRepository.existsBySlotDate(thatNextDay))
            return;

        List<TimeSlot> timeSlots = timeSlotRepository.findAll();
        List<WashBay> washBays = washBayRepository.findAll();

        List<TimeSlot> slotsOfDay = getSlotsAccordingToDate(thatNextDay, timeSlots);

        for (TimeSlot timeSlot : slotsOfDay) {
            for (WashBay washBay : washBays) {
                AvailableSlot availableSlot = new AvailableSlot(null, thatNextDay, null, timeSlot, washBay);
                availableSlotRepository.save(availableSlot);
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
