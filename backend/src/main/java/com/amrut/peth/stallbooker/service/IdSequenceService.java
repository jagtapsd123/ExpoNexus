package com.amrut.peth.stallbooker.service;

import com.amrut.peth.stallbooker.entity.IdSequence;
import com.amrut.peth.stallbooker.repository.IdSequenceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Generates zero-padded, human-readable IDs backed by a persistent sequence table.
 *
 * Concurrency guarantee: each call acquires a pessimistic write lock (SELECT FOR UPDATE)
 * on the sequence row, increments it, and saves — all within a single transaction.
 * This prevents duplicate IDs under concurrent load and is safe in multi-instance deployments.
 *
 * Propagation.REQUIRED means this method joins an existing transaction when called from
 * another transactional service (e.g. AuthService.register), so the sequence increment
 * and the entity save are committed atomically.
 */
@Service
public class IdSequenceService {

    private static final String MEMBER_SEQ = "member_id";
    private static final String EVENT_SEQ  = "event_id";

    private final IdSequenceRepository idSequenceRepository;

    public IdSequenceService(IdSequenceRepository idSequenceRepository) {
        this.idSequenceRepository = idSequenceRepository;
    }

    /** Returns the next memberId, e.g. MEM0001, MEM0002 … */
    @Transactional(propagation = Propagation.REQUIRED)
    public String nextMemberId() {
        return next(MEMBER_SEQ, "MEM", 4);
    }

    /** Returns the next eventId, e.g. EVT0001, EVT0002 … */
    @Transactional(propagation = Propagation.REQUIRED)
    public String nextEventId() {
        return next(EVENT_SEQ, "EVT", 4);
    }

    private String next(String sequenceName, String prefix, int digits) {
        IdSequence seq = idSequenceRepository.findByNameWithLock(sequenceName)
            .orElseGet(() -> {
                // Auto-create if missing (handles baseline-on-migrate skipping V2)
                IdSequence newSeq = new IdSequence();
                newSeq.setName(sequenceName);
                newSeq.setNextVal(1L);
                return idSequenceRepository.save(newSeq);
            });

        long value = seq.getNextVal();
        seq.setNextVal(value + 1);
        idSequenceRepository.save(seq);

        return String.format("%s%0" + digits + "d", prefix, value);
    }
}
