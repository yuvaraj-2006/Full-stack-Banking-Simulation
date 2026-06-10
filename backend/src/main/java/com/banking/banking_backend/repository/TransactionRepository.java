package com.banking.banking_backend.repository;

import com.banking.banking_backend.entity.Account;
import com.banking.banking_backend.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByAccountOrderByCreatedAtDesc(Account account);
}