package capstone.cyberkids.CyberKids.Repository;

import capstone.cyberkids.CyberKids.Entity.Student;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentRepo extends JpaRepository<Student, Long> {
    Student findByRobloxId(String robloxId);

    List<Student> findAllByClassEntity_Section(String section);

    @EntityGraph(attributePaths = {"scores", "timers", "classEntity"})
    List<Student> findByClassEntity_GradeAndClassEntity_Section(String grade, String section);
}
