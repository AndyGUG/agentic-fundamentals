package com.taskmanager;

import com.taskmanager.model.Task;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("integration")
class TaskIntegrationIT {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    private String baseUrl;

    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port + "/api/tasks";
    }

    // ─── CREATE ─────────────────────────────────────────────────────────────────

    @Test
    void createTask_validPayload_returns201WithBody() {
        Task task = buildTask("Integration Task", "Created via integration test", Task.TaskStatus.TODO);

        ResponseEntity<Task> response = restTemplate.postForEntity(baseUrl, task, Task.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getId()).isNotNull();
        assertThat(response.getBody().getTitle()).isEqualTo("Integration Task");
        assertThat(response.getBody().getStatus()).isEqualTo(Task.TaskStatus.TODO);
    }

    @Test
    void createTask_missingTitle_returns400() {
        Task invalid = buildTask(null, "Missing title", Task.TaskStatus.TODO);

        ResponseEntity<Map> response = restTemplate.postForEntity(baseUrl, invalid, Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
        assertThat(response.getBody()).containsKey("errors");
    }

    @Test
    void createTask_nullStatus_returns400() {
        Task task = buildTask("No-status Task", "Status is required", null);

        ResponseEntity<Map> response = restTemplate.postForEntity(baseUrl, task, Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    // ─── READ ────────────────────────────────────────────────────────────────────

    @Test
    void getAllTasks_returnsOk() {
        ResponseEntity<Task[]> response = restTemplate.getForEntity(baseUrl, Task[].class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
    }

    @Test
    void getTaskById_existingTask_returnsOk() {
        Task created = restTemplate.postForObject(baseUrl, buildTask("Find me", "desc", Task.TaskStatus.TODO), Task.class);

        ResponseEntity<Task> response = restTemplate.getForEntity(baseUrl + "/" + created.getId(), Task.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getTitle()).isEqualTo("Find me");
    }

    @Test
    void getTaskById_nonExistingId_returns404() {
        ResponseEntity<Map> response = restTemplate.getForEntity(baseUrl + "/999999", Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    // ─── UPDATE ──────────────────────────────────────────────────────────────────

    @Test
    void updateTask_validPayload_returns200WithUpdatedData() {
        Task created = restTemplate.postForObject(baseUrl, buildTask("Original", "desc", Task.TaskStatus.TODO), Task.class);

        created.setTitle("Updated Title");
        created.setStatus(Task.TaskStatus.IN_PROGRESS);

        HttpEntity<Task> request = new HttpEntity<>(created);
        ResponseEntity<Task> response = restTemplate.exchange(
                baseUrl + "/" + created.getId(), HttpMethod.PUT, request, Task.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getTitle()).isEqualTo("Updated Title");
        assertThat(response.getBody().getStatus()).isEqualTo(Task.TaskStatus.IN_PROGRESS);
    }

    @Test
    void updateTask_nonExistingId_returns404() {
        Task task = buildTask("Ghost", "desc", Task.TaskStatus.TODO);

        HttpEntity<Task> request = new HttpEntity<>(task);
        ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/999999", HttpMethod.PUT, request, Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    // ─── DELETE ──────────────────────────────────────────────────────────────────

    @Test
    void deleteTask_existingTask_returns204() {
        Task created = restTemplate.postForObject(baseUrl, buildTask("To delete", "desc", Task.TaskStatus.TODO), Task.class);

        ResponseEntity<Void> deleteResponse = restTemplate.exchange(
                baseUrl + "/" + created.getId(), HttpMethod.DELETE, null, Void.class);

        assertThat(deleteResponse.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        ResponseEntity<Map> getResponse = restTemplate.getForEntity(baseUrl + "/" + created.getId(), Map.class);
        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    @Test
    void deleteTask_nonExistingId_returns404() {
        ResponseEntity<Map> response = restTemplate.exchange(
                baseUrl + "/999999", HttpMethod.DELETE, null, Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    // ─── FULL CRUD FLOW ──────────────────────────────────────────────────────────

    @Test
    void fullCrudFlow_createReadUpdateDelete() {
        // Create
        Task created = restTemplate.postForObject(baseUrl,
                buildTask("CRUD Flow Task", "Full lifecycle", Task.TaskStatus.TODO), Task.class);
        assertThat(created.getId()).isNotNull();

        // Read
        Task fetched = restTemplate.getForObject(baseUrl + "/" + created.getId(), Task.class);
        assertThat(fetched.getTitle()).isEqualTo("CRUD Flow Task");

        // Update
        fetched.setStatus(Task.TaskStatus.DONE);
        HttpEntity<Task> updateRequest = new HttpEntity<>(fetched);
        ResponseEntity<Task> updated = restTemplate.exchange(
                baseUrl + "/" + fetched.getId(), HttpMethod.PUT, updateRequest, Task.class);
        assertThat(updated.getBody().getStatus()).isEqualTo(Task.TaskStatus.DONE);

        // Delete
        restTemplate.delete(baseUrl + "/" + fetched.getId());
        ResponseEntity<Map> gone = restTemplate.getForEntity(baseUrl + "/" + fetched.getId(), Map.class);
        assertThat(gone.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }

    // ─── HELPERS ─────────────────────────────────────────────────────────────────

    private Task buildTask(String title, String description, Task.TaskStatus status) {
        Task task = new Task();
        task.setTitle(title);
        task.setDescription(description);
        task.setStatus(status);
        task.setDueDate(LocalDate.of(2026, 12, 31));
        task.setCategory("Testing");
        return task;
    }
}
