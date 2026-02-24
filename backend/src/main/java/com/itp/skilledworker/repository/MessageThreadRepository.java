package com.itp.skilledworker.repository;

import com.itp.skilledworker.entity.MessageThread;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageThreadRepository extends JpaRepository<MessageThread, Integer> {
    List<MessageThread> findByParticipant1_UserIdOrParticipant2_UserId(Integer userId1, Integer userId2);
}
