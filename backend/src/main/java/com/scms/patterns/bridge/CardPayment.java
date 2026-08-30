package com.scms.patterns.bridge;

public class CardPayment implements PaymentMethod {
    public void pay(double amount) {
        System.out.println("Paid Rs." + amount + " via Card");
    }
}
