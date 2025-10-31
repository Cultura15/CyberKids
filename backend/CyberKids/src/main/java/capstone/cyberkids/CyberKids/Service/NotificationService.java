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
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class NotificationService {
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationRepo notificationRepo;
    private final TeacherRepo teacherRepo;

    private static final ZoneId MANILA_ZONE = ZoneId.of("Asia/Manila");

    // Use ISO-like format with milliseconds (e.g. 2025-10-28T18:37:21.532)
    private static final DateTimeFormatter MANILA_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS");

    public NotificationService(SimpMessagingTemplate messagingTemplate,
                               NotificationRepo notificationRepo,
                               TeacherRepo teacherRepo) {
        this.messagingTemplate = messagingTemplate;
        this.notificationRepo = notificationRepo;
        this.teacherRepo = teacherRepo;
    }

    private String formatManila(ZonedDateTime zdt) {
        return zdt.format(MANILA_FORMATTER);
    }

    public void notifyTeacherStudentJoined(String teacherEmail, StudentDTO student) {
        String destination = "/topic/teacher/" + teacherEmail.replace("@", "_");

        // Create DB notification with UTC instant
        Instant nowUtc = Instant.now();
        Notification notification = new Notification(student.getRealName() + " has officially registered.",
                teacherRepo.findByEmail(teacherEmail).orElseThrow());
        notification.setTimestamp(nowUtc);
        notificationRepo.save(notification);

        // Build WebSocket payload with both timestamps
        ZonedDateTime nowManila = nowUtc.atZone(ZoneId.of("UTC")).withZoneSameInstant(MANILA_ZONE);
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", System.currentTimeMillis());
        payload.put("message", student.getRealName() + " has officially registered.");
        payload.put("timestampInstant", nowUtc.toString());          // e.g. 2025-10-28T11:13:35Z
        payload.put("timestampManila", formatManila(nowManila));      // e.g. 2025-10-28T19:13:35.000
        payload.put("student", student);
        payload.put("type", "REGISTRATION");

        messagingTemplate.convertAndSend(destination, payload);
    }

    /** 🏆 Notify teacher when a student completes a game */
    public void notifyTeacherStudentCompletedGame(String teacherEmail, String studentName, String missionName) {
        String destination = "/topic/teacher/" + teacherEmail.replace("@", "_");
        String message = studentName + " has completed the challenge: " + missionName + ".";

        // Create DB notification with UTC instant
        Instant nowUtc = Instant.now();
        Teacher teacher = teacherRepo.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Notification notification = new Notification(message, teacher, "MISSION_COMPLETION");
        notification.setTimestamp(nowUtc);
        notificationRepo.save(notification);

        // Build WebSocket payload with both timestamps
        ZonedDateTime nowManila = nowUtc.atZone(ZoneId.of("UTC")).withZoneSameInstant(MANILA_ZONE);
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", System.currentTimeMillis());
        payload.put("message", message);
        payload.put("timestampInstant", nowUtc.toString());         // e.g. 2025-10-28T11:13:35Z
        payload.put("timestampManila", formatManila(nowManila));     // e.g. 2025-10-28T19:13:35.000
        payload.put("type", "MISSION_COMPLETION");

        messagingTemplate.convertAndSend(destination, payload);
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

// CodeRabbit audit trigger