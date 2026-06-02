package com.autowashpro.backend.model.entity;

import java.time.LocalDate;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@Entity
@Table(name = "staff")
public class Staff extends User {

    @Column(name = "hired_date", nullable = false)
    private LocalDate hiredDate;

    @OneToMany(mappedBy = "staff")
    private List<WashSession> washSessions;

    @OneToMany(mappedBy = "staff")
    private List<Promotion> promotions;

    @OneToMany(mappedBy = "staff")
    private List<PointTransaction> pointTransactions;
}
