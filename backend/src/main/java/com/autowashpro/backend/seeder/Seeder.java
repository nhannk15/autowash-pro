package com.autowashpro.backend.seeder;

import org.springframework.transaction.annotation.Transactional;

public interface Seeder {
    
    @Transactional
    void seed(); 
    /**
     * Strategy Pattern plus Spring Auto-Injection for List of interfaces -->
     * Scalability for seeding data when initializing the Applications.
     */

}
