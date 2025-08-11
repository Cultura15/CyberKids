package capstone.cyberkids.CyberKids.Repository;


import capstone.cyberkids.CyberKids.Entity.Score;
import capstone.cyberkids.CyberKids.Entity.Student;
import capstone.cyberkids.CyberKids.Model.ChallengeType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
public interface ScoreRepo extends JpaRepository<Score, Long> {
    List<Score> findByStudentId(Long studentId);
    List<Score> findByStudentAndChallengeType(Student student, ChallengeType challengeType);
    List<Score> findByStudentAndChallengeTypeAndDateCompleted(Student student, ChallengeType challengeType, LocalDate dateCompleted);
}
