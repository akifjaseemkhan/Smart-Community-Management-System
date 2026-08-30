package com.scms.servlet;

import com.scms.util.DBConnection;
import org.json.JSONArray;
import org.json.JSONObject;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.*;
import java.sql.*;

@WebServlet("/api/users")
public class UserServlet extends HttpServlet {

    private void setCors(HttpServletResponse res) {
        res.setContentType("application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        setCors(res);
        JSONArray arr = new JSONArray();
        try (Connection conn = DBConnection.getConnection()) {
            String sql = "SELECT id, name, email, role, phone, apartment, created_at FROM users ORDER BY created_at DESC";
            ResultSet rs = conn.createStatement().executeQuery(sql);
            while (rs.next()) {
                JSONObject obj = new JSONObject();
                obj.put("id",         rs.getInt("id"));
                obj.put("name",       rs.getString("name"));
                obj.put("email",      rs.getString("email"));
                obj.put("role",       rs.getString("role"));
                obj.put("phone",      rs.getString("phone") != null ? rs.getString("phone") : "");
                obj.put("apartment",  rs.getString("apartment") != null ? rs.getString("apartment") : "");
                obj.put("created_at", rs.getString("created_at"));
                arr.put(obj);
            }
        } catch (SQLException e) {
            res.setStatus(500);
            res.getWriter().write("{\"error\":\"" + e.getMessage() + "\"}");
            return;
        }
        res.getWriter().write(arr.toString());
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        setCors(res);
        StringBuilder sb = new StringBuilder();
        try (BufferedReader r = req.getReader()) {
            String line; while ((line = r.readLine()) != null) sb.append(line);
        }
        JSONObject body = new JSONObject(sb.toString());
        JSONObject response = new JSONObject();

        try (Connection conn = DBConnection.getConnection()) {
            // Check if email already exists
            PreparedStatement check = conn.prepareStatement("SELECT id FROM users WHERE email=?");
            check.setString(1, body.optString("email"));
            if (check.executeQuery().next()) {
                response.put("success", false);
                response.put("message", "Email already exists.");
                res.getWriter().write(response.toString());
                return;
            }

            String sql = "INSERT INTO users (name, email, password, role, phone, apartment) VALUES (?,?,?,?,?,?)";
            PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, body.optString("name"));
            ps.setString(2, body.optString("email"));
            ps.setString(3, body.optString("password", "user123"));
            ps.setString(4, body.optString("role", "Resident"));
            ps.setString(5, body.optString("phone"));
            String apt = body.optString("apartment");
            if (apt.isEmpty()) ps.setNull(6, Types.VARCHAR);
            else ps.setString(6, apt);
            ps.executeUpdate();
            ResultSet gk = ps.getGeneratedKeys();
            if (gk.next()) response.put("id", gk.getInt(1));
            response.put("success", true);
            response.put("message", "User added successfully.");
        } catch (SQLException e) {
            res.setStatus(500);
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        res.getWriter().write(response.toString());
    }

    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res) throws IOException {
        setCors(res);
        String idStr = req.getParameter("id");
        JSONObject response = new JSONObject();
        try (Connection conn = DBConnection.getConnection()) {
            PreparedStatement ps = conn.prepareStatement("DELETE FROM users WHERE id=?");
            ps.setInt(1, Integer.parseInt(idStr));
            ps.executeUpdate();
            response.put("success", true);
        } catch (Exception e) {
            res.setStatus(500);
            response.put("success", false);
        }
        res.getWriter().write(response.toString());
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res) {
        setCors(res); res.setStatus(200);
    }
}
