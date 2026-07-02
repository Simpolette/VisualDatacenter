package com.simpolette.dcv.DcvServerApplication.features.devicetype;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;

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

    @Column(name = "length_mm")
    private Float lengthMm;

    @Column(name = "weight_kg")
    private Float weightKg;

    @Column(name = "image_path")
    private String imagePath;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "deviceType", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("devicetype-interfaces")
    private List<InterfaceTemplate> interfaces = new ArrayList<>();

    @OneToMany(mappedBy = "deviceType", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("devicetype-powerports")
    private List<PowerPortTemplate> powerPorts = new ArrayList<>();

    @OneToMany(mappedBy = "deviceType", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("devicetype-consoleports")
    private List<ConsolePortTemplate> consolePorts = new ArrayList<>();

    @OneToMany(mappedBy = "deviceType", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("devicetype-modulebays")
    private List<ModuleBayTemplate> moduleBays = new ArrayList<>();

    public void addInterfaceTemplate(InterfaceTemplate t) {
        interfaces.add(t);
        t.setDeviceType(this);
    }

    public void addPowerPortTemplate(PowerPortTemplate t) {
        powerPorts.add(t);
        t.setDeviceType(this);
    }

    public void addConsolePortTemplate(ConsolePortTemplate t) {
        consolePorts.add(t);
        t.setDeviceType(this);
    }

    public void addModuleBayTemplate(ModuleBayTemplate t) {
        moduleBays.add(t);
        t.setDeviceType(this);
    }

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

    public Float getLengthMm() {
        return lengthMm;
    }

    public void setLengthMm(Float lengthMm) {
        this.lengthMm = lengthMm;
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

    public List<InterfaceTemplate> getInterfaces() {
        return interfaces;
    }

    public void setInterfaces(List<InterfaceTemplate> interfaces) {
        this.interfaces = interfaces;
    }

    public List<PowerPortTemplate> getPowerPorts() {
        return powerPorts;
    }

    public void setPowerPorts(List<PowerPortTemplate> powerPorts) {
        this.powerPorts = powerPorts;
    }

    public List<ConsolePortTemplate> getConsolePorts() {
        return consolePorts;
    }

    public void setConsolePorts(List<ConsolePortTemplate> consolePorts) {
        this.consolePorts = consolePorts;
    }

    public List<ModuleBayTemplate> getModuleBays() {
        return moduleBays;
    }

    public void setModuleBays(List<ModuleBayTemplate> moduleBays) {
        this.moduleBays = moduleBays;
    }
}
