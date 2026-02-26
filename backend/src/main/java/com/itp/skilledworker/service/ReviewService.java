package com.itp.skilledworker.service;

import com.itp.skilledworker.entity.*;
import com.itp.skilledworker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ComplaintRepository complaintRepository;
    private final MessageRepository messageRepository;
    private final MessageThreadRepository messageThreadRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;

    @Transactional
    public Review submitReview(Integer bookingId, Integer reviewerUserId, Integer revieweeUserId,
            Integer rating, String reviewText, String reviewerType) {
        if (reviewRepository.existsByBooking_BookingIdAndReviewer_UserId(bookingId, reviewerUserId)) {
            throw new RuntimeException("Review already submitted for this booking");
        }
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        if (booking.getBookingStatus() != Booking.BookingStatus.completed) {
            throw new RuntimeException("Can only review completed bookings");
        }
        User reviewer = userRepository.findById(reviewerUserId)
                .orElseThrow(() -> new RuntimeException("Reviewer not found"));
        User reviewee = userRepository.findById(revieweeUserId)
                .orElseThrow(() -> new RuntimeException("Reviewee not found"));

        Review review = new Review();
        review.setBooking(booking);
        review.setReviewer(reviewer);
        review.setReviewee(reviewee);
        review.setOverallRating(rating);
        review.setReviewText(reviewText);
        review.setReviewerType(Review.ReviewerType.valueOf(reviewerType.toLowerCase()));
        return reviewRepository.save(review);
    }

    public List<Review> getReviewsForWorker(Integer workerUserId) {
        return reviewRepository.findByReviewee_UserId(workerUserId);
    }

    public List<Review> getAllReviews() {
        return reviewRepository.findAll();
    }

    public List<Review> getMyReviews(Integer reviewerUserId) {
        return reviewRepository.findByReviewer_UserId(reviewerUserId);
    }

    public List<Complaint> getMyComplaints(Integer complainantUserId) {
        return complaintRepository.findByComplainant_UserId(complainantUserId);
    }

    @Transactional
    public Complaint submitComplaint(Integer complainantUserId, String category,
            String title, String description, Integer bookingId) {
        User complainant = userRepository.findById(complainantUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Complaint complaint = new Complaint();
        complaint.setComplainant(complainant);
        complaint.setComplaintCategory(Complaint.ComplaintCategory.valueOf(category.toLowerCase()));
        complaint.setComplaintTitle(title);
        complaint.setComplaintDescription(description);
        complaint.setComplaintStatus(Complaint.ComplaintStatus.pending);
        if (bookingId != null) {
            bookingRepository.findById(bookingId).ifPresent(complaint::setBooking);
        }
        return complaintRepository.save(complaint);
    }

    public List<Complaint> getAllComplaints() {
        return complaintRepository.findAll();
    }

    @Transactional
    public Complaint updateComplaintStatus(Integer complaintId, String status) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        complaint.setComplaintStatus(Complaint.ComplaintStatus.valueOf(status.toLowerCase()));
        if (status.equalsIgnoreCase("resolved")) {
            complaint.setResolvedAt(java.time.LocalDateTime.now());
        }
        return complaintRepository.save(complaint);
    }

    @Transactional
    public Message sendMessage(Integer threadId, Integer senderUserId, String messageText) {
        User sender = userRepository.findById(senderUserId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Message message = new Message();
        message.setThreadId(threadId);
        message.setSender(sender);
        message.setMessageText(messageText);
        return messageRepository.save(message);
    }

    public List<Message> getThreadMessages(Integer threadId) {
        return messageRepository.findByThreadIdOrderByCreatedAtAsc(threadId);
    }

    @Transactional
    public MessageThread createThread(Integer userId1, Integer userId2, Integer bookingId) {
        User p1 = userRepository.findById(userId1).orElseThrow(() -> new RuntimeException("User not found"));
        User p2 = userRepository.findById(userId2).orElseThrow(() -> new RuntimeException("User not found"));
        MessageThread thread = new MessageThread();
        thread.setParticipant1(p1);
        thread.setParticipant2(p2);
        if (bookingId != null) {
            bookingRepository.findById(bookingId).ifPresent(thread::setBooking);
        }
        return messageThreadRepository.save(thread);
    }

    public List<MessageThread> getUserThreads(Integer userId) {
        return messageThreadRepository.findByParticipant1_UserIdOrParticipant2_UserId(userId, userId);
    }

    @Transactional
    public void deleteReview(Integer reviewId, Integer requestingUserId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        // Allow deletion only by the original reviewer or admin
        if (!review.getReviewer().getUserId().equals(requestingUserId)) {
            User actor = userRepository.findById(requestingUserId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            if (!actor.getRole().name().equalsIgnoreCase("admin")) {
                throw new RuntimeException("Not authorized to delete this review");
            }
        }
        reviewRepository.delete(review);
    }

    @Transactional
    public void deleteComplaint(Integer complaintId, Integer requestingUserId) {
        Complaint complaint = complaintRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        // Allow deletion only by the complainant or admin
        if (!complaint.getComplainant().getUserId().equals(requestingUserId)) {
            User actor = userRepository.findById(requestingUserId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            if (!actor.getRole().name().equalsIgnoreCase("admin")) {
                throw new RuntimeException("Not authorized to delete this complaint");
            }
        }
        complaintRepository.delete(complaint);
    }

    @Transactional
    public Review updateReview(Integer reviewId, Integer requestingUserId, Integer rating, String reviewText) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        if (!review.getReviewer().getUserId().equals(requestingUserId)) {
            throw new RuntimeException("Not authorized to edit this review");
        }
        if (rating != null)
            review.setOverallRating(rating);
        if (reviewText != null)
            review.setReviewText(reviewText);
        return reviewRepository.save(review);
    }
}
