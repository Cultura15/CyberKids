package capstone.cyberkids.CyberKids.Repository;

import capstone.cyberkids.CyberKids.Entity.Timer;
import capstone.cyberkids.CyberKids.Model.ChallengeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface TimerRepo extends JpaRepository<Timer, Long> {

    // Corrected: this returns a list of timers for a student ID
    List<Timer> findByStudent_Id(Long studentId);

    // Custom query methods
    List<Timer> findByChallengeType(ChallengeType challengeType);

    @Query("SELECT t FROM Timer t WHERE t.student.id = :studentId AND t.endTime IS NULL ORDER BY t.startTime DESC")
    List<Timer> findLatestUnfinishedTimer(@Param("studentId") Long studentId, org.springframework.data.domain.Pageable pageable);

}
