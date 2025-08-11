package capstone.cyberkids.CyberKids.LeaderboardLevel1.Daily;

import capstone.cyberkids.CyberKids.Entity.Score;
import capstone.cyberkids.CyberKids.Entity.Student;
import capstone.cyberkids.CyberKids.Model.ChallengeType;
import capstone.cyberkids.CyberKids.Repository.ScoreRepo;
import capstone.cyberkids.CyberKids.Repository.StudentRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class DailyInfoSortingLeaderboardService {

    @Autowired
    private DailyInfoSortingLeaderboardRepo leaderboardRepo;

    @Autowired
    private ScoreRepo scoreRepo;

    @Autowired
    private StudentRepo studentRepo;

    // Update leaderboard and set entries as active or inactive
    public DailyInfoSortingLeaderboardEntry updateStudentDailyScoreAndTime(Long studentId, String totalTimeTaken, LocalDate date) {
        // First, mark previous day's leaderboard entries as inactive
        LocalDate today = LocalDate.now();
        if (!today.equals(date)) {
            leaderboardRepo.updateStatusForDate(date, false);  // Mark previous day's entries as inactive
        }

        // Proceed with normal score and time calculation for today
        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        int totalPoints = scoreRepo
                .findByStudentAndChallengeTypeAndDateCompleted(student, ChallengeType.INFORMATION_CLASSIFICATION_SORTING, date)
                .stream()
                .mapToInt(Score::getPoints)
                .sum();

        // Create or update the leaderboard entry for the current day
        DailyInfoSortingLeaderboardEntry leaderboardEntry = leaderboardRepo
                .findByStudentAndDate(student, date)
                .orElse(new DailyInfoSortingLeaderboardEntry(student, totalPoints, totalTimeTaken, date, true));

        leaderboardEntry.setScore(totalPoints);
        leaderboardEntry.setTotalTimeTaken(totalTimeTaken);
        leaderboardEntry.setDate(date);
        leaderboardEntry.setActive(true);  // Set it as active for the current day

        return leaderboardRepo.save(leaderboardEntry);
    }

    // Get the top 10 leaderboard for today
    public List<DailyInfoSortingLeaderboardEntry> getTodayLeaderboard() {
        LocalDate today = LocalDate.now();
        return leaderboardRepo.findTop10ByDateOrderByScoreDesc(today);
    }

    // Get the current active leaderboard entries
    public List<DailyInfoSortingLeaderboardEntry> getActiveLeaderboard() {
        LocalDate today = LocalDate.now();
        return leaderboardRepo.findByDateAndIsActiveTrue(today);
    }
}
