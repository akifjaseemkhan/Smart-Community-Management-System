package com.scms.patterns.bridge;

class BridgeDemo {
    public static void main(String[] args) {
        Bill bill = new Bill("Maintenance", 5000, new CardPayment());
        bill.pay();
    }
}
