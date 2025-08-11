package capstone.cyberkids.CyberKids.LeaderboardLevel2;


import capstone.cyberkids.CyberKids.Entity.Student;
import capstone.cyberkids.CyberKids.Repository.StudentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/leaderboard/password-sec/global")
public class Controller {

    @Autowired
    private Level2Service leaderboardService;

    @Autowired
    private StudentRepo studentRepo;

    @PostMapping("/update/{robloxId}")
    public ResponseEntity<?> updateScoreAndTime(@PathVariable String robloxId) {
        Student student = studentRepo.findByRobloxId(robloxId);
        if (student == null) {
            return ResponseEntity.notFound().build();
        }

        Level2Entity updatedEntry = leaderboardService.updateStudentTotalScoreAndTime(student);
        return ResponseEntity.ok(updatedEntry);
    }
}
