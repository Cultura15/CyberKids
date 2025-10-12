package capstone.cyberkids.CyberKids.Leaderboard.Global;

import capstone.cyberkids.CyberKids.Entity.Student;
import capstone.cyberkids.CyberKids.Repository.StudentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/leaderboard/info-sorting/global")
public class GlobalController {

    @Autowired
    private GlobalService leaderboardService;

    @Autowired
    private StudentRepo studentRepo;

    @PostMapping("/update/{robloxId}")
    public ResponseEntity<?> updateScoreAndTime(@PathVariable String robloxId) {
        Student student = studentRepo.findByRobloxId(robloxId);
        if (student == null) {
            return ResponseEntity.notFound().build();
        }

        GlobalEntity updatedEntry = leaderboardService.updateStudentTotalScoreAndTime(student);
        return ResponseEntity.ok(updatedEntry);
    }


}
