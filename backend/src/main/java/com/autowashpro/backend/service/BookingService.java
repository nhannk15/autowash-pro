package com.autowashpro.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.autowashpro.backend.model.entity.Booking;
import com.autowashpro.backend.repository.BookingRepository;

@Service
public class BookingService {
    
    private BookingRepository repository;

    public BookingService() {
    }

    public BookingService(BookingRepository repository) {
        this.repository = repository;
    }

    public Booking createNew(Booking booking) {
        return repository.save(booking);
    }

    public Booking findById(Long id) {
        return repository.findById(id).get();
    }

    public List<Booking> findAll() {
        return repository.findAll();
    }

    public Booking update(Booking booking) {
        return repository.save(booking);
    }

    public void delete(Long id) {
        Booking booking = findById(id);
        repository.delete(booking);
    }

}
