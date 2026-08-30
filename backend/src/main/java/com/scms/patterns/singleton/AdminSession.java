package com.scms.patterns.singleton;

public class AdminSession {
    private static AdminSession instance;
    private String adminName;
    private AdminSession() { this.adminName = "Admin"; }
    public static AdminSession getInstance() {
        if (instance == null) instance = new AdminSession();
        return instance;
    }
    public String getAdminName() { return adminName; }
}
