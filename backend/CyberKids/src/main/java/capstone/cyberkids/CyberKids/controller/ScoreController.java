package capstone.cyberkids.CyberKids.controller;

import capstone.cyberkids.CyberKids.entity.Score;
import capstone.cyberkids.CyberKids.entity.Student;
import capstone.cyberkids.CyberKids.repository.StudentRepo;
import capstone.cyberkids.CyberKids.service.ScoreService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/scores")
public class ScoreController {

    @Autowired private ScoreService scoreService;
    @Autowired private StudentRepo studentRepository;

    // Roblox endpoint to Save student's score
    @PostMapping("/save-score")
    public ResponseEntity<Score> saveScore(@RequestBody Score score) {
        String robloxId = score.getStudent().getRobloxId();
        Student student = studentRepository.findByRobloxId(robloxId);
        if (student == null) {
            student = new Student();
            student.setRobloxId(robloxId);
            student.setRobloxName(score.getStudent().getRobloxName() != null ? score.getStudent().getRobloxName() : "Player" + robloxId);
            studentRepository.save(student);
        }
        score.setStudent(student);
        Score saved = scoreService.saveScore(score);
        return ResponseEntity.ok(saved);
    }
}



