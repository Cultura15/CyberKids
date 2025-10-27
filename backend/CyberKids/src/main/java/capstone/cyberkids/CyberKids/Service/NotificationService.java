package capstone.cyberkids.CyberKids.Service;

import capstone.cyberkids.CyberKids.Entity.Notification;
import capstone.cyberkids.CyberKids.Entity.Teacher;
import capstone.cyberkids.CyberKids.Repository.NotificationRepo;
import capstone.cyberkids.CyberKids.Repository.TeacherRepo;
import capstone.cyberkids.CyberKids.dtos.StudentDTO;
import capstone.cyberkids.CyberKids.dtos.StudentStatusDTO;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationService {
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepo notificationRepo;
    private final TeacherRepo teacherRepo;

    public NotificationService(SimpMessagingTemplate messagingTemplate, NotificationRepo notificationRepo, TeacherRepo teacherRepo) {
        this.messagingTemplate = messagingTemplate;
        this.notificationRepo = notificationRepo;
        this.teacherRepo = teacherRepo;
    }

    public void notifyTeacherStudentJoined(String teacherEmail, StudentDTO student) {
        String destination = "/topic/teacher/" + teacherEmail.replace("@", "_");

        Map<String, Object> payload = new HashMap<>();
        payload.put("id", System.currentTimeMillis());
        payload.put("message", student.getRealName() + " has officially registered.");
        payload.put("timestamp", LocalDateTime.now());
        payload.put("student", student);
        payload.put("type", "REGISTRATION");

        messagingTemplate.convertAndSend(destination, payload);

        Teacher teacher = teacherRepo.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Notification notification = new Notification(payload.get("message").toString(), teacher, "REGISTRATION");
        notification.setTimestamp(LocalDateTime.now());
        notificationRepo.save(notification);
    }

    public void notifyTeacherStudentCompletedGame(String teacherEmail, String studentName, String missionName) {
        String destination = "/topic/teacher/" + teacherEmail.replace("@", "_");
        String message = studentName + " has completed the challenge: " + missionName + ".";

        Map<String, Object> payload = new HashMap<>();
        payload.put("id", System.currentTimeMillis());
        payload.put("message", message);
        payload.put("timestamp", LocalDateTime.now());
        payload.put("type", "MISSION_COMPLETION");

        messagingTemplate.convertAndSend(destination, payload);

        Teacher teacher = teacherRepo.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Notification notification = new Notification(message, teacher, "MISSION_COMPLETION");
        notification.setTimestamp(LocalDateTime.now());
        notificationRepo.save(notification);
    }


    public void notifyStudentStatusChanged(String robloxId, Boolean isOnline) {
        StudentStatusDTO statusDTO = new StudentStatusDTO(robloxId, isOnline);
        messagingTemplate.convertAndSend("/topic/student-status", statusDTO);
    }

    public void deleteNotification(Long id) {
        if (!notificationRepo.existsById(id)) {
            throw new RuntimeException("Notification not found with ID: " + id);
        }
        notificationRepo.deleteById(id);
    }


}
