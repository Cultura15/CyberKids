package capstone.cyberkids.CyberKids.Entity;

import capstone.cyberkids.CyberKids.Model.ChallengeType;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonBackReference;


@Entity
@Table(name = "time")
public class Timer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    @JsonBackReference
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ChallengeType challengeType;


    private String timeTaken;  // In seconds
    private LocalDateTime startTime;
    private LocalDateTime endTime;


    public Timer() {}

    public Timer(Long id, Student student, ChallengeType challengeType, String timeTaken, LocalDateTime startTime, LocalDateTime endTime) {
        this.student = student;
        this.challengeType = challengeType;
        this.timeTaken = timeTaken;
        this.startTime = startTime;
        this.endTime = endTime;

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

    public ChallengeType getChallengeType() {
        return challengeType;
    }

    public void setChallengeType(ChallengeType challengeType) {
        this.challengeType = challengeType;
    }

    public String getTimeTaken() {
        return timeTaken;
    }

    public void setTimeTaken(String timeTaken) {
        this.timeTaken = timeTaken;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public void calculateTimeTaken() {
        if (startTime != null && endTime != null) {
            long seconds = java.time.Duration.between(startTime, endTime).getSeconds();
            long minutesPart = seconds / 60;
            long secondsPart = seconds % 60;
            this.timeTaken = String.format("%d:%02d", minutesPart, secondsPart);
        }
    }
}
