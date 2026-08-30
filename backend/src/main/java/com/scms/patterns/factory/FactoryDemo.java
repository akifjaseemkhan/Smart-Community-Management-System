package com.scms.patterns.factory;

class FactoryDemo {
    public static void main(String[] args) {
        Vehicle v = VehicleFactory.create("car");
        System.out.println("Vehicle: " + v.getType());
    }
}
