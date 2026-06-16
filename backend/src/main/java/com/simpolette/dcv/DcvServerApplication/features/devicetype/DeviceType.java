package com.simpolette.dcv.DcvServerApplication.features.devicetype;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "device_type")
public class DeviceType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    @Column(name = "height_u", nullable = false)
    private int heightU;

    @Column(name = "width_mm")
    private Float widthMm;

    @Column(name = "depth_mm")
    private Float depthMm;

    @Column(name = "weight_kg")
    private Float weightKg;

    @Column(name = "image_path")
    private String imagePath;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public enum Category {
        COMPUTE, NETWORK, STORAGE
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = Instant.now();
    }

    // Getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public int getHeightU() {
        return heightU;
    }

    public void setHeightU(int heightU) {
        this.heightU = heightU;
    }

    public Float getWidthMm() {
        return widthMm;
    }

    public void setWidthMm(Float widthMm) {
        this.widthMm = widthMm;
    }

    public Float getDepthMm() {
        return depthMm;
    }

    public void setDepthMm(Float depthMm) {
        this.depthMm = depthMm;
    }

    public Float getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(Float weightKg) {
        this.weightKg = weightKg;
    }

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
