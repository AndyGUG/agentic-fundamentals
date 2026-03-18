package com.taskmanager.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import jakarta.servlet.ServletRequest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContentTypeFilterTest {

    private ContentTypeFilter filter;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain chain;

    @BeforeEach
    void setUp() {
        filter = new ContentTypeFilter();
    }

    @Test
    void doFilter_octetStreamPost_wrapsRequestAsJson() throws Exception {
        when(request.getContentType()).thenReturn("application/octet-stream");
        when(request.getMethod()).thenReturn("POST");

        filter.doFilter(request, response, chain);

        ArgumentCaptor<ServletRequest> captor = ArgumentCaptor.forClass(ServletRequest.class);
        verify(chain).doFilter(captor.capture(), eq(response));

        HttpServletRequest wrapped = (HttpServletRequest) captor.getValue();
        assertThat(wrapped.getContentType()).isEqualTo("application/json");
        assertThat(wrapped.getHeader("Content-Type")).isEqualTo("application/json");
    }

    @Test
    void doFilter_octetStreamPut_wrapsRequestAsJson() throws Exception {
        when(request.getContentType()).thenReturn("application/octet-stream");
        when(request.getMethod()).thenReturn("PUT");

        filter.doFilter(request, response, chain);

        ArgumentCaptor<ServletRequest> captor = ArgumentCaptor.forClass(ServletRequest.class);
        verify(chain).doFilter(captor.capture(), eq(response));

        HttpServletRequest wrapped = (HttpServletRequest) captor.getValue();
        assertThat(wrapped.getContentType()).isEqualTo("application/json");
    }

    @Test
    void doFilter_octetStreamGet_passesRequestThrough() throws Exception {
        when(request.getContentType()).thenReturn("application/octet-stream");
        when(request.getMethod()).thenReturn("GET");

        filter.doFilter(request, response, chain);

        // original request is passed through unchanged
        verify(chain).doFilter(request, response);
    }

    @Test
    void doFilter_jsonPost_passesRequestThrough() throws Exception {
        when(request.getContentType()).thenReturn("application/json");

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
    }

    @Test
    void doFilter_nullContentType_passesRequestThrough() throws Exception {
        when(request.getContentType()).thenReturn(null);

        filter.doFilter(request, response, chain);

        verify(chain).doFilter(request, response);
    }
}
