package capstone.cyberkids.CyberKids.Leaderboard.Global;

import capstone.cyberkids.CyberKids.dtos.GlobalLeaderboardDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leaderboard/global")
public class GlobalController {

    @Autowired
    private GlobalService globalLeaderboardService;

    // Get Leaderboard per Class of Specified Teacher
    @GetMapping("/class/{classId}/level/{levelName}")
    public ResponseEntity<List<GlobalLeaderboardDTO>> getLeaderboardByClassAndLevel(
            @PathVariable Long classId,
            @PathVariable String levelName) {

        List<GlobalLeaderboardDTO> leaderboard =
                globalLeaderboardService.getRankedLevelByClass(classId, levelName);
        return ResponseEntity.ok(leaderboard);
    }

    // Get Overall Leaderboard (All Classes of Specified Teacher)
    @GetMapping("/overall")
    public ResponseEntity<List<GlobalLeaderboardDTO>> getOverallLeaderboardForTeacher() {
        return ResponseEntity.ok(globalLeaderboardService.getAllRankedOverallForTeacher());
    }
}
