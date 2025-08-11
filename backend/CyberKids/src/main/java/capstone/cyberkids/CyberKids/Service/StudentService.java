package capstone.cyberkids.CyberKids.Service;

import capstone.cyberkids.CyberKids.Entity.Student;
import capstone.cyberkids.CyberKids.Repository.StudentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StudentService {

    @Autowired
    private StudentRepo repo;

    public Student save(Student s) {
        return repo.save(s);
    }

    public Optional<Student> findById(Long id) {
        return repo.findById(id);
    }

    public List<Student> getStudentsByGradeAndSection(String grade, String section) {
        return repo.findByClassEntity_GradeAndClassEntity_Section(grade, section);
    }

    public List<Student> getStudentsBySection(String section) {
        return repo.findAllByClassEntity_Section(section);
    }

    public boolean moveStudentToWorld(String robloxId, String targetWorld, String targetLevel) {
        Student student = repo.findByRobloxId(robloxId);
        if (student != null) {
            student.setTargetWorld(targetWorld);
            student.setTargetLevel(targetLevel);
            repo.save(student);
            return true;
        }
        return false;
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}