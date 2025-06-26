package capstone.cyberkids.CyberKids.Service;

import capstone.cyberkids.CyberKids.Entity.Notification;
import capstone.cyberkids.CyberKids.Entity.Teacher;
import capstone.cyberkids.CyberKids.Repository.NotificationRepo;
import capstone.cyberkids.CyberKids.Repository.TeacherRepo;
import capstone.cyberkids.CyberKids.dtos.StudentDTO;
import capstone.cyberkids.CyberKids.dtos.StudentStatusDTO;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

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
        messagingTemplate.convertAndSend(destination, student);

        Teacher teacher = teacherRepo.findByEmail(teacherEmail).orElseThrow(() -> new RuntimeException("Teacher not found"));
        String message = student.getRealName() + " has officially registered.";
        Notification notification = new Notification(message, teacher);
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
