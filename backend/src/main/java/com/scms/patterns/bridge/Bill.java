package com.scms.patterns.bridge;

public class Bill {
    private String service;
    private double amount;
    private PaymentMethod method;
    public Bill(String service, double amount, PaymentMethod method) {
        this.service = service; this.amount = amount; this.method = method;
    }
    public void pay() { method.pay(amount); }
}
