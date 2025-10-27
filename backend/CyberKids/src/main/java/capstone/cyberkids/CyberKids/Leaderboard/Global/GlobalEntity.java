package capstone.cyberkids.CyberKids.Leaderboard.Global;

import capstone.cyberkids.CyberKids.Entity.Student;
import jakarta.persistence.*;

@Entity
@Table(name = "global_leaderboard")
public class GlobalEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "student_student_id", unique = true)
    private Student student;

    private int highestScore;
    private String bestTimeTaken;  // optional tie-breaker
    private int globalRank;

    private String level; // <-- new field

    public GlobalEntity() {}

    public GlobalEntity(Student student, int highestScore, String bestTimeTaken, int globalRank, String level) {
        this.student = student;
        this.highestScore = highestScore;
        this.bestTimeTaken = bestTimeTaken;
        this.globalRank = globalRank;
        this.level = level;
    }

    public Long getId() { return id; }
    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public int getHighestScore() { return highestScore; }
    public void setHighestScore(int highestScore) { this.highestScore = highestScore; }

    public String getBestTimeTaken() { return bestTimeTaken; }
    public void setBestTimeTaken(String bestTimeTaken) { this.bestTimeTaken = bestTimeTaken; }

    public int getGlobalRank() { return globalRank; }
    public void setGlobalRank(int globalRank) { this.globalRank = globalRank; }

    public String getLevel() { return level; } // <-- getter
    public void setLevel(String level) { this.level = level; } // <-- setter
}
