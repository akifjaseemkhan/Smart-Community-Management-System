package com.scms.patterns.adapter;

class AdapterDemo {
    public static void main(String[] args) {
        OldComplaintSystem old = new OldComplaint();
        ComplaintAdapter adapter = new ComplaintAdapter(old);
        adapter.fileComplaint("Water leakage in Block A");
    }
}
