package com.autowashpro.backend.service;

public class VehicleServiceTest {
    /**
     * Request properties must be validate before real logic test.
     * 
     * Test script:
     * 1. findAllVehicles():
     * - Repository has data --> return the mapped data.
     * - Respository has empty data --> return an empty list.
     * - Only admin can access this endpoint.
     * 
     * 2. findAllVehiclesForCustomer.
     * - Email exists, cars exist --> return the customer's vehicle list mapped to DTO.
     * - Email exits, no cars --> return an empty list of car mapped to DTO.
     * - Email not exists --> throw UserNotFoundException.
     * 
     * 3. createNew().
     * - licensePlate not exists --> save successfully, return saved vehicle.
     * - licensePlate exists --> throw IllegalArgumentException.
     * 
     * 4. addNewVehicleForCustomer().
     * - email valid, vehicleTypeId valid, licensePlate not exist --> return VehicleResponse.
     * - licensePlate exists --> throw new IllegalArgumentException.
     * - email not exists --> throw new UserNotFoundException.
     * 
     * 5. deleteMyCar().
     * - vehicle exists and belongs to that current using customer --> verify.
     * - vehicle doesn't belong to that current using customer --> throw new VehicleNotFoundException.
     * - vehicle doesn't exist --> throw now VehicleNotFoundException.
     * 
     * 6. updateMyCar().
     * - vehicle exists and belongs to that current using customer --> verify.
     * - vehicle doesn't belong to that current using customer --> throw new VehicleNotFoundException.
     * - vehicle doesn't exist --> throw now VehicleNotFoundException.
     * - vehicleType doesn't --> throw new VehicleTypeNotFoundException.
     * - licensePlate duplicated --> throw new VehicleNotFoundException.
     */
    
}
