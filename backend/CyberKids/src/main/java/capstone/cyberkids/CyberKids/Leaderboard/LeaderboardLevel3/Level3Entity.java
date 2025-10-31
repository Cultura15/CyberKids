package capstone.cyberkids.CyberKids.Leaderboard.LeaderboardLevel3;

import capstone.cyberkids.CyberKids.Entity.Student;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "daily_leaderboard_level3")
public class Level3Entity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Student student;

    private int score;
    private String totalTimeTaken;
    private LocalDate date;

    public Level3Entity() {}

    public Level3Entity(Student student, int score, String totalTimeTaken, LocalDate date) {
        this.student = student;
        this.score = score;
        this.totalTimeTaken = totalTimeTaken;
        this.date = date;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public String getTotalTimeTaken() { return totalTimeTaken; }
    public void setTotalTimeTaken(String totalTimeTaken) { this.totalTimeTaken = totalTimeTaken; }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
}
