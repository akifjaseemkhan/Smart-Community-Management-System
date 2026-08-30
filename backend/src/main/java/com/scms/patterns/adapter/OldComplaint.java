package com.scms.patterns.adapter;

public class OldComplaint implements OldComplaintSystem {
    public void submitOldComplaint(String issue) {
        System.out.println("Old system complaint: " + issue);
    }
}
