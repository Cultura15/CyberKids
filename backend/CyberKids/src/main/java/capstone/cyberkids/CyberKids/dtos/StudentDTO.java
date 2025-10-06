package capstone.cyberkids.CyberKids.dtos;

import capstone.cyberkids.CyberKids.Entity.Score;
import capstone.cyberkids.CyberKids.Entity.Student;
import capstone.cyberkids.CyberKids.Entity.Timer;

import java.util.*;
import java.util.stream.Collectors;

public class StudentDTO {

    private Long id;
    private String robloxId;
    private String robloxName;
    private String realName;
    private String grade;
    private String section;
    private Boolean isOnline;
    private Long classId;

//    private List<ChallengeAttemptDTO> challengeAttempts;

    public StudentDTO(Student student) {
        this.id = student.getId();
        this.robloxId = student.getRobloxId();
        this.robloxName = student.getRobloxName();
        this.realName = student.getRealName();
        this.isOnline = student.getOnline();
        this.classId = student.getClassEntity() != null ? student.getClassEntity().getId() : null;

        if (student.getClassEntity() != null) {
            this.grade = student.getClassEntity().getGrade();
            this.section = student.getClassEntity().getSection();
        }
//
//        this.challengeAttempts = new ArrayList<>();

//        Map<String, List<Timer>> timersByType = Optional.ofNullable(student.getTimers()).orElse(Set.of())
//                .stream()
//                .collect(Collectors.groupingBy(t -> t.getChallengeType().name()));
//
//        Map<String, List<Score>> scoresByType = Optional.ofNullable(student.getScores()).orElse(Set.of())
//                .stream()
//                .collect(Collectors.groupingBy(s -> s.getChallengeType().name()));
//
//        Set<String> allChallengeTypes = new HashSet<>();
//        allChallengeTypes.addAll(timersByType.keySet());
//        allChallengeTypes.addAll(scoresByType.keySet());
//
//        for (String type : allChallengeTypes) {
//            List<Timer> timers = timersByType.getOrDefault(type, List.of());
//            List<Score> scores = scoresByType.getOrDefault(type, List.of());
//
//            int maxSize = Math.max(timers.size(), scores.size());
//
//            for (int i = 0; i < maxSize; i++) {
//                ChallengeAttemptDTO dto = new ChallengeAttemptDTO(type);
//
//                if (i < timers.size()) dto.mergeWith(timers.get(i));
//                if (i < scores.size()) dto.mergeWith(scores.get(i));
//                challengeAttempts.add(dto);
//            }
//        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRobloxId() {
        return robloxId;
    }

    public void setRobloxId(String robloxId) {
        this.robloxId = robloxId;
    }

    public String getRobloxName() {
        return robloxName;
    }

    public void setRobloxName(String robloxName) {
        this.robloxName = robloxName;
    }

    public String getRealName() {
        return realName;
    }

    public void setRealName(String realName) {
        this.realName = realName;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public Boolean getOnline() {
        return isOnline;
    }

    public void setOnline(Boolean online) {
        isOnline = online;
    }

//    public List<ChallengeAttemptDTO> getChallengeAttempts() {
//        return challengeAttempts;
//    }
//
//    public void setChallengeAttempts(List<ChallengeAttemptDTO> challengeAttempts) {
//        this.challengeAttempts = challengeAttempts;
//    }

    public Long getClassId() {
        return classId;
    }

    public void setClassId(Long classId) {
        this.classId = classId;
    }

}
