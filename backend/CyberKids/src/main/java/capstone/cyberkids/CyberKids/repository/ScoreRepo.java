package capstone.cyberkids.CyberKids.repository;


import capstone.cyberkids.CyberKids.entity.Score;
import capstone.cyberkids.CyberKids.entity.Student;
import capstone.cyberkids.CyberKids.Model.ChallengeType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
public interface ScoreRepo extends JpaRepository<Score, Long> {
    List<Score> findByStudentId(Long studentId);

    List<Score> findByStudentAndChallengeType(Student student, ChallengeType challengeType);

    List<Score> findByStudentAndChallengeTypeAndDateCompleted(Student student, ChallengeType challengeType, LocalDate dateCompleted);
}
