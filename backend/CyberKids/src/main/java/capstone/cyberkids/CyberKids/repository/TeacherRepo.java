package capstone.cyberkids.CyberKids.repository;

import capstone.cyberkids.CyberKids.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface TeacherRepo extends JpaRepository<Teacher, Long> {
    Optional<Teacher> findByEmail(String email);
}