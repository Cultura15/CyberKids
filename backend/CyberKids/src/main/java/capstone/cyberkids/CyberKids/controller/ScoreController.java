package capstone.cyberkids.CyberKids.controller;

import capstone.cyberkids.CyberKids.entity.Score;
import capstone.cyberkids.CyberKids.entity.Student;
import capstone.cyberkids.CyberKids.repository.StudentRepo;
import capstone.cyberkids.CyberKids.service.ScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
            student.setRobloxName(score.getStudent().getRobloxName() != null
                    ? score.getStudent().getRobloxName()
                    : "Player" + robloxId);

            studentRepository.save(student);
            System.out.println("Auto‑created student: " + student.getRobloxName());
        } else {
            System.out.println("Found existing student: " + student.getRealNameOrFallback());
        }

        score.setStudent(student);
        Score saved = scoreService.saveScore(score);

        System.out.printf("Saved score for %s (%s): %d points%n",
                student.getRealNameOrFallback(),
                robloxId,
                saved.getPoints());

        return ResponseEntity.ok(saved);
    }
}



