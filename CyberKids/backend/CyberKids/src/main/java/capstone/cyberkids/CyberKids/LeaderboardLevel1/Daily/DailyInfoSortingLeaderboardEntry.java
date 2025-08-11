package capstone.cyberkids.CyberKids.LeaderboardLevel1.Daily;

import capstone.cyberkids.CyberKids.Entity.Student;
import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "leaderboard_daily_infosorting")
public class DailyInfoSortingLeaderboardEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Student student;

    private int score;

    private String totalTimeTaken;

    private LocalDate date;

    // Flag to indicate whether it's an active leaderboard entry (for the current day)
    private boolean isActive;

    public DailyInfoSortingLeaderboardEntry(Student student, int score, String totalTimeTaken, LocalDate date, boolean isActive) {

        this.student = student;
        this.score = score;
        this.totalTimeTaken = totalTimeTaken;
        this.date = date;
        this.isActive = isActive;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public String getTotalTimeTaken() {
        return totalTimeTaken;
    }

    public void setTotalTimeTaken(String totalTimeTaken) {
        this.totalTimeTaken = totalTimeTaken;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        isActive = active;
    }
}