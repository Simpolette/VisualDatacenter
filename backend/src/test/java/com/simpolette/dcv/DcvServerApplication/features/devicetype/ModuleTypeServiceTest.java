package com.simpolette.dcv.DcvServerApplication.features.devicetype;

import com.simpolette.dcv.DcvServerApplication.common.exception.ResourceNotFoundException;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.dto.CreateModuleTypeDTO;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.dto.InterfaceTemplateDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ModuleTypeServiceTest {

    @Mock
    private ModuleTypeRepository moduleTypeRepository;

    @InjectMocks
    private ModuleTypeService moduleTypeService;

    private ModuleType moduleType;

    @BeforeEach
    void setUp() {
        moduleType = new ModuleType();
        moduleType.setId(50L);
        moduleType.setManufacturer("Cisco");
        moduleType.setModel("C3850-NM-4-10G");
    }

    @Test
    @DisplayName("Should find all module types")
    void findAll_Success() {
        when(moduleTypeRepository.findAll()).thenReturn(List.of(moduleType));

        List<ModuleType> list = moduleTypeService.findAll();

        assertThat(list).hasSize(1);
        assertThat(list.get(0).getModel()).isEqualTo("C3850-NM-4-10G");
    }

    @Test
    @DisplayName("Should find module type by ID")
    void findById_Success() {
        when(moduleTypeRepository.findById(50L)).thenReturn(Optional.of(moduleType));

        ModuleType found = moduleTypeService.findById(50L);

        assertThat(found.getManufacturer()).isEqualTo("Cisco");
    }

    @Test
    @DisplayName("Should create module type with interface templates")
    void create_Success() {
        InterfaceTemplateDTO intDto = new InterfaceTemplateDTO("TenGigabitEthernet1/1", "10gbase-x-sfpp", false);
        CreateModuleTypeDTO dto = new CreateModuleTypeDTO("Cisco", "C3850-NM-4-10G", "NM-4-10G", List.of(intDto), null, null);

        when(moduleTypeRepository.save(any(ModuleType.class))).thenAnswer(i -> {
            ModuleType mt = i.getArgument(0);
            mt.setId(51L);
            return mt;
        });

        ModuleType created = moduleTypeService.create(dto);

        assertThat(created.getId()).isEqualTo(51L);
        assertThat(created.getInterfaces()).hasSize(1);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when module type not found")
    void findById_NotFound_ThrowsException() {
        when(moduleTypeRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> moduleTypeService.findById(999L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
