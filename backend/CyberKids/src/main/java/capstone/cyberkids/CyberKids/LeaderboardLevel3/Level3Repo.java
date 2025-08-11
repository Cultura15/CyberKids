package capstone.cyberkids.CyberKids.LeaderboardLevel3;

import capstone.cyberkids.CyberKids.Entity.Student;
import capstone.cyberkids.CyberKids.LeaderboardLevel2.Level2Entity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface Level3Repo extends JpaRepository<Level3Entity, Long> {
    Optional<Level3Entity> findByStudent(Student student);
}