package com.simpolette.dcv.DcvServerApplication.features.device;

import com.simpolette.dcv.DcvServerApplication.features.devicetype.ModuleType;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "device_module")
public class Module {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    @JsonBackReference("device-modules")
    private Device device;

    @OneToOne(mappedBy = "installedModule", fetch = FetchType.LAZY)
    @JsonBackReference("modulebay-module")
    private ModuleBay moduleBay;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "module_type_id", nullable = false)
    private ModuleType moduleType;

    @Column(nullable = false)
    private String status = "ACTIVE"; // e.g. "ACTIVE", "OFFLINE"

    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("module-interfaces")
    private List<Interface> interfaces = new ArrayList<>();

    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("module-powerports")
    private List<PowerPort> powerPorts = new ArrayList<>();

    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("module-consoleports")
    private List<ConsolePort> consolePorts = new ArrayList<>();

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Device getDevice() { return device; }
    public void setDevice(Device device) { this.device = device; }

    public ModuleBay getModuleBay() { return moduleBay; }
    public void setModuleBay(ModuleBay moduleBay) { this.moduleBay = moduleBay; }

    public ModuleType getModuleType() { return moduleType; }
    public void setModuleType(ModuleType moduleType) { this.moduleType = moduleType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public List<Interface> getInterfaces() { return interfaces; }
    public void setInterfaces(List<Interface> interfaces) { this.interfaces = interfaces; }

    public List<PowerPort> getPowerPorts() { return powerPorts; }
    public void setPowerPorts(List<PowerPort> powerPorts) { this.powerPorts = powerPorts; }

    public List<ConsolePort> getConsolePorts() { return consolePorts; }
    public void setConsolePorts(List<ConsolePort> consolePorts) { this.consolePorts = consolePorts; }
}
