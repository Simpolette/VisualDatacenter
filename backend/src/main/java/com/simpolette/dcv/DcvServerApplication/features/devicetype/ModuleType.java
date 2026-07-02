package com.simpolette.dcv.DcvServerApplication.features.devicetype;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "module_type")
public class ModuleType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String manufacturer;

    @Column(nullable = false)
    private String model;

    @Column(name = "part_number")
    private String partNumber;

    @OneToMany(mappedBy = "moduleType", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("moduletype-interfaces")
    private List<InterfaceTemplate> interfaces = new ArrayList<>();

    @OneToMany(mappedBy = "moduleType", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("moduletype-powerports")
    private List<PowerPortTemplate> powerPorts = new ArrayList<>();

    @OneToMany(mappedBy = "moduleType", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("moduletype-consoleports")
    private List<ConsolePortTemplate> consolePorts = new ArrayList<>();

    // Helper methods to maintain bidirectional relationship
    public void addInterfaceTemplate(InterfaceTemplate t) {
        interfaces.add(t);
        t.setModuleType(this);
    }

    public void addPowerPortTemplate(PowerPortTemplate t) {
        powerPorts.add(t);
        t.setModuleType(this);
    }

    public void addConsolePortTemplate(ConsolePortTemplate t) {
        consolePorts.add(t);
        t.setModuleType(this);
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getManufacturer() { return manufacturer; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getPartNumber() { return partNumber; }
    public void setPartNumber(String partNumber) { this.partNumber = partNumber; }

    public List<InterfaceTemplate> getInterfaces() { return interfaces; }
    public void setInterfaces(List<InterfaceTemplate> interfaces) { this.interfaces = interfaces; }

    public List<PowerPortTemplate> getPowerPorts() { return powerPorts; }
    public void setPowerPorts(List<PowerPortTemplate> powerPorts) { this.powerPorts = powerPorts; }

    public List<ConsolePortTemplate> getConsolePorts() { return consolePorts; }
    public void setConsolePorts(List<ConsolePortTemplate> consolePorts) { this.consolePorts = consolePorts; }
}
