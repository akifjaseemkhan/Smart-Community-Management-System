package com.scms.patterns.composite;

class CompositeDemo {
    public static void main(String[] args) {
        LoginForm form = new LoginForm();
        form.add(new UsernameField());
        form.add(new PasswordField());
        form.render();
    }
}
