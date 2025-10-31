package capstone.cyberkids.CyberKids.Repository;

import capstone.cyberkids.CyberKids.Entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepo extends JpaRepository<Notification, Long> {
    List<Notification> findByTeacherEmailOrderByTimestampDesc(String email);
}

// CodeRabbit audit trigger