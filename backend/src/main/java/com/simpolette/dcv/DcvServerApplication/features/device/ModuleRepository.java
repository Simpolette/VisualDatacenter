package com.simpolette.dcv.DcvServerApplication.features.device;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ModuleRepository extends JpaRepository<Module, Long> {
}
