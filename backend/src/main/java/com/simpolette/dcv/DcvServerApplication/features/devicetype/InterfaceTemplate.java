package com.simpolette.dcv.DcvServerApplication.features.devicetype;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;

@Entity
@Table(name = "interface_template")
public class InterfaceTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // e.g. "1000base-t", "10gbase-x-sfpp"

    @Column(name = "mgmt_only", nullable = false)
    private boolean mgmtOnly = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_type_id")
    @JsonBackReference("devicetype-interfaces")
    private DeviceType deviceType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_type_id")
    @JsonBackReference("moduletype-interfaces")
    private ModuleType moduleType;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public boolean isMgmtOnly() { return mgmtOnly; }
    public void setMgmtOnly(boolean mgmtOnly) { this.mgmtOnly = mgmtOnly; }

    public DeviceType getDeviceType() { return deviceType; }
    public void setDeviceType(DeviceType deviceType) { this.deviceType = deviceType; }

    public ModuleType getModuleType() { return moduleType; }
    public void setModuleType(ModuleType moduleType) { this.moduleType = moduleType; }
}
