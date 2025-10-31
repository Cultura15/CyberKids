package capstone.cyberkids.CyberKids.Entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import capstone.cyberkids.CyberKids.Model.AnswerTypeLvl1;
import java.util.Date;


@Entity
@Table(name = "scenarios")
public class Scenario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String content;

    @Column(name = "active", nullable = false)
    private boolean active = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnswerTypeLvl1 correctAnswer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private Classes classEntity;

    @CreationTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(updatable = false, name = "created_at")
    private Date createdAt;

    @UpdateTimestamp
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "updated_at")
    private Date updatedAt;

    public Scenario() {}

    public Scenario(String content, Teacher teacher, AnswerTypeLvl1 correctAnswer) {
        this.content = content;
        this.teacher = teacher;
        this.correctAnswer = correctAnswer;
    }

    public Scenario(String content, boolean active, Teacher teacher) {
        this.content = content;
        this.active = active;
        this.teacher = teacher;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public Teacher getTeacher() { return teacher; }
    public void setTeacher(Teacher teacher) { this.teacher = teacher; }
    public Date getCreatedAt() { return createdAt; }
    public void setCreatedAt(Date createdAt) { this.createdAt = createdAt; }
    public Date getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Date updatedAt) { this.updatedAt = updatedAt; }
    public Classes getClassEntity() { return classEntity;}
    public void setClassEntity(Classes classEntity) { this.classEntity = classEntity;}
    public AnswerTypeLvl1 getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(AnswerTypeLvl1 correctAnswer) { this.correctAnswer = correctAnswer; }
}

// CodeRabbit audit trigger
