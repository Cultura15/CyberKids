package capstone.cyberkids.CyberKids.Entity;

import capstone.cyberkids.CyberKids.Model.ChallengeType;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "score")
public class Score {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    @JsonBackReference
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChallengeType challengeType;

    private int points;
    private String completionStatus;
    private LocalDateTime dateCompleted;

    public Score() {}

    public Score(Long id, Student student, ChallengeType challengeType, int points, String completionStatus, LocalDateTime dateCompleted) {
        this.id = id;
        this.student = student;
        this.challengeType = challengeType;
        this.points = points;
        this.completionStatus = completionStatus;
        this.dateCompleted = dateCompleted;
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

    public int getPoints() {
        return points;
    }
    public void setPoints(int points) {
        this.points = points;
    }

    public String getCompletionStatus() {
        return completionStatus;
    }
    public void setCompletionStatus(String completionStatus) {
        this.completionStatus = completionStatus;
    }

    public LocalDateTime getDateCompleted() {
        return dateCompleted;
    }
    public void setDateCompleted(LocalDateTime dateCompleted) {
        this.dateCompleted = dateCompleted;
    }

    public ChallengeType getChallengeType() {
        return challengeType;
    }
    public void setChallengeType(ChallengeType challengeType) {
        this.challengeType = challengeType;
    }
}
