package com.autowashpro.backend.model.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "staff")
public class Staff extends User {

    @Column(name = "hire_date", nullable = false)
    private LocalDate hireDate;

}
