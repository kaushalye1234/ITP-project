package com.itp.skilledworker.repository;

import com.itp.skilledworker.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Integer> {
    List<Message> findByThreadIdOrderByCreatedAtAsc(Integer threadId);
}
