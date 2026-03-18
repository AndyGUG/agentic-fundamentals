package com.taskmanager.service;

import com.taskmanager.model.Task;
import com.taskmanager.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @InjectMocks
    private TaskService taskService;

    private Task sampleTask;

    @BeforeEach
    void setUp() {
        sampleTask = new Task();
        sampleTask.setId(1L);
        sampleTask.setTitle("Test Task");
        sampleTask.setDescription("Test description");
        sampleTask.setStatus(Task.TaskStatus.TODO);
        sampleTask.setDueDate(LocalDate.of(2026, 12, 31));
        sampleTask.setCategory("Work");
    }

    @Test
    void getAllTasks_returnsList() {
        when(taskRepository.findAll()).thenReturn(List.of(sampleTask));

        List<Task> result = taskService.getAllTasks();

        assertThat(result).hasSize(1).contains(sampleTask);
        verify(taskRepository).findAll();
    }

    @Test
    void getTaskById_found_returnsOptional() {
        when(taskRepository.findById(1L)).thenReturn(Optional.of(sampleTask));

        Optional<Task> result = taskService.getTaskById(1L);

        assertThat(result).isPresent().contains(sampleTask);
    }

    @Test
    void getTaskById_notFound_returnsEmpty() {
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<Task> result = taskService.getTaskById(99L);

        assertThat(result).isEmpty();
    }

    @Test
    void createTask_withStatus_savesAsIs() {
        sampleTask.setStatus(Task.TaskStatus.IN_PROGRESS);
        when(taskRepository.save(any(Task.class))).thenReturn(sampleTask);

        Task result = taskService.createTask(sampleTask);

        assertThat(result.getStatus()).isEqualTo(Task.TaskStatus.IN_PROGRESS);
        verify(taskRepository).save(sampleTask);
    }

    @Test
    void createTask_withNullStatus_defaultsToTodo() {
        Task newTask = new Task();
        newTask.setTitle("Title");
        newTask.setDescription("Desc");
        newTask.setDueDate(LocalDate.now());
        newTask.setCategory("Cat");
        newTask.setStatus(null);
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        Task result = taskService.createTask(newTask);

        assertThat(result.getStatus()).isEqualTo(Task.TaskStatus.TODO);
    }

    @Test
    void updateTask_found_updatesFields() {
        Task updates = new Task();
        updates.setTitle("Updated Title");
        updates.setDescription("Updated Desc");
        updates.setStatus(Task.TaskStatus.DONE);
        updates.setDueDate(LocalDate.of(2027, 1, 1));
        updates.setCategory("Personal");

        when(taskRepository.findById(1L)).thenReturn(Optional.of(sampleTask));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        Task result = taskService.updateTask(1L, updates);

        assertThat(result.getTitle()).isEqualTo("Updated Title");
        assertThat(result.getDescription()).isEqualTo("Updated Desc");
        assertThat(result.getStatus()).isEqualTo(Task.TaskStatus.DONE);
        assertThat(result.getDueDate()).isEqualTo(LocalDate.of(2027, 1, 1));
        assertThat(result.getCategory()).isEqualTo("Personal");
    }

    @Test
    void updateTask_partialUpdate_onlyChangesNonNullFields() {
        Task updates = new Task();
        updates.setTitle("New Title");
        // all other fields null → should not be updated

        when(taskRepository.findById(1L)).thenReturn(Optional.of(sampleTask));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        Task result = taskService.updateTask(1L, updates);

        assertThat(result.getTitle()).isEqualTo("New Title");
        assertThat(result.getDescription()).isEqualTo("Test description");
        assertThat(result.getStatus()).isEqualTo(Task.TaskStatus.TODO);
    }

    @Test
    void updateTask_notFound_throwsRuntimeException() {
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.updateTask(99L, new Task()))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Task not found");
    }

    @Test
    void deleteTask_callsRepository() {
        doNothing().when(taskRepository).deleteById(1L);

        taskService.deleteTask(1L);

        verify(taskRepository).deleteById(1L);
    }
}
