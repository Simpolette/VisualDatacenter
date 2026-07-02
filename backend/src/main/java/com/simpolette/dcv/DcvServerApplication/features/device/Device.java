package com.simpolette.dcv.DcvServerApplication.features.device;

import com.simpolette.dcv.DcvServerApplication.features.devicetype.DeviceType;
import com.simpolette.dcv.DcvServerApplication.features.rack.Rack;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "device")
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rack_id", nullable = false)
    @JsonBackReference("rack-devices")
    private Rack rack;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "device_type_id", nullable = false)
    private DeviceType deviceType;

    private String name;

    @Column(name = "start_u", nullable = false)
    private int startU;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Face face = Face.FRONT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @OneToMany(mappedBy = "device", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("device-interfaces")
    private List<Interface> interfaces = new ArrayList<>();

    @OneToMany(mappedBy = "device", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("device-powerports")
    private List<PowerPort> powerPorts = new ArrayList<>();

    @OneToMany(mappedBy = "device", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("device-consoleports")
    private List<ConsolePort> consolePorts = new ArrayList<>();

    @OneToMany(mappedBy = "device", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("device-modulebays")
    private List<ModuleBay> moduleBays = new ArrayList<>();

    @OneToMany(mappedBy = "device", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("device-modules")
    private List<Module> modules = new ArrayList<>();

    public void addInterface(Interface i) {
        interfaces.add(i);
        i.setDevice(this);
    }

    public void addPowerPort(PowerPort p) {
        powerPorts.add(p);
        p.setDevice(this);
    }

    public void addConsolePort(ConsolePort c) {
        consolePorts.add(c);
        c.setDevice(this);
    }

    public void addModuleBay(ModuleBay mb) {
        moduleBays.add(mb);
        mb.setDevice(this);
    }

    public void addModule(Module m) {
        modules.add(m);
        m.setDevice(this);
    }

    public enum Face {
        FRONT, REAR
    }

    public enum Status {
        ACTIVE, MAINTENANCE, OFFLINE
    }

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

    public Rack getRack() { return rack; }
    public void setRack(Rack rack) { this.rack = rack; }

    public DeviceType getDeviceType() { return deviceType; }
    public void setDeviceType(DeviceType deviceType) { this.deviceType = deviceType; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getStartU() { return startU; }
    public void setStartU(int startU) { this.startU = startU; }

    public Face getFace() { return face; }
    public void setFace(Face face) { this.face = face; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public List<Interface> getInterfaces() { return interfaces; }
    public void setInterfaces(List<Interface> interfaces) { this.interfaces = interfaces; }

    public List<PowerPort> getPowerPorts() { return powerPorts; }
    public void setPowerPorts(List<PowerPort> powerPorts) { this.powerPorts = powerPorts; }

    public List<ConsolePort> getConsolePorts() { return consolePorts; }
    public void setConsolePorts(List<ConsolePort> consolePorts) { this.consolePorts = consolePorts; }

    public List<ModuleBay> getModuleBays() { return moduleBays; }
    public void setModuleBays(List<ModuleBay> moduleBays) { this.moduleBays = moduleBays; }

    public List<Module> getModules() { return modules; }
    public void setModules(List<Module> modules) { this.modules = modules; }
}
