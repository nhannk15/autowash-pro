package com.autowashpro.backend.exception;

public class VehicleInSlotConflictException extends RuntimeException {

    public VehicleInSlotConflictException(String message) {
        super(message);
    }
    
}
