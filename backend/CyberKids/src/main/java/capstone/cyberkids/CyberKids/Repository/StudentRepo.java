package capstone.cyberkids.CyberKids.Repository;

import capstone.cyberkids.CyberKids.Entity.Student;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StudentRepo extends JpaRepository<Student, Long> {
    Student findByRobloxId(String robloxId);

    List<Student> findAllByClassEntity_Section(String section);
    boolean existsByRealNameIgnoreCaseAndClassEntity_ClassCode(String realName, String classCode);

    // Existing method for summary list (no change needed)
    @EntityGraph(attributePaths = {"classEntity"})
    List<Student> findByClassEntity_GradeAndClassEntity_Section(String grade, String section);


    // New method for full student detail
    @EntityGraph(attributePaths = {"scores", "timers", "classEntity"})
    @Query("SELECT s FROM Student s WHERE s.id = :id")
    Optional<Student> findByIdWithScoresAndTimers(@Param("id") Long id);

}
