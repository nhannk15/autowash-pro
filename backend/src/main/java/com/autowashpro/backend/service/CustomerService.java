package com.autowashpro.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.autowashpro.backend.model.entity.Customer;
import com.autowashpro.backend.repository.CustomerRepository;

@Service
public class CustomerService {
    
    private CustomerRepository repository;

    public CustomerService() {
    }

    @org.springframework.beans.factory.annotation.Autowired
    public CustomerService(CustomerRepository repository) {
        this.repository = repository;
    }

    public Customer createNew(Customer customer) {
        return repository.save(customer);
    }

    public Customer findById(Long id) {
        return repository.findById(id).get();
    }

    public List<Customer> findAll() {
        return repository.findAll();
    }

    public Customer update(Customer customer) {
        return repository.save(customer);
    }

    public void delete(Long id) {
        Customer customer = findById(id);
        repository.delete(customer);
    }

}
