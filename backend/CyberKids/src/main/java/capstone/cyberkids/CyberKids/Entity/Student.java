package capstone.cyberkids.CyberKids.Entity;


import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.util.*;


@Entity
@Table(name = "student")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_id", nullable = false)
    private Long id;

    @Column(nullable = false)
    private String robloxId;

    @Column(nullable = true)
    private String robloxName;

    @Column(nullable = true, unique = true)
    private String realName;

    @Column(name = "is_online", nullable = true)
    private Boolean isOnline;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = true)
    @JsonBackReference
    private Classes classEntity;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    @JsonManagedReference
    private Set<Score> scores;

    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL)
    @JsonManagedReference
    private Set<Timer> timers;

    private String targetWorld;
    private String targetLevel;

    @Column(name = "grade")
    private String grade;

    @Column(name = "section")
    private String section;

    public Student() {}

    public Student(Long id, String robloxId, String robloxName, String realName) {
        this.id = id;
        this.robloxId = robloxId;
        this.robloxName = robloxName;
        this.realName = realName;
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

    public Set<Score> getScores() {
        return scores;
    }

    public void setScores(Set<Score> scores) {
        this.scores = scores;
    }

    public Set<Timer> getTimers() {
        return timers;
    }

    public void setTimers(Set<Timer> timers) {
        this.timers = timers;
    }

    public Classes getClassEntity() {return classEntity;}

    public void setClassEntity(Classes classEntity) {this.classEntity = classEntity;}

    public String getTargetWorld() {return targetWorld;}

    public void setTargetWorld(String targetWorld) {this.targetWorld = targetWorld;}

    public String getTargetLevel() {return targetLevel;}

    public void setTargetLevel(String targetLevel) {this.targetLevel = targetLevel;}

    public Boolean getOnline() {
        return isOnline != null ? isOnline : false;
    }

    public void setOnline(Boolean online) {
        isOnline = online;
    }

    public String getGrade() {return grade;}

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public void setGrade(String grade) {this.grade = grade;}

    public String getRealNameOrFallback() {
        return (realName != null && !realName.isBlank())
                ? realName
                : robloxName != null
                ? robloxName
                : "Unknown Player";
    }
}
