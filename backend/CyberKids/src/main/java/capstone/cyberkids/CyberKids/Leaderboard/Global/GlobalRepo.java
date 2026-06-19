package capstone.cyberkids.CyberKids.Leaderboard.Global;

import capstone.cyberkids.CyberKids.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GlobalRepo extends JpaRepository<GlobalEntity, Long> {
    GlobalEntity findByStudent(Student student);
}

