package com.simpolette.dcv.DcvServerApplication.features.devicetype;

import com.simpolette.dcv.DcvServerApplication.common.exception.ResourceNotFoundException;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.dto.CreateModuleTypeDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ModuleTypeService {

    private final ModuleTypeRepository moduleTypeRepository;

    public ModuleTypeService(ModuleTypeRepository moduleTypeRepository) {
        this.moduleTypeRepository = moduleTypeRepository;
    }

    public List<ModuleType> findAll() {
        return moduleTypeRepository.findAll();
    }

    public ModuleType findById(Long id) {
        return moduleTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ModuleType", id));
    }

    public ModuleType create(CreateModuleTypeDTO dto) {
        ModuleType moduleType = new ModuleType();
        moduleType.setManufacturer(dto.manufacturer());
        moduleType.setModel(dto.model());
        moduleType.setPartNumber(dto.partNumber());

        if (dto.interfaces() != null) {
            for (var idto : dto.interfaces()) {
                InterfaceTemplate t = new InterfaceTemplate();
                t.setName(idto.name());
                t.setType(idto.type());
                t.setMgmtOnly(idto.mgmtOnly());
                moduleType.addInterfaceTemplate(t);
            }
        }

        if (dto.powerPorts() != null) {
            for (var pdto : dto.powerPorts()) {
                PowerPortTemplate t = new PowerPortTemplate();
                t.setName(pdto.name());
                t.setType(pdto.type());
                moduleType.addPowerPortTemplate(t);
            }
        }

        if (dto.consolePorts() != null) {
            for (var cdto : dto.consolePorts()) {
                ConsolePortTemplate t = new ConsolePortTemplate();
                t.setName(cdto.name());
                t.setType(cdto.type());
                moduleType.addConsolePortTemplate(t);
            }
        }

        return moduleTypeRepository.save(moduleType);
    }

    public void delete(Long id) {
        ModuleType moduleType = moduleTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ModuleType", id));
        moduleTypeRepository.delete(moduleType);
    }
}
