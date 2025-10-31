package capstone.cyberkids.CyberKids.Leaderboard.Global;

import capstone.cyberkids.CyberKids.Entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GlobalRepo extends JpaRepository<GlobalEntity, Long> {
    GlobalEntity findByStudent(Student student);
}

// CodeRabbit audit trigger