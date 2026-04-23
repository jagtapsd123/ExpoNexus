package com.amrut.peth.stallbooker.repository;

import com.amrut.peth.stallbooker.entity.IdSequence;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface IdSequenceRepository extends JpaRepository<IdSequence, String> {

    /**
     * Loads the sequence row with a pessimistic write lock (SELECT … FOR UPDATE).
     * Callers must be inside an active @Transactional context so that the lock
     * is held until the enclosing transaction commits, preventing duplicate IDs.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM IdSequence s WHERE s.name = :name")
    Optional<IdSequence> findByNameWithLock(@Param("name") String name);
}
