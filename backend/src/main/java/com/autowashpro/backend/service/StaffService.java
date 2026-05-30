package com.autowashpro.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.autowashpro.backend.model.entity.Staff;
import com.autowashpro.backend.repository.StaffRepository;

@Service
public class StaffService {
    
    private StaffRepository repository;

    public StaffService() {
    }

    public StaffService(StaffRepository repository) {
        this.repository = repository;
    }

    public Staff createNew(Staff staff) {
        return repository.save(staff);
    }

    public Staff findById(Long id) {
        return repository.findById(id).get();
    }

    public List<Staff> findAll() {
        return repository.findAll();
    }

    public Staff update(Staff staff) {
        return repository.save(staff);
    }

    public void delete(Long id) {
        Staff staff = findById(id);
        repository.delete(staff);
    }

}
