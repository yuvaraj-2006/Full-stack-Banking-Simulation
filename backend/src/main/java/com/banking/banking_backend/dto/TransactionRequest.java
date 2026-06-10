package com.banking.banking_backend.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class TransactionRequest {
    private Long accountId;
    private BigDecimal amount;
    private String description;
}