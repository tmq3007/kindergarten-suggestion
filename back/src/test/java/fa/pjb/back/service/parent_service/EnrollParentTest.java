package fa.pjb.back.service.parent_service;

import fa.pjb.back.common.exception._14xx_data.RecordNotFoundException;
import fa.pjb.back.model.entity.ParentInSchool;
import fa.pjb.back.model.enums.EParentInSchool;
import fa.pjb.back.repository.ParentInSchoolRepository;
import fa.pjb.back.repository.UserRepository;
import fa.pjb.back.service.UserService;
import fa.pjb.back.service.impl.ParentServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.test.context.support.WithMockUser;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EnrollParentTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ParentInSchoolRepository parentInSchoolRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private ParentServiceImpl parentService;

    @Test
    @WithMockUser(roles = "SCHOOL_OWNER")
    void enrollParent_Success() {
        Integer pisId = 1;

        ParentInSchool pis = new ParentInSchool();
        pis.setId(pisId);
        pis.setStatus(EParentInSchool.PENDING.getValue());

        when(parentInSchoolRepository.findOneById(pisId)).thenReturn(Optional.of(pis));
        when(parentInSchoolRepository.save(any())).thenReturn(pis);

        Boolean result = parentService.enrollParent(pisId);

        assertTrue(result);
        assertEquals(EParentInSchool.ACTIVE.getValue(), pis.getStatus());
        assertEquals(LocalDate.now(), pis.getFrom());

        verify(parentInSchoolRepository).findOneById(pisId);
        verify(parentInSchoolRepository).save(pis);
    }

    @Test
    @WithMockUser(roles = "SCHOOL_OWNER")
    void enrollParent_NotFound_ThrowsException() {
        Integer pisId = 999;

        when(parentInSchoolRepository.findOneById(pisId)).thenReturn(Optional.empty());

        assertThrows(RecordNotFoundException.class, () -> {
            parentService.enrollParent(pisId);
        });

        verify(parentInSchoolRepository).findOneById(pisId);
        verify(parentInSchoolRepository, never()).save(any());
    }

    @Test
    @WithMockUser(roles = "SCHOOL_OWNER")
    void enrollParent_StatusChangeToActive() {
        Integer pisId = 2;
        ParentInSchool pis = new ParentInSchool();
        pis.setId(pisId);
        pis.setStatus(EParentInSchool.PENDING.getValue());

        when(parentInSchoolRepository.findOneById(pisId)).thenReturn(Optional.of(pis));

        parentService.enrollParent(pisId);

        assertEquals(EParentInSchool.ACTIVE.getValue(), pis.getStatus());
        assertEquals(LocalDate.now(), pis.getFrom());

        verify(parentInSchoolRepository).save(pis);
    }
}
