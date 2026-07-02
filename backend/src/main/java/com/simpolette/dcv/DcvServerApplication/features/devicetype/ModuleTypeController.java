package com.simpolette.dcv.DcvServerApplication.features.devicetype;

import com.simpolette.dcv.DcvServerApplication.features.devicetype.dto.CreateModuleTypeDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/module-types")
public class ModuleTypeController {

    private final ModuleTypeService moduleTypeService;

    public ModuleTypeController(ModuleTypeService moduleTypeService) {
        this.moduleTypeService = moduleTypeService;
    }

    @GetMapping
    public ResponseEntity<List<ModuleType>> list() {
        return ResponseEntity.ok(moduleTypeService.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ModuleType> getById(@PathVariable Long id) {
        return ResponseEntity.ok(moduleTypeService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ModuleType> create(@Valid @RequestBody CreateModuleTypeDTO dto) {
        ModuleType created = moduleTypeService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        moduleTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
