package com.scms.util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

/**
 * Central JDBC connection factory.
 *
 * Values are read from environment variables when present, so the app can be
 * deployed without editing source. Falls back to a local XAMPP/MySQL setup.
 *
 *   SCMS_DB_URL       (default: jdbc:mysql://localhost:3306/scms_db?useSSL=false&serverTimezone=UTC)
 *   SCMS_DB_USER      (default: root)
 *   SCMS_DB_PASSWORD  (default: empty)
 */
public class DBConnection {

    private static final String URL = env("SCMS_DB_URL",
            "jdbc:mysql://localhost:3306/scms_db?useSSL=false&serverTimezone=UTC");
    private static final String USER = env("SCMS_DB_USER", "root");
    private static final String PASSWORD = env("SCMS_DB_PASSWORD", "");

    static {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("MySQL JDBC Driver not found!", e);
        }
    }

    private DBConnection() { }

    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }

    private static String env(String key, String fallback) {
        String v = System.getenv(key);
        return (v != null && !v.isBlank()) ? v : fallback;
    }
}
