package com.simpolette.dcv.DcvServerApplication.features.devicetype;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "console_port_template")
public class ConsolePortTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String type; // e.g. "rj-45", "usb-mini-b"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_type_id")
    @JsonBackReference("devicetype-consoleports")
    private DeviceType deviceType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_type_id")
    @JsonBackReference("moduletype-consoleports")
    private ModuleType moduleType;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public DeviceType getDeviceType() { return deviceType; }
    public void setDeviceType(DeviceType deviceType) { this.deviceType = deviceType; }

    public ModuleType getModuleType() { return moduleType; }
    public void setModuleType(ModuleType moduleType) { this.moduleType = moduleType; }
}
