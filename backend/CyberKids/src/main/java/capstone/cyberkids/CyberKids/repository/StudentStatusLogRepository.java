package capstone.cyberkids.CyberKids.repository;

import capstone.cyberkids.CyberKids.entity.StudentStatusLog;
import capstone.cyberkids.CyberKids.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudentStatusLogRepository extends JpaRepository<StudentStatusLog, Long> {
    List<StudentStatusLog> findByStudentOrderByTimestampDesc(Student student);
}