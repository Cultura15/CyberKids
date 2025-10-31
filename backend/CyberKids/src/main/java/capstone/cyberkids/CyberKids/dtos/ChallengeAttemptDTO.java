package capstone.cyberkids.CyberKids.dtos;

import capstone.cyberkids.CyberKids.Entity.Score;
import capstone.cyberkids.CyberKids.Entity.Timer;

import java.time.LocalDateTime;

public class ChallengeAttemptDTO {
    private String challengeType;

    private Integer points;
    private String completionStatus;
    private LocalDateTime dateCompleted;

    private String timeTaken;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    public ChallengeAttemptDTO(String challengeType) {
        this.challengeType = challengeType;
    }

    public ChallengeAttemptDTO(Timer timer) {
        this.challengeType = timer.getChallengeType().name();
        this.timeTaken = timer.getTimeTaken();
        this.startTime = timer.getStartTime();
        this.endTime = timer.getEndTime();
    }

    public ChallengeAttemptDTO(Score score) {
        this.challengeType = score.getChallengeType().name();
        this.points = score.getPoints();
        this.completionStatus = score.getCompletionStatus();
        this.dateCompleted = score.getDateCompleted();
    }

    public void mergeWith(Score score) {
        this.points = score.getPoints();
        this.completionStatus = score.getCompletionStatus();
        this.dateCompleted = score.getDateCompleted();
    }

    public void mergeWith(Timer timer) {
        this.timeTaken = timer.getTimeTaken();
        this.startTime = timer.getStartTime();
        this.endTime = timer.getEndTime();
    }

    public String getChallengeType() {
        return challengeType;
    }

    public void setChallengeType(String challengeType) {
        this.challengeType = challengeType;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
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
}

// CodeRabbit audit trigger
