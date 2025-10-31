package capstone.cyberkids.CyberKids.Repository;

import capstone.cyberkids.CyberKids.Entity.Classes;
import capstone.cyberkids.CyberKids.Entity.Scenario;
import capstone.cyberkids.CyberKids.Entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScenarioRepository extends JpaRepository<Scenario, Long> {
    List<Scenario> findByTeacherId(Long teacherId);
    List<Scenario> findByClassEntityAndActiveTrue(Classes classEntity);
    List<Scenario> findByTeacherAndActiveTrue(Teacher teacher);
    List<Scenario> findByTeacherOrderByCreatedAtDesc(Teacher teacher);
    @Query("SELECT s FROM Scenario s WHERE s.active = true")
    List<Scenario> findAllActiveScenarios();
    long countByTeacherAndActiveTrue(Teacher teacher);
}

// CodeRabbit audit trigger
