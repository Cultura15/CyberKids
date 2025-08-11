package capstone.cyberkids.CyberKids.LeaderboardLevel1.Daily;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/leaderboard/info-sorting/daily")
public class DailyInfoSortingLeaderboardController {

    @Autowired
    private DailyInfoSortingLeaderboardService leaderboardService;

    // Update the daily leaderboard entry with the student's score and time taken
    @PostMapping("/update/{studentId}")
    public ResponseEntity<?> updateDailyLeaderboard(
            @PathVariable Long studentId,
            @RequestParam("date") LocalDate date,
            @RequestParam("totalTimeTaken") String totalTimeTaken
    ) {
        try {
            DailyInfoSortingLeaderboardEntry updatedEntry =
                    leaderboardService.updateStudentDailyScoreAndTime(studentId, totalTimeTaken, date);
            return ResponseEntity.ok(updatedEntry);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Error updating daily leaderboard: " + e.getMessage());
        }
    }

    // Get the top 10 leaderboard for the current day
    @GetMapping("/today")
    public ResponseEntity<List<DailyInfoSortingLeaderboardEntry>> getTodayLeaderboard() {
        try {
            List<DailyInfoSortingLeaderboardEntry> leaderboard = leaderboardService.getTodayLeaderboard();
            return ResponseEntity.ok(leaderboard);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    // Get the current active leaderboard for the day
    @GetMapping("/active")
    public ResponseEntity<List<DailyInfoSortingLeaderboardEntry>> getActiveLeaderboard() {
        try {
            List<DailyInfoSortingLeaderboardEntry> leaderboard = leaderboardService.getActiveLeaderboard();
            return ResponseEntity.ok(leaderboard);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
