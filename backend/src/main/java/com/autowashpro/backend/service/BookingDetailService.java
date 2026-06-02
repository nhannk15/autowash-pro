package com.autowashpro.backend.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import com.autowashpro.backend.model.entity.BookingDetail;
import com.autowashpro.backend.repository.BookingDetailRepository;

@Service
public class BookingDetailService {

    private BookingDetailRepository repository;

    public BookingDetailService() {
    }

    @Autowired
    public BookingDetailService(BookingDetailRepository repository) {
        this.repository = repository;
    }

    public BookingDetail createNew(@NonNull BookingDetail bookingDetail) {
        return repository.save(bookingDetail);
    }

    public BookingDetail findById(@NonNull Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("BookingDetail not found with id: " + id));
    }

    public List<BookingDetail> findAll() {
        return repository.findAll();
    }

    public BookingDetail update(@NonNull BookingDetail bookingDetail) {
        return repository.save(bookingDetail);
    }

    public void delete(@NonNull Long id) {
        BookingDetail bookingDetail = findById(id);
        repository.delete(bookingDetail);
    }
}
