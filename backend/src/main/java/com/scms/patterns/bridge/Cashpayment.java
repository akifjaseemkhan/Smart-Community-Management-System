package com.scms.patterns.bridge;

public class Cashpayment implements PaymentMethod {
    public void pay(double amount) {
        System.out.println("Paid Rs." + amount + " via Cash");
    }
}
