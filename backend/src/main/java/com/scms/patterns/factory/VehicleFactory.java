package com.scms.patterns.factory;

public class VehicleFactory {
    public static Vehicle create(String type) {
        if (type.equalsIgnoreCase("car")) return new Car();
        if (type.equalsIgnoreCase("bike")) return new Bike();
        return null;
    }
}
