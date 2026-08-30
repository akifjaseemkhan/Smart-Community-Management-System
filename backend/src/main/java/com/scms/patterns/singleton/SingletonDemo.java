package com.scms.patterns.singleton;

class SingletonDemo {
    public static void main(String[] args) {
        AdminSession s = AdminSession.getInstance();
        System.out.println("Admin: " + s.getAdminName());
    }
}
