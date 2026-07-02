package com.simpolette.dcv.DcvServerApplication.features.rack;

import com.simpolette.dcv.DcvServerApplication.features.device.Device;
import com.simpolette.dcv.DcvServerApplication.features.pdu.Pdu;
import com.simpolette.dcv.DcvServerApplication.features.room.Room;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rack")
public class Rack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    @JsonBackReference
    private Room room;

    @Column(nullable = false)
    private String name;

    @Column(name = "total_units", nullable = false)
    private int totalUnits;

    @Column(name = "pos_x", nullable = false)
    private float posX;

    @Column(name = "pos_y", nullable = false)
    private float posY;

    @Column(name = "rotation_deg")
    private float rotationDeg;

    @Column(name = "length", nullable = false)
    private float length = 1.0f;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @OneToMany(mappedBy = "rack", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("rack-devices")
    private List<Device> devices = new ArrayList<>();

    @OneToMany(mappedBy = "rack", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("rack-pdus")
    private List<Pdu> pdus = new ArrayList<>();

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

    public Room getRoom() { return room; }
    public void setRoom(Room room) { this.room = room; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getTotalUnits() { return totalUnits; }
    public void setTotalUnits(int totalUnits) { this.totalUnits = totalUnits; }

    public float getPosX() { return posX; }
    public void setPosX(float posX) { this.posX = posX; }

    public float getPosY() { return posY; }
    public void setPosY(float posY) { this.posY = posY; }

    public float getRotationDeg() { return rotationDeg; }
    public void setRotationDeg(float rotationDeg) { this.rotationDeg = rotationDeg; }

    public float getLength() { return length; }
    public void setLength(float length) { this.length = length; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public List<Device> getDevices() { return devices; }
    public void setDevices(List<Device> devices) { this.devices = devices; }

    public List<Pdu> getPdus() { return pdus; }
    public void setPdus(List<Pdu> pdus) { this.pdus = pdus; }
}
