package capstone.cyberkids.CyberKids.Controller;

import capstone.cyberkids.CyberKids.Entity.Notification;
import capstone.cyberkids.CyberKids.Entity.Student;
import capstone.cyberkids.CyberKids.Entity.Teacher;
import capstone.cyberkids.CyberKids.Model.StudentTeleportRequest;
import capstone.cyberkids.CyberKids.Repository.NotificationRepo;
import capstone.cyberkids.CyberKids.Repository.StudentRepo;
import capstone.cyberkids.CyberKids.Service.NotificationService;
import capstone.cyberkids.CyberKids.Service.StudentService;
import capstone.cyberkids.CyberKids.Service.TeacherService;
import capstone.cyberkids.CyberKids.dtos.TeacherDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/teacher")
public class TeacherController {
    private final TeacherService teacherService;
    private final StudentService studentService;
    private final NotificationService notificationService;
    private final StudentRepo studentRepo;
    private final NotificationRepo notificationRepo;

    public TeacherController(TeacherService teacherService, StudentService studentService, NotificationService notificationService, StudentRepo studentRepo, NotificationRepo notificationRepo) {
        this.teacherService = teacherService;
        this.studentService = studentService;
        this.notificationService = notificationService;
        this.studentRepo = studentRepo;
        this.notificationRepo = notificationRepo;
    }

    // Register for teacher
    @PostMapping("/register")
    public ResponseEntity<Teacher> registerTeacher(@RequestBody Teacher teacher) {
        Teacher savedTeacher = teacherService.registerTeacher(teacher);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTeacher);
    }

    // Get Teacher Profile
    @GetMapping("/profile")
    public ResponseEntity<TeacherDTO> getLoggedInTeacherProfile() {
        Teacher teacher = teacherService.getLoggedInTeacher();
        return ResponseEntity.ok(new TeacherDTO(teacher));
    }

    // Move Student to Different Game
    @PostMapping("/move-student")
    public ResponseEntity<String> moveStudentToWorld(@RequestBody StudentTeleportRequest request) {
        Student student = studentRepo.findByRobloxId(request.getRobloxId());

        if (student == null) {
            return ResponseEntity.badRequest().body("Student not found.");
        }

        if (student.getOnline() == null || !student.getOnline()) {
            return ResponseEntity.badRequest().body("Player is offline.");
        }

        boolean success = studentService.moveStudentToWorld(
                request.getRobloxId(),
                request.getTargetWorld(),
                request.getTargetLevel()
        );

        return success
                ? ResponseEntity.ok("Student move request stored successfully.")
                : ResponseEntity.badRequest().body("Failed to move student.");
    }


    // Displays Teacher Notification
    @GetMapping("/notification/me")
    public ResponseEntity<List<Notification>> getMyNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails.getUsername();
        List<Notification> notifications = notificationRepo.findByTeacherEmailOrderByTimestampDesc(email);
        return ResponseEntity.ok(notifications);
    }

    // Delete Notification
    @DeleteMapping("/notification/{id}")
    public ResponseEntity<String> deleteNotification(@PathVariable Long id) {
        try {
            notificationService.deleteNotification(id);
            return ResponseEntity.ok("Notification deleted successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }
}