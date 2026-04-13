package com.taskmanager.repository;

import com.taskmanager.model.Task;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class TaskRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private TaskRepository taskRepository;

    private Task sampleTask;

    @BeforeEach
    void setUp() {
        sampleTask = new Task();
        sampleTask.setTitle("Repository Test Task");
        sampleTask.setDescription("Test description");
        sampleTask.setStatus(Task.TaskStatus.TODO);
        sampleTask.setDueDate(LocalDate.of(2026, 12, 31));
        sampleTask.setCategory("Work");
    }

    @Test
    void save_persistsTask() {
        Task saved = taskRepository.save(sampleTask);

        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getTitle()).isEqualTo("Repository Test Task");
        assertThat(saved.getStatus()).isEqualTo(Task.TaskStatus.TODO);
    }

    @Test
    void findById_existingTask_returnsTask() {
        Task persisted = entityManager.persistAndFlush(sampleTask);

        Optional<Task> found = taskRepository.findById(persisted.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getTitle()).isEqualTo("Repository Test Task");
    }

    @Test
    void findById_nonExistingId_returnsEmpty() {
        Optional<Task> found = taskRepository.findById(999L);

        assertThat(found).isEmpty();
    }

    @Test
    void findAll_returnsAllTasks() {
        Task task2 = new Task();
        task2.setTitle("Second Task");
        task2.setDescription("Another desc");
        task2.setStatus(Task.TaskStatus.IN_PROGRESS);
        task2.setDueDate(LocalDate.of(2026, 6, 1));
        task2.setCategory("Personal");

        entityManager.persistAndFlush(sampleTask);
        entityManager.persistAndFlush(task2);

        List<Task> all = taskRepository.findAll();

        assertThat(all).hasSize(2);
    }

    @Test
    void deleteById_removesTask() {
        Task persisted = entityManager.persistAndFlush(sampleTask);
        Long id = persisted.getId();

        taskRepository.deleteById(id);
        entityManager.flush();

        assertThat(taskRepository.findById(id)).isEmpty();
    }

    @Test
    void existsById_existingTask_returnsTrue() {
        Task persisted = entityManager.persistAndFlush(sampleTask);

        assertThat(taskRepository.existsById(persisted.getId())).isTrue();
    }

    @Test
    void existsById_nonExistingId_returnsFalse() {
        assertThat(taskRepository.existsById(999L)).isFalse();
    }

    @Test
    void save_updateExistingTask_persitsChanges() {
        Task persisted = entityManager.persistAndFlush(sampleTask);
        persisted.setTitle("Updated Title");
        persisted.setStatus(Task.TaskStatus.DONE);

        taskRepository.save(persisted);
        entityManager.flush();
        entityManager.clear();

        Task reloaded = taskRepository.findById(persisted.getId()).orElseThrow();
        assertThat(reloaded.getTitle()).isEqualTo("Updated Title");
        assertThat(reloaded.getStatus()).isEqualTo(Task.TaskStatus.DONE);
    }
}
