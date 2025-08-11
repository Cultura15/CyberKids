package capstone.cyberkids.CyberKids.LeaderboardLevel1.Daily;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class ResetService {

    @Autowired
    private DailyInfoSortingLeaderboardRepo leaderboardRepo;

    // Reset leaderboard entries every day at midnight (00:00:00)
    @Scheduled(cron = "0 0 0 * * ?")
    public void resetLeaderboard() {
        LocalDate today = LocalDate.now();
        leaderboardRepo.updateStatusForDate(today, false);  // Mark previous day's entries as inactive
    }
}