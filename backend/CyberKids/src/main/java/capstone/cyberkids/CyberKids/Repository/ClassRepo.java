package capstone.cyberkids.CyberKids.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import capstone.cyberkids.CyberKids.Entity.Classes;
import java.util.List;
import java.util.Optional;

public interface ClassRepo extends JpaRepository<Classes, Long> {
    List<Classes> findByTeacherId(Long teacherId);
    Optional<Classes> findByGradeAndSectionAndTeacherId(String grade, String section, Long teacherId);
    boolean existsByClassCode(String classCode);
    Optional<Classes> findByClassCode(String classCode);

}

// CodeRabbit audit trigger