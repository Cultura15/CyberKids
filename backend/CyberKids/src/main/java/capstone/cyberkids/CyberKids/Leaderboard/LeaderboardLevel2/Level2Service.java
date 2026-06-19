package capstone.cyberkids.CyberKids.Leaderboard.LeaderboardLevel2;

import capstone.cyberkids.CyberKids.entity.Student;
import capstone.cyberkids.CyberKids.Leaderboard.Global.GlobalService;
import capstone.cyberkids.CyberKids.repository.StudentRepo;
import capstone.cyberkids.CyberKids.dto.LeaderboardResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class Level2Service {

    @Autowired
    private Level2Repo leaderboardRepo;

    @Autowired
    private StudentRepo studentRepo;

    @Autowired
    private GlobalService globalLeaderboardService;

    public Level2Entity updateStudentDailyScoreAndTimeByRobloxId(String robloxId, int score, String totalTimeTaken, LocalDate date) {
        Student student = studentRepo.findByRobloxId(robloxId);
        if (student == null) {
            throw new RuntimeException("Student not found with Roblox ID: " + robloxId);
        }

        String cleanTime = cleanTimeInput(totalTimeTaken);

        Level2Entity entry = new Level2Entity(student, score, cleanTime, date);
        Level2Entity savedEntry = leaderboardRepo.save(entry);

        globalLeaderboardService.rebuildFromLevel2();
        return savedEntry;
    }

    private String cleanTimeInput(String timeInput) {
        if (timeInput == null || timeInput.trim().isEmpty()) {
            return "00:00";
        }

        String trimmed = timeInput.trim();

        if (trimmed.matches("\\d{1,2}:\\d{2}")) {
            return trimmed;
        }

        try {
            int totalSeconds = Integer.parseInt(trimmed);
            int minutes = totalSeconds / 60;
            int seconds = totalSeconds % 60;
            String formatted = String.format("%d:%02d", minutes, seconds);
            return formatted;
        } catch (NumberFormatException e) {
            return "00:00";
        }
    }

    public List<LeaderboardResponseDTO> getTodayLeaderboard() {
        return getLeaderboardByDate(LocalDate.now());
    }

    public List<LeaderboardResponseDTO> getLeaderboardByDate(LocalDate date) {
        List<Level2Entity> entries = leaderboardRepo.findBestScoresByDate(date);
        return entries.stream()
                .limit(10)
                .map(LeaderboardResponseDTO::new)
                .collect(Collectors.toList());
    }
}

