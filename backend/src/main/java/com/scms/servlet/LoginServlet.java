package com.scms.servlet;

import com.scms.util.DBConnection;
import org.json.JSONObject;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.*;
import java.sql.*;

@WebServlet("/api/login")
public class LoginServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res)
            throws IOException {

        res.setContentType("application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");

        StringBuilder sb = new StringBuilder();
        try (BufferedReader reader = req.getReader()) {
            String line;
            while ((line = reader.readLine()) != null) sb.append(line);
        }

        JSONObject body = new JSONObject(sb.toString());
        String email    = body.optString("email", "").trim();
        String password = body.optString("password", "").trim();
        String role     = body.optString("role", "").trim();

        JSONObject response = new JSONObject();

        try (Connection conn = DBConnection.getConnection()) {
            String sql = "SELECT id, name, role, apartment FROM users WHERE email=? AND password=? AND role=?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, email);
            ps.setString(2, password);
            ps.setString(3, role);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                response.put("success", true);
                response.put("userId",    rs.getInt("id"));
                response.put("name",      rs.getString("name"));
                response.put("role",      rs.getString("role"));
                response.put("apartment", rs.getString("apartment") != null ? rs.getString("apartment") : "");
            } else {
                response.put("success", false);
                response.put("message", "Invalid email, password, or role.");
            }

        } catch (SQLException e) {
            res.setStatus(500);
            response.put("success", false);
            response.put("message", "Database error: " + e.getMessage());
        }

        res.getWriter().write(response.toString());
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
        res.setStatus(200);
    }
}
