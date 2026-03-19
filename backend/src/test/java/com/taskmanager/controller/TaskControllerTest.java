package com.taskmanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.taskmanager.exception.TaskNotFoundException;
import com.taskmanager.model.Task;
import com.taskmanager.service.TaskService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TaskController.class)
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TaskService taskService;

    private ObjectMapper objectMapper;
    private Task sampleTask;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        sampleTask = new Task();
        sampleTask.setId(1L);
        sampleTask.setTitle("Test Task");
        sampleTask.setDescription("Test description");
        sampleTask.setStatus(Task.TaskStatus.TODO);
        sampleTask.setDueDate(LocalDate.of(2026, 12, 31));
        sampleTask.setCategory("Work");
    }

    @Test
    void getAllTasks_returnsOkWithList() throws Exception {
        when(taskService.getAllTasks()).thenReturn(List.of(sampleTask));

        mockMvc.perform(get("/api/tasks").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Test Task"));
    }

    @Test
    void getTaskById_found_returnsOk() throws Exception {
        when(taskService.getTaskById(1L)).thenReturn(Optional.of(sampleTask));

        mockMvc.perform(get("/api/tasks/1").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Task"));
    }

    @Test
    void getTaskById_notFound_returns404() throws Exception {
        when(taskService.getTaskById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/tasks/99").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    void createTask_valid_returnsCreated() throws Exception {
        when(taskService.createTask(any(Task.class))).thenReturn(sampleTask);

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleTask)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Test Task"));
    }

    @Test
    void createTask_missingTitle_returns400WithValidationError() throws Exception {
        Task invalid = new Task();
        invalid.setDescription("Desc");
        invalid.setStatus(Task.TaskStatus.TODO);
        invalid.setDueDate(LocalDate.of(2026, 12, 31));
        invalid.setCategory("Work");
        // title is blank → validation should fail

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.title").exists());
    }

    @Test
    void updateTask_found_returnsOk() throws Exception {
        when(taskService.updateTask(eq(1L), any(Task.class))).thenReturn(sampleTask);

        mockMvc.perform(put("/api/tasks/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleTask)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Test Task"));
    }

    @Test
    void updateTask_notFound_returns404() throws Exception {
        when(taskService.updateTask(eq(99L), any(Task.class)))
                .thenThrow(new TaskNotFoundException(99L));

        mockMvc.perform(put("/api/tasks/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleTask)))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteTask_notFound_returns404() throws Exception {
        doThrow(new TaskNotFoundException(99L)).when(taskService).deleteTask(99L);

        mockMvc.perform(delete("/api/tasks/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteTask_returnsNoContent() throws Exception {
        doNothing().when(taskService).deleteTask(1L);

        mockMvc.perform(delete("/api/tasks/1"))
                .andExpect(status().isNoContent());
    }
}
