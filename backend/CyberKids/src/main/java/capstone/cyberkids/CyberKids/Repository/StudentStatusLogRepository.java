package capstone.cyberkids.CyberKids.Repository;

import capstone.cyberkids.CyberKids.Entity.StudentStatusLog;
import capstone.cyberkids.CyberKids.Entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudentStatusLogRepository extends JpaRepository<StudentStatusLog, Long> {
    List<StudentStatusLog> findByStudentOrderByTimestampDesc(Student student);
}

// CodeRabbit audit trigger