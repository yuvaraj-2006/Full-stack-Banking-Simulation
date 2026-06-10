package com.banking.banking_backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class TransferRequest {
    private Long fromAccountId;
    private String toAccountNumber;
    private BigDecimal amount;
    private String description;
}