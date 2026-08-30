package com.scms.servlet;

import com.scms.util.DBConnection;
import org.json.JSONArray;
import org.json.JSONObject;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.*;
import java.sql.*;

@WebServlet("/api/parking")
public class ParkingServlet extends HttpServlet {

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
            String sql = "SELECT p.*, u.name AS resident_name FROM parking p LEFT JOIN users u ON p.resident_id=u.id ORDER BY p.slot_number";
            ResultSet rs = conn.createStatement().executeQuery(sql);
            while (rs.next()) {
                JSONObject obj = new JSONObject();
                obj.put("id",             rs.getInt("id"));
                obj.put("slot_number",    rs.getString("slot_number"));
                obj.put("vehicle_number", rs.getString("vehicle_number") != null ? rs.getString("vehicle_number") : "");
                obj.put("status",         rs.getString("status"));
                obj.put("resident_name",  rs.getString("resident_name") != null ? rs.getString("resident_name") : "");
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
    protected void doPut(HttpServletRequest req, HttpServletResponse res) throws IOException {
        setCors(res);
        StringBuilder sb = new StringBuilder();
        try (BufferedReader r = req.getReader()) {
            String line; while ((line = r.readLine()) != null) sb.append(line);
        }
        JSONObject body = new JSONObject(sb.toString());
        JSONObject response = new JSONObject();

        try (Connection conn = DBConnection.getConnection()) {
            String sql = "UPDATE parking SET status=?, vehicle_number=?, resident_id=? WHERE id=?";
            PreparedStatement ps = conn.prepareStatement(sql);
            ps.setString(1, body.optString("status"));
            ps.setString(2, body.optString("vehicle_number").isEmpty() ? null : body.optString("vehicle_number"));
            if (body.has("resident_id") && body.optInt("resident_id") > 0)
                ps.setInt(3, body.optInt("resident_id"));
            else
                ps.setNull(3, Types.INTEGER);
            ps.setInt(4, body.optInt("id"));
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
        setCors(res); res.setStatus(200);
    }
}
