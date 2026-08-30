package com.scms.servlet;

import com.scms.util.DBConnection;
import org.json.JSONArray;
import org.json.JSONObject;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.*;
import java.sql.*;

@WebServlet("/api/visitors")
public class VisitorServlet extends HttpServlet {

    private void setCors(HttpServletResponse res) {
        res.setContentType("application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    // GET all visitors
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        setCors(res);
        JSONArray arr = new JSONArray();
        try (Connection conn = DBConnection.getConnection()) {
            String sql = "SELECT v.*, u.name AS added_by_name FROM visitors v LEFT JOIN users u ON v.added_by = u.id ORDER BY v.created_at DESC";
            ResultSet rs = conn.createStatement().executeQuery(sql);
            while (rs.next()) {
                JSONObject obj = new JSONObject();
                obj.put("id",            rs.getInt("id"));
                obj.put("visitor_name",  rs.getString("visitor_name"));
                obj.put("cnic",          rs.getString("cnic"));
                obj.put("house_number",  rs.getString("house_number"));
                obj.put("purpose",       rs.getString("purpose"));
                obj.put("vehicle_number",rs.getString("vehicle_number"));
                obj.put("visit_time",    rs.getString("visit_time") != null ? rs.getString("visit_time") : "");
                obj.put("notes",         rs.getString("notes") != null ? rs.getString("notes") : "");
                obj.put("status",        rs.getString("status"));
                obj.put("created_at",    rs.getString("created_at"));
                arr.put(obj);
            }
        } catch (SQLException e) {
            res.setStatus(500);
            res.getWriter().write("{\"error\":\"" + e.getMessage() + "\"}");
            return;
        }
        res.getWriter().write(arr.toString());
    }

    // POST - add new visitor
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
            String sql = "INSERT INTO visitors (visitor_name,cnic,house_number,purpose,vehicle_number,visit_time,notes,status,added_by) VALUES (?,?,?,?,?,?,?,'Pending',?)";
            PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, body.optString("visitor_name"));
            ps.setString(2, body.optString("cnic"));
            ps.setString(3, body.optString("house_number"));
            ps.setString(4, body.optString("purpose", "Guest"));
            ps.setString(5, body.optString("vehicle_number"));
            ps.setString(6, body.optString("visit_time").isEmpty() ? null : body.optString("visit_time"));
            ps.setString(7, body.optString("notes"));
            ps.setInt(8,    body.optInt("added_by", 1));
            ps.executeUpdate();

            ResultSet gk = ps.getGeneratedKeys();
            if (gk.next()) response.put("id", gk.getInt(1));
            response.put("success", true);
            response.put("message", "Visitor added successfully.");
        } catch (SQLException e) {
            res.setStatus(500);
            response.put("success", false);
            response.put("message", e.getMessage());
        }
        res.getWriter().write(response.toString());
    }

    // PUT - update visitor status (Approve/Reject)
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
            String sql = "UPDATE visitors SET status=? WHERE id=?";
            PreparedStatement ps = conn.prepareStatement(sql);
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

    // DELETE visitor
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res) throws IOException {
        setCors(res);
        String idStr = req.getParameter("id");
        JSONObject response = new JSONObject();
        try (Connection conn = DBConnection.getConnection()) {
            PreparedStatement ps = conn.prepareStatement("DELETE FROM visitors WHERE id=?");
            ps.setInt(1, Integer.parseInt(idStr));
            ps.executeUpdate();
            response.put("success", true);
        } catch (Exception e) {
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
