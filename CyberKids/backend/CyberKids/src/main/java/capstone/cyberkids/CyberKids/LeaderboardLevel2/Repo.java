package capstone.cyberkids.CyberKids.LeaderboardLevel2;

import capstone.cyberkids.CyberKids.Entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface Repo extends JpaRepository<Level2Entity, Long> {
    Optional<Level2Entity> findByStudent(Student student);
}
