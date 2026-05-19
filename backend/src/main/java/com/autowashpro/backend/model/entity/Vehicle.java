package com.autowashpro.backend.model.entity;

import java.time.LocalDateTime;

public class Vehicle {
    private Long id;
    private Long customerId;
    private String licensePlate;
    private String brand;
    private String model;
    private String color;
    private String type; // new (sedan, SUV, van, truck, etc)
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt; // new
}
