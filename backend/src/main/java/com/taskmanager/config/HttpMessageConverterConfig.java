package com.taskmanager.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class HttpMessageConverterConfig implements WebMvcConfigurer {
    
    @Override
    public void extendMessageConverters(List<HttpMessageConverter<?>> converters) {
        for (HttpMessageConverter<?> converter : converters) {
            if (converter instanceof MappingJackson2HttpMessageConverter) {
                MappingJackson2HttpMessageConverter jackson = (MappingJackson2HttpMessageConverter) converter;
                // Add octet-stream to the supported media types
                List<MediaType> mediaTypes = new ArrayList<>(jackson.getSupportedMediaTypes());
                mediaTypes.add(MediaType.APPLICATION_OCTET_STREAM);
                jackson.setSupportedMediaTypes(mediaTypes);
            }
        }
    }
}
