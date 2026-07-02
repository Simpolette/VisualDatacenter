package com.simpolette.dcv.DcvServerApplication.features.room;

import com.simpolette.dcv.DcvServerApplication.features.rack.Rack;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "room")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String location;

    @Column(name = "width_m", nullable = false)
    private float widthM;

    @Column(name = "length_m", nullable = false)
    private float lengthM;


    @Column(name = "floor_plan_image")
    private String floorPlanImage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Rack> racks = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    // Getters and setters

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public float getWidthM() { return widthM; }
    public void setWidthM(float widthM) { this.widthM = widthM; }

    public float getLengthM() { return lengthM; }
    public void setLengthM(float lengthM) { this.lengthM = lengthM; }


    public String getFloorPlanImage() { return floorPlanImage; }
    public void setFloorPlanImage(String floorPlanImage) { this.floorPlanImage = floorPlanImage; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public List<Rack> getRacks() { return racks; }
    public void setRacks(List<Rack> racks) { this.racks = racks; }
}
