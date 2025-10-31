package capstone.cyberkids.CyberKids.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "classes", uniqueConstraints = @UniqueConstraint(columnNames = {"grade", "section", "teacher_id"}))
public class Classes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String grade;

    @Column(nullable = false)
    private String section;

    @Column(nullable = false)
    private String colorTheme;

    @Column(nullable = true)
    private Integer maxStudents;

    @Column(nullable = false, unique = true)
    private String classCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @OneToMany(mappedBy = "classEntity", cascade = CascadeType.ALL)
    @JsonManagedReference
    private List<Student> students;

    @CreationTimestamp
    @Column(updatable = false, name = "created_at")
    private Date createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Date updatedAt;

    @ElementCollection
    @CollectionTable(name = "class_locked_worlds", joinColumns = @JoinColumn(name = "class_id"))
    @Column(name = "world_name")
    private Set<String> lockedWorlds = new HashSet<>();

    public Classes() {}

    public Classes(String grade, String section, Teacher teacher, String classCode, String colorTheme, Integer maxStudents) {
        this.grade = grade;
        this.section = section;
        this.teacher = teacher;
        this.classCode = classCode;
        this.colorTheme = colorTheme;
        this.maxStudents = maxStudents;
    }


    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
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

    public String getColorTheme() { return colorTheme; }

    public Integer getMaxStudents() { return maxStudents; }

    public Teacher getTeacher() {
        return teacher;
    }
    public void setTeacher(Teacher teacher) {
        this.teacher = teacher;
    }

    public Date getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }
    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getClassCode() {
        return classCode;
    }
    public void setClassCode(String classCode) {
        this.classCode = classCode;
    }

    public List<Student> getStudents() {return students;}
    public void setStudents(List<Student> students) {this.students = students;}

    public Set<String> getLockedWorlds() { return lockedWorlds; }
    public void setLockedWorlds(Set<String> lockedWorlds) { this.lockedWorlds = lockedWorlds; }
}