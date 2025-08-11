package capstone.cyberkids.CyberKids.Controller;

import capstone.cyberkids.CyberKids.Entity.Score;
import capstone.cyberkids.CyberKids.Entity.Student;
import capstone.cyberkids.CyberKids.Repository.StudentRepo;
import capstone.cyberkids.CyberKids.Service.ScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/scores")
public class ScoreController {

    @Autowired private ScoreService scoreService;
    @Autowired private StudentRepo studentRepository;

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

    @GetMapping
    public List<Score> getAllScores() {
        return scoreService.getAllScores();
    }
}



