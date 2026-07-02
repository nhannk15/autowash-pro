package com.autowashpro.backend.seeder;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.autowashpro.backend.model.entity.AvailableSlot;
import com.autowashpro.backend.model.entity.TimeSlot;
import com.autowashpro.backend.model.entity.WashBay;
import com.autowashpro.backend.repository.AvailableSlotRepository;
import com.autowashpro.backend.repository.TimeSlotRepository;
import com.autowashpro.backend.repository.WashBayRepository;

import lombok.extern.slf4j.Slf4j;

@Component
@Order(14)
@Slf4j
public class AvailableSlotSeeder implements Seeder {

    private final AvailableSlotRepository availableSlotRepository;

    private final WashBayRepository washBayRepository;

    private final TimeSlotRepository timeSlotRepository;

    private static final int MAX_WINDOW_DAY = 14;
    private static final int MAX_SLOT_PER_DAY = 14;
    private static final int MAX_NUMBER_OF_BAY = 5;

    @Autowired
    public AvailableSlotSeeder(AvailableSlotRepository availableSlotRepository, WashBayRepository washBayRepository, TimeSlotRepository timeSlotRepository) {
        this.availableSlotRepository = availableSlotRepository;
        this.washBayRepository = washBayRepository;
        this.timeSlotRepository = timeSlotRepository;
    }

    @Override
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

    public void seedNewSlots() {
        List<TimeSlot> timeSlots = timeSlotRepository.findAll();
        List<WashBay> washBays = washBayRepository.findAll();

        AvailableSlot lastAvailableSlot = availableSlotRepository.findAll().getLast();
        LocalDate lastDate = lastAvailableSlot.getSlotDate();
        long days = ChronoUnit.DAYS.between(LocalDate.now(), lastDate);
        long moreDaysWeNeed = MAX_WINDOW_DAY - days;
        for (long dayToAdd = 0L; dayToAdd < moreDaysWeNeed; dayToAdd++) {
            lastDate = lastDate.plusDays(1L);
            log.info("seedNewSlots() - Adding availableSlots for day: {}", lastDate);
            List<TimeSlot> slotsOfDay = getSlotsAccordingToDate(lastDate, timeSlots);
            for (TimeSlot timeSlot: slotsOfDay) {
                for(WashBay washBay: washBays) {
                    AvailableSlot availableSlot = new AvailableSlot(null, lastDate, null, timeSlot, washBay);
                    availableSlotRepository.save(availableSlot);
                }
            }
        }
    }

    public void deleteUnusedSlotsInThePast() {
        LocalDate yesterday = LocalDate.now().minusDays(1L);
        List<AvailableSlot> unusedSlots = availableSlotRepository.findSlotsInThePastAndBookingIdIsNull(yesterday);
        log.info("deleteUnusedSlotsInThePast() - Start deleting {} unused slots", unusedSlots.size());
        availableSlotRepository.deleteAll(unusedSlots);
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
