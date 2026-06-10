package com.banking.banking_backend.service;

import com.banking.banking_backend.dto.*;
import com.banking.banking_backend.entity.*;
import com.banking.banking_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountService {

    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    // Create account
    public AccountResponse createAccount(String email, AccountRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Account account = new Account();
        account.setAccountNumber(generateAccountNumber());
        account.setAccountType(request.getAccountType());
        account.setBalance(BigDecimal.ZERO);
        account.setUser(user);

        accountRepository.save(account);
        return mapToResponse(account);
    }

    // Get all accounts for user
    public List<AccountResponse> getAccounts(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return accountRepository.findByUser(user)
                .stream().map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // Deposit
    @Transactional
    public TransactionResponse deposit(String email, TransactionRequest request) {
        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new RuntimeException("Account not found"));

        account.setBalance(account.getBalance().add(request.getAmount()));
        accountRepository.save(account);

        return saveTransaction(account, "DEPOSIT", request.getAmount(), request.getDescription());
    }

    // Withdrawal
    @Transactional
    public TransactionResponse withdraw(String email, TransactionRequest request) {
        Account account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (account.getBalance().compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        account.setBalance(account.getBalance().subtract(request.getAmount()));
        accountRepository.save(account);

        return saveTransaction(account, "WITHDRAWAL", request.getAmount(), request.getDescription());
    }

    // Transfer
    @Transactional
    public TransactionResponse transfer(String email, TransferRequest request) {

        Account fromAccount = accountRepository.findById(request.getFromAccountId())
                .orElseThrow(() -> new RuntimeException("Sender account not found"));

        Account toAccount = accountRepository.findByAccountNumber(request.getToAccountNumber())
                .orElseThrow(() -> new RuntimeException("Receiver account not found"));

        if (fromAccount.getId().equals(toAccount.getId())) {
            throw new RuntimeException("Cannot transfer to the same account");
        }

        if (fromAccount.getBalance().compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        // Debit sender
        fromAccount.setBalance(fromAccount.getBalance().subtract(request.getAmount()));
        accountRepository.save(fromAccount);

        // Credit receiver
        toAccount.setBalance(toAccount.getBalance().add(request.getAmount()));
        accountRepository.save(toAccount);

        // Record both sides
        String desc = request.getDescription() != null && !request.getDescription().isEmpty()
                ? request.getDescription()
                : "Transfer";

        saveTransaction(toAccount, "TRANSFER_IN", request.getAmount(),
                desc + " from " + fromAccount.getAccountNumber());

        return saveTransaction(fromAccount, "TRANSFER_OUT", request.getAmount(),
                desc + " to " + toAccount.getAccountNumber());
    }

    // Get transactions
    public List<TransactionResponse> getTransactions(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new RuntimeException("Account not found"));
        return transactionRepository.findByAccountOrderByCreatedAtDesc(account)
                .stream().map(this::mapToTransactionResponse)
                .collect(Collectors.toList());
    }

    // Helper methods
    private TransactionResponse saveTransaction(Account account, String type,
            BigDecimal amount, String description) {
        Transaction transaction = new Transaction();
        transaction.setType(type);
        transaction.setAmount(amount);
        transaction.setDescription(description);
        transaction.setBalanceAfter(account.getBalance());
        transaction.setAccount(account);
        transactionRepository.save(transaction);
        return mapToTransactionResponse(transaction);
    }

    private String generateAccountNumber() {
        return "ACC" + (100000000 + new Random().nextInt(900000000));
    }

    private AccountResponse mapToResponse(Account account) {
        AccountResponse res = new AccountResponse();
        res.setId(account.getId());
        res.setAccountNumber(account.getAccountNumber());
        res.setAccountType(account.getAccountType());
        res.setBalance(account.getBalance());
        res.setCreatedAt(account.getCreatedAt());
        return res;
    }

    private TransactionResponse mapToTransactionResponse(Transaction t) {
        TransactionResponse res = new TransactionResponse();
        res.setId(t.getId());
        res.setType(t.getType());
        res.setAmount(t.getAmount());
        res.setDescription(t.getDescription());
        res.setBalanceAfter(t.getBalanceAfter());
        res.setCreatedAt(t.getCreatedAt());
        return res;
    }
}
