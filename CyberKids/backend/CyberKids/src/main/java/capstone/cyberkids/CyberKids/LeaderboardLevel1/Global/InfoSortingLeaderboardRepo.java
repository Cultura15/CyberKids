package capstone.cyberkids.CyberKids.LeaderboardLevel1.Global;

import capstone.cyberkids.CyberKids.Entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InfoSortingLeaderboardRepo extends JpaRepository<InfoSortingLeaderboardEntry, Long> {
    Optional<InfoSortingLeaderboardEntry> findByStudent(Student student);
}

