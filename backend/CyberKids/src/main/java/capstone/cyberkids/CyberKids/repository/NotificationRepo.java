package capstone.cyberkids.CyberKids.repository;

import capstone.cyberkids.CyberKids.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepo extends JpaRepository<Notification, Long> {

    List<Notification> findByTeacherEmailOrderByTimestampDesc(String email);
}

