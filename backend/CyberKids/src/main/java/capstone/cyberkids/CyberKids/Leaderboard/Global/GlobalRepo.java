package capstone.cyberkids.CyberKids.Leaderboard.Global;

import capstone.cyberkids.CyberKids.Entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GlobalRepo extends JpaRepository<GlobalEntity, Long> {
    Optional<GlobalEntity> findByStudent(Student student);
}

