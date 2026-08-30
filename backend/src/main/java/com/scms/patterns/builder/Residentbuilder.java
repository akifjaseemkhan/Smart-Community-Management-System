package com.scms.patterns.builder;

public class Residentbuilder {
    private String name, apartment, phone;
    public Residentbuilder setName(String name) { this.name = name; return this; }
    public Residentbuilder setApartment(String apartment) { this.apartment = apartment; return this; }
    public Residentbuilder setPhone(String phone) { this.phone = phone; return this; }
    public Resident build() { return new Resident(name, apartment, phone); }
}
