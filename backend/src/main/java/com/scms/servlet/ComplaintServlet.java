package com.scms.servlet;

import com.scms.util.DBConnection;
import org.json.JSONArray;
import org.json.JSONObject;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.*;
import java.sql.*;

@WebServlet("/api/complaints")
public class ComplaintServlet extends HttpServlet {

    private void setCors(HttpServletResponse res) {
        res.setContentType("application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        setCors(res);
        JSONArray arr = new JSONArray();
        try (Connection conn = DBConnection.getConnection()) {
            String sql = "SELECT c.*, u.name AS resident_name FROM complaints c LEFT JOIN users u ON c.resident_id = u.id ORDER BY c.created_at DESC";
            ResultSet rs = conn.createStatement().executeQuery(sql);
            while (rs.next()) {
                JSONObject obj = new JSONObject();
                obj.put("id",            rs.getInt("id"));
                obj.put("resident_id",   rs.getInt("resident_id"));
                obj.put("apartment",     rs.getString("apartment"));
                obj.put("category",      rs.getString("category"));
                obj.put("priority",      rs.getString("priority"));
                obj.put("description",   rs.getString("description"));
                obj.put("status",        rs.getString("status"));
                obj.put("created_at",    rs.getString("created_at"));
                obj.put("resident_name", rs.getString("resident_name") != null ? rs.getString("resident_name") : "Unknown");
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
            String sql = "INSERT INTO complaints (resident_id,apartment,category,priority,description,status) VALUES (?,?,?,?,?,'Open')";
            PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1,    body.optInt("resident_id", 0));
            ps.setString(2, body.optString("apartment"));
            ps.setString(3, body.optString("category", "Other"));
            ps.setString(4, body.optString("priority", "Medium"));
            ps.setString(5, body.optString("description"));
            ps.executeUpdate();

            ResultSet gk = ps.getGeneratedKeys();
            if (gk.next()) response.put("id", gk.getInt(1));
            response.put("success", true);
            response.put("message", "Complaint submitted successfully.");
        } catch (SQLException e) {
            res.setStatus(500);
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        res.getWriter().write(response.toString());
    }

    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse res) throws IOException {
        setCors(res);
        StringBuilder sb = new StringBuilder();
        try (BufferedReader r = req.getReader()) {
            String line; while ((line = r.readLine()) != null) sb.append(line);
        }
        JSONObject body = new JSONObject(sb.toString());
        JSONObject response = new JSONObject();

        try (Connection conn = DBConnection.getConnection()) {
            PreparedStatement ps = conn.prepareStatement("UPDATE complaints SET status=? WHERE id=?");
            ps.setString(1, body.optString("status"));
            ps.setInt(2,    body.optInt("id"));
            ps.executeUpdate();
            response.put("success", true);
        } catch (SQLException e) {
            res.setStatus(500);
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        res.getWriter().write(response.toString());
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res) {
        setCors(res);
        res.setStatus(200);
    }
}
