package com.banking.banking_backend.controller;

import com.banking.banking_backend.dto.*;
import com.banking.banking_backend.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(
            Principal principal,
            @RequestBody AccountRequest request) {
        return ResponseEntity.ok(accountService.createAccount(principal.getName(), request));
    }

    @GetMapping
    public ResponseEntity<List<AccountResponse>> getAccounts(Principal principal) {
        return ResponseEntity.ok(accountService.getAccounts(principal.getName()));
    }

    @PostMapping("/deposit")
    public ResponseEntity<TransactionResponse> deposit(
            Principal principal,
            @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(accountService.deposit(principal.getName(), request));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<TransactionResponse> withdraw(
            Principal principal,
            @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(accountService.withdraw(principal.getName(), request));
    }

    @GetMapping("/{accountId}/transactions")
    public ResponseEntity<List<TransactionResponse>> getTransactions(
            @PathVariable Long accountId) {
        return ResponseEntity.ok(accountService.getTransactions(accountId));
    }

    @PostMapping("/transfer")
    public ResponseEntity<TransactionResponse> transfer(
            Principal principal,
            @RequestBody TransferRequest request) {
        return ResponseEntity.ok(accountService.transfer(principal.getName(), request));
    }
}