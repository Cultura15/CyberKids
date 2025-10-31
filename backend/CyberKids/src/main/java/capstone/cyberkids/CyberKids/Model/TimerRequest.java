package capstone.cyberkids.CyberKids.Model;

import capstone.cyberkids.CyberKids.Entity.Student;
import capstone.cyberkids.CyberKids.Model.ChallengeType;

import java.time.LocalDateTime;

public class TimerRequest {

    private Student student;
    private ChallengeType challengeType;
    private String status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Long timerId;

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

    public String getStatus() {
        return status;
    }
    public void setStatus(String status) {
        this.status = status;
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

    public Long getTimerId() {
        return timerId;
    }
    public void setTimerId(Long timerId) {
        this.timerId = timerId;
    }
}