package capstone.cyberkids.CyberKids.Service;

import capstone.cyberkids.CyberKids.Entity.Student;
import capstone.cyberkids.CyberKids.Repository.StudentRepo;
import capstone.cyberkids.CyberKids.dtos.StudentSummaryDTO;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudentService {

    @Autowired
    private StudentRepo repo;

    public Student save(Student s) {
        return repo.save(s);
    }

    public List<StudentSummaryDTO> getStudentSummariesByGradeAndSection(String grade, String section) {
        List<Student> students = repo.findByClassEntity_GradeAndClassEntity_Section(grade, section);
        return students.stream()
                .map(s -> new StudentSummaryDTO(
                        s.getId(),
                        s.getRealName(),
                        s.getRobloxId(),
                        s.getClassEntity().getGrade(),
                        s.getClassEntity().getSection(),
                        s.getOnline()))
                .collect(Collectors.toList());
    }

    public Student getStudentByIdWithScoresAndTimers(Long id) {
        return repo.findByIdWithScoresAndTimers(id)
                .orElseThrow(() -> new EntityNotFoundException("Student not found"));
    }

    public boolean moveStudentToWorld(String robloxId, String targetWorld, String targetLevel) {

        Student student = repo.findByRobloxId(robloxId);
        if (student == null) {
            return false;
        }

        if (student.getOnline() == null || !student.getOnline()) {
            return false;
        }

        student.setTargetWorld(targetWorld);
        student.setTargetLevel(targetLevel);
        repo.save(student);
        return true;
    }
}