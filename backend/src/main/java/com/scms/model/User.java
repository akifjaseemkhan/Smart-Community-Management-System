package com.scms.model;

public class User {
    private int userId;
    private String name, email, password, role, phoneNumber;
    public User() {}
    public User(int userId, String name, String email, String password, String role, String phoneNumber) {
        this.userId = userId; this.name = name; this.email = email;
        this.password = password; this.role = role; this.phoneNumber = phoneNumber;
    }
    public int getUserId() { return userId; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String toString() { return "User[" + userId + ", " + name + ", " + role + "]"; }
}
