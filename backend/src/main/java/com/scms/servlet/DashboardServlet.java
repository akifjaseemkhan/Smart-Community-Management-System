package com.scms.servlet;

import com.scms.util.DBConnection;
import org.json.JSONObject;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.*;
import java.sql.*;

@WebServlet("/api/dashboard")
public class DashboardServlet extends HttpServlet {

    private void setCors(HttpServletResponse res) {
        res.setContentType("application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        setCors(res);
        JSONObject data = new JSONObject();

        try (Connection conn = DBConnection.getConnection()) {
            data.put("totalResidents",   count(conn, "SELECT COUNT(*) FROM users WHERE role='Resident'"));
            data.put("todayVisitors",    count(conn, "SELECT COUNT(*) FROM visitors WHERE DATE(created_at)=CURDATE()"));
            data.put("openComplaints",   count(conn, "SELECT COUNT(*) FROM complaints WHERE status='Open'"));
            data.put("pendingBills",     count(conn, "SELECT COUNT(*) FROM bills WHERE status='Pending'"));
            data.put("availableParking", count(conn, "SELECT COUNT(*) FROM parking WHERE status='Available'"));
            data.put("totalVisitors",    count(conn, "SELECT COUNT(*) FROM visitors"));
            data.put("pendingVisitors",  count(conn, "SELECT COUNT(*) FROM visitors WHERE status='Pending'"));
            data.put("success", true);
        } catch (SQLException e) {
            res.setStatus(500);
            data.put("success", false);
            data.put("message", e.getMessage());
        }

        res.getWriter().write(data.toString());
    }

    /** Runs a single-column COUNT(*) query, closing its Statement/ResultSet. */
    private int count(Connection conn, String sql) throws SQLException {
        try (Statement st = conn.createStatement(); ResultSet rs = st.executeQuery(sql)) {
            return rs.next() ? rs.getInt(1) : 0;
        }
    }

    @Override
    protected void doOptions(HttpServletRequest req, HttpServletResponse res) {
        setCors(res); res.setStatus(200);
    }
}
