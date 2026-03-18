package com.taskmanager.filter;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class ContentTypeFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String contentType = httpRequest.getContentType();
        
        // If content-type is octet-stream but it's a POST/PUT with body, treat as JSON
        if (contentType != null && contentType.contains("application/octet-stream")) {
            String method = httpRequest.getMethod();
            if ("POST".equals(method) || "PUT".equals(method)) {
                // Wrap request with corrected content type
                HttpServletRequest wrappedRequest = new HttpServletRequestWrapper(httpRequest) {
                    @Override
                    public String getContentType() {
                        return "application/json";
                    }
                    
                    @Override
                    public String getHeader(String name) {
                        if ("Content-Type".equalsIgnoreCase(name)) {
                            return "application/json";
                        }
                        return super.getHeader(name);
                    }
                };
                chain.doFilter(wrappedRequest, response);
                return;
            }
        }
        
        chain.doFilter(request, response);
    }
}
