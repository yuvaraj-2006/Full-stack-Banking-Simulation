package com.banking.banking_backend.repository;

import com.banking.banking_backend.entity.Account;
import com.banking.banking_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUser(User user);

    Optional<Account> findByAccountNumber(String accountNumber);
}