package com.simpolette.dcv.DcvServerApplication.features.pdu;

import com.simpolette.dcv.DcvServerApplication.features.rack.Rack;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "pdu")
public class Pdu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rack_id", nullable = false)
    @JsonBackReference("rack-pdus")
    private Rack rack;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Position position;

    @Column(name = "outlet_count", nullable = false)
    private int outletCount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public enum Position {
        LEFT, RIGHT, REAR
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    // Getters and setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Rack getRack() { return rack; }
    public void setRack(Rack rack) { this.rack = rack; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Position getPosition() { return position; }
    public void setPosition(Position position) { this.position = position; }

    public int getOutletCount() { return outletCount; }
    public void setOutletCount(int outletCount) { this.outletCount = outletCount; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
