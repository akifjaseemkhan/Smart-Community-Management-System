package com.scms.patterns.composite;

import java.util.ArrayList;
import java.util.List;

public class LoginForm implements FormComponent {
    private List<FormComponent> components = new ArrayList<>();
    public void add(FormComponent c) { components.add(c); }
    public void render() { components.forEach(FormComponent::render); }
}
