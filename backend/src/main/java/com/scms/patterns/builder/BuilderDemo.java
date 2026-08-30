package com.scms.patterns.builder;

class BuilderDemo {
    public static void main(String[] args) {
        Resident r = new Residentbuilder()
            .setName("Ali Raza")
            .setApartment("A-203")
            .setPhone("0300-1234567")
            .build();
        System.out.println(r);
    }
}
