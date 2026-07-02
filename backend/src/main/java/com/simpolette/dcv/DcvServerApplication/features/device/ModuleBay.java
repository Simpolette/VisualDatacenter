package com.simpolette.dcv.DcvServerApplication.features.device;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

@Entity
@Table(name = "device_module_bay")
public class ModuleBay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String label;

    private String position;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    @JsonBackReference("device-modulebays")
    private Device device;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "installed_module_id")
    @JsonManagedReference("modulebay-module")
    private Module installedModule;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }

    public Device getDevice() { return device; }
    public void setDevice(Device device) { this.device = device; }

    public Module getInstalledModule() { return installedModule; }
    public void setInstalledModule(Module installedModule) { this.installedModule = installedModule; }
}
