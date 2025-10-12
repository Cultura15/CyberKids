package capstone.cyberkids.CyberKids.Leaderboard.Global;

import capstone.cyberkids.CyberKids.Entity.Student;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "leaderboard_global_infosorting")
public class GlobalEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "student_id", nullable = false, unique = true)
    @JsonIgnore
    private Student student;

    @Column(nullable = false)
    private int totalScore;

    @Column(nullable = false)
    private String totalTimeTaken;

    public GlobalEntity() {}

    public GlobalEntity(Student student, int totalScore, String totalTimeTaken) {
        this.student = student;
        this.totalScore = totalScore;
        this.totalTimeTaken = totalTimeTaken;
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

    public int getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(int totalScore) {
        this.totalScore = totalScore;
    }

    public String getTotalTimeTaken() {
        return totalTimeTaken;
    }

    public void setTotalTimeTaken(String totalTimeTaken) {
        this.totalTimeTaken = totalTimeTaken;
    }
}

