package com.scms.patterns.adapter;

public class ComplaintAdapter {
    private OldComplaintSystem old;
    public ComplaintAdapter(OldComplaintSystem old) { this.old = old; }
    public void fileComplaint(String issue) { old.submitOldComplaint(issue); }
}
