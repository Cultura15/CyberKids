package capstone.cyberkids.CyberKids.LeaderboardLevel2;


import capstone.cyberkids.CyberKids.Entity.Score;
import capstone.cyberkids.CyberKids.Entity.Student;
import capstone.cyberkids.CyberKids.Entity.Timer;
import capstone.cyberkids.CyberKids.Model.ChallengeType;
import capstone.cyberkids.CyberKids.Repository.ScoreRepo;
import capstone.cyberkids.CyberKids.Repository.TimerRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class Level2Service {
    @Autowired
    private Repo leaderboardRepo;

    @Autowired
    private ScoreRepo scoreRepo;

    @Autowired
    private TimerRepo timerRepo;

    public Level2Entity updateStudentTotalScoreAndTime(Student student) {
        // Calculate total points for the student in the INFO_SORTING challenge
        int totalPoints = scoreRepo
                .findByStudentAndChallengeType(student, ChallengeType.PASSWORD_SECURITY)
                .stream()
                .mapToInt(Score::getPoints)
                .sum();

        // Fetch the relevant timers for this student
        List<Timer> timers = timerRepo.findByStudent_Id(student.getId());

        // Calculate the total time taken for this student
        long totalTimeInSeconds = 0;
        for (Timer timer : timers) {
            if (timer.getChallengeType() == ChallengeType.PASSWORD_SECURITY) {
                // Ensure the time is calculated using the calculateTimeTaken method
                timer.calculateTimeTaken();

                // ✅ Check for null or malformed timeTaken string before parsing
                String timeTaken = timer.getTimeTaken();
                if (timeTaken != null && timeTaken.contains(":")) {
                    String[] timeParts = timeTaken.split(":");
                    try {
                        long minutes = Long.parseLong(timeParts[0]);
                        long seconds = Long.parseLong(timeParts[1]);
                        totalTimeInSeconds += (minutes * 60 + seconds);
                    } catch (NumberFormatException | ArrayIndexOutOfBoundsException e) {
                        // Optionally log the bad format
                        System.err.println("Invalid time format for timer: " + timeTaken);
                    }
                }
            }
        }

        // Format the total time taken as a string in mm:ss format
        long minutesPart = totalTimeInSeconds / 60;
        long secondsPart = totalTimeInSeconds % 60;
        String totalTimeTaken = String.format("%d:%02d", minutesPart, secondsPart);

        // Update the leaderboard entry or create one if it doesn't exist
        Level2Entity leaderboardEntry = leaderboardRepo
                .findByStudent(student)
                .orElse(new Level2Entity(student, totalPoints, totalTimeTaken));

        leaderboardEntry.setTotalScore(totalPoints);
        leaderboardEntry.setTotalTimeTaken(totalTimeTaken);

        return leaderboardRepo.save(leaderboardEntry);
    }
}
