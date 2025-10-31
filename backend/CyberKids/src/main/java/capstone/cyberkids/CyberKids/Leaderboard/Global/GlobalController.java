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

    /** ===== LEVEL 1 ===== **/
    @GetMapping("/level1")
    public ResponseEntity<List<GlobalLeaderboardDTO>> getGlobalLeaderboardLevel1ForTeacher() {
        return ResponseEntity.ok(globalLeaderboardService.getAllRankedLevel1ForTeacher());
    }

    @PostMapping("/rebuild/level1")
    public ResponseEntity<String> rebuildGlobalLeaderboardLevel1() {
        globalLeaderboardService.rebuildFromLevel1();
        return ResponseEntity.ok("Global Leaderboard (Level 1) rebuilt successfully.");
    }

    /** ===== LEVEL 2 ===== **/
    @GetMapping("/level2")
    public ResponseEntity<List<GlobalLeaderboardDTO>> getGlobalLeaderboardLevel2ForTeacher() {
        return ResponseEntity.ok(globalLeaderboardService.getAllRankedLevel2ForTeacher());
    }

    @PostMapping("/rebuild/level2")
    public ResponseEntity<String> rebuildGlobalLeaderboardLevel2() {
        globalLeaderboardService.rebuildFromLevel2();
        return ResponseEntity.ok("Global Leaderboard (Level 2) rebuilt successfully.");
    }

    /** ===== LEVEL 3 ===== **/
    @GetMapping("/level3")
    public ResponseEntity<List<GlobalLeaderboardDTO>> getGlobalLeaderboardLevel3ForTeacher() {
        return ResponseEntity.ok(globalLeaderboardService.getAllRankedLevel3ForTeacher());
    }

    @PostMapping("/rebuild/level3")
    public ResponseEntity<String> rebuildGlobalLeaderboardLevel3() {
        globalLeaderboardService.rebuildFromLevel3();
        return ResponseEntity.ok("Global Leaderboard (Level 3) rebuilt successfully.");
    }

    /** ===== ALL 3 CHALLENGES ===== **/
    @GetMapping("/combined")
    public ResponseEntity<List<GlobalLeaderboardDTO>> getGlobalCombinedLeaderboardForTeacher() {
        return ResponseEntity.ok(globalLeaderboardService.getAllRankedCombinedForTeacher());
    }


    /** ===== Per class ID ===== **/
    @GetMapping("/class/{classId}/level/{levelName}")
    public ResponseEntity<List<GlobalLeaderboardDTO>> getLeaderboardByClassAndLevel(
            @PathVariable Long classId,
            @PathVariable String levelName) {

        List<GlobalLeaderboardDTO> leaderboard =
                globalLeaderboardService.getRankedLevelByClass(classId, levelName);
        return ResponseEntity.ok(leaderboard);
    }

    @GetMapping("/class/{classId}/combined")
    public ResponseEntity<List<GlobalLeaderboardDTO>> getCombinedLeaderboardByClass(@PathVariable Long classId) {
        List<GlobalLeaderboardDTO> leaderboard = globalLeaderboardService.getAllRankedCombinedByClass(classId);
        return ResponseEntity.ok(leaderboard);
    }

    /** ===== OVERALL LEADERBOARD (ALL CLASSES OF TEACHER) ===== **/
    @GetMapping("/overall")
    public ResponseEntity<List<GlobalLeaderboardDTO>> getOverallLeaderboardForTeacher() {
        return ResponseEntity.ok(globalLeaderboardService.getAllRankedOverallForTeacher());
    }
}

// CodeRabbit audit trigger
