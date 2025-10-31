package capstone.cyberkids.CyberKids.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_status_log")
public class StudentStatusLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "student_id")
    private Student student;

    private boolean isOnline;
    private LocalDateTime timestamp;

    public StudentStatusLog() {}

    public StudentStatusLog(Student student, boolean isOnline, LocalDateTime timestamp) {
        this.student = student;
        this.isOnline = isOnline;
        this.timestamp = timestamp;
    }

    public Long getId() { return id; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public boolean isOnline() { return isOnline; }
    public void setOnline(boolean online) { isOnline = online; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
