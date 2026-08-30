package com.scms.servlet;

import com.scms.util.DBConnection;
import org.json.JSONArray;
import org.json.JSONObject;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.*;
import java.sql.*;

@WebServlet("/api/announcements")
public class AnnouncementServlet extends HttpServlet {

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
            String sql = "SELECT a.*, u.name AS posted_by_name FROM announcements a LEFT JOIN users u ON a.posted_by=u.id ORDER BY a.created_at DESC";
            ResultSet rs = conn.createStatement().executeQuery(sql);
            while (rs.next()) {
                JSONObject obj = new JSONObject();
                obj.put("id",             rs.getInt("id"));
                obj.put("title",          rs.getString("title"));
                obj.put("message",        rs.getString("message"));
                obj.put("type",           rs.getString("type"));
                obj.put("posted_by_name", rs.getString("posted_by_name") != null ? rs.getString("posted_by_name") : "Admin");
                obj.put("created_at",     rs.getString("created_at"));
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
            String sql = "INSERT INTO announcements (title, message, type, posted_by) VALUES (?,?,?,?)";
            PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, body.optString("title"));
            ps.setString(2, body.optString("message"));
            ps.setString(3, body.optString("type", "Info"));
            ps.setInt(4,    body.optInt("posted_by", 1));
            ps.executeUpdate();
            ResultSet gk = ps.getGeneratedKeys();
            if (gk.next()) response.put("id", gk.getInt(1));
            response.put("success", true);
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
            PreparedStatement ps = conn.prepareStatement("DELETE FROM announcements WHERE id=?");
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
