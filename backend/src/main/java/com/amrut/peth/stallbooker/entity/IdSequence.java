package com.amrut.peth.stallbooker.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Persistent counter table used for concurrency-safe generation of
 * human-readable IDs (memberId, eventId).  A SELECT FOR UPDATE lock
 * is acquired on the relevant row before incrementing, so concurrent
 * requests never receive the same value even in a multi-thread or
 * multi-instance deployment.
 */
@Entity
@Table(name = "id_sequences")
public class IdSequence {

    @Id
    @Column(name = "name", length = 50, nullable = false)
    private String name;

    @Column(name = "next_val", nullable = false)
    private long nextVal;

    public IdSequence() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public long getNextVal() { return nextVal; }
    public void setNextVal(long nextVal) { this.nextVal = nextVal; }
}
