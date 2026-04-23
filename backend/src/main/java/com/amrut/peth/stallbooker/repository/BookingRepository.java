package com.amrut.peth.stallbooker.repository;

import com.amrut.peth.stallbooker.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByBookingNumber(String bookingNumber);

    Page<Booking> findByExhibitorId(Long exhibitorId, Pageable pageable);

    Page<Booking> findByExhibitionId(Long exhibitionId, Pageable pageable);

    List<Booking> findByExhibitorIdAndStatus(Long exhibitorId, Booking.BookingStatus status);

    boolean existsByStallIdAndStatusNot(Long stallId, Booking.BookingStatus status);

    @Query(value = """
        SELECT b FROM Booking b
        JOIN FETCH b.exhibitor ex
        JOIN FETCH b.exhibition ev
        WHERE (:exhibitorId IS NULL OR ex.id = :exhibitorId)
          AND (:exhibitionId IS NULL OR ev.id = :exhibitionId)
          AND (:status IS NULL OR b.status = :status)
          AND (:search IS NULL
               OR LOWER(b.bookingNumber)  LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(ex.name)          LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(ex.memberId)      LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(ev.name)          LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(ev.eventId)       LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY b.createdAt DESC
        """,
        countQuery = """
        SELECT COUNT(b) FROM Booking b
        JOIN b.exhibitor ex
        JOIN b.exhibition ev
        WHERE (:exhibitorId IS NULL OR ex.id = :exhibitorId)
          AND (:exhibitionId IS NULL OR ev.id = :exhibitionId)
          AND (:status IS NULL OR b.status = :status)
          AND (:search IS NULL
               OR LOWER(b.bookingNumber)  LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(ex.name)          LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(ex.memberId)      LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(ev.name)          LIKE LOWER(CONCAT('%', :search, '%'))
               OR LOWER(ev.eventId)       LIKE LOWER(CONCAT('%', :search, '%')))
        """)
    Page<Booking> searchBookings(
        @Param("exhibitorId") Long exhibitorId,
        @Param("exhibitionId") Long exhibitionId,
        @Param("status") Booking.BookingStatus status,
        @Param("search") String search,
        Pageable pageable
    );

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status")
    long countByStatus(@Param("status") Booking.BookingStatus status);

    @Query("SELECT SUM(b.total) FROM Booking b WHERE b.paymentStatus = 'PAID'")
    Double sumTotalRevenue();

    @Query("SELECT SUM(b.total) FROM Booking b WHERE b.exhibition.id = :exhibitionId AND b.paymentStatus = 'PAID'")
    Double sumRevenueByExhibition(@Param("exhibitionId") Long exhibitionId);

    @Query("""
        SELECT b FROM Booking b
        JOIN FETCH b.exhibitor ex
        JOIN FETCH b.exhibition ev
        WHERE ex.id = :exhibitorId
          AND b.endDate >= :today
          AND b.status <> 'CANCELLED'
        ORDER BY b.startDate ASC
        """)
    List<Booking> findUpcomingByExhibitor(@Param("exhibitorId") Long exhibitorId,
                                          @Param("today") LocalDate today);

    @Query("""
        SELECT b FROM Booking b
        JOIN FETCH b.exhibitor ex
        JOIN FETCH b.exhibition ev
        WHERE ex.id = :exhibitorId
          AND b.endDate < :today
        ORDER BY b.startDate DESC
        """)
    List<Booking> findPastByExhibitor(@Param("exhibitorId") Long exhibitorId,
                                      @Param("today") LocalDate today);

    @Query("SELECT SUM(b.total) FROM Booking b WHERE b.exhibitor.id = :exhibitorId AND b.paymentStatus = 'PAID'")
    Double sumTotalSalesByExhibitor(@Param("exhibitorId") Long exhibitorId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.exhibitor.id = :exhibitorId AND b.status = :status")
    long countByExhibitorIdAndStatus(@Param("exhibitorId") Long exhibitorId,
                                     @Param("status") Booking.BookingStatus status);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.exhibitor.id = :exhibitorId AND b.endDate >= :today AND b.status <> 'CANCELLED'")
    long countUpcomingByExhibitor(@Param("exhibitorId") Long exhibitorId,
                                  @Param("today") LocalDate today);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.exhibitor.id = :exhibitorId AND b.endDate < :today")
    long countPastByExhibitor(@Param("exhibitorId") Long exhibitorId,
                              @Param("today") LocalDate today);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.exhibitor.id = :exhibitorId AND b.paymentStatus = 'REFUNDED'")
    long countRefundsByExhibitor(@Param("exhibitorId") Long exhibitorId);
}
