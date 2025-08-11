package capstone.cyberkids.CyberKids.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import capstone.cyberkids.CyberKids.Entity.Classes;
import java.util.List;
import java.util.Optional;

public interface ClassRepo extends JpaRepository<Classes, Long> {
    List<Classes> findByTeacherId(Long teacherId);
    Optional<Classes> findByGradeAndSection(String grade, String section);
    boolean existsByClassCode(String classCode);
    Optional<Classes> findByClassCode(String classCode);

}
