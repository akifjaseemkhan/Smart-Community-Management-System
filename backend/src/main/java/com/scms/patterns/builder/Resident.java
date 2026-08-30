package com.scms.patterns.builder;

public class Resident {
    private String name, apartment, phone;
    public Resident(String name, String apartment, String phone) {
        this.name = name; this.apartment = apartment; this.phone = phone;
    }
    public String toString() { return "Resident[" + name + ", " + apartment + ", " + phone + "]"; }
}
