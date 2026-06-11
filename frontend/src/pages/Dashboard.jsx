import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [darkMode, setDarkMode] = useState(false);
    const [activePage, setActivePage] = useState("dashboard");
    const [accounts, setAccounts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(null);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [accountType, setAccountType] = useState("SAVINGS");
    const [actionMsg, setActionMsg] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Transfer state
    const [transferFrom, setTransferFrom] = useState("");
    const [transferTo, setTransferTo] = useState("");
    const [transferAmount, setTransferAmount] = useState("");
    const [transferDesc, setTransferDesc] = useState("");
    const [transferLoading, setTransferLoading] = useState(false);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    }, [darkMode]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const res = await api.get("/accounts");
            setAccounts(res.data);
            if (res.data.length > 0) {
                fetchAllTransactions(res.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllTransactions = async (accs) => {
        try {
            const all = await Promise.all(
                accs.map((a) => api.get(`/accounts/${a.id}/transactions`))
            );
            const merged = all.flatMap((r) => r.data);
            merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setTransactions(merged);
        } catch (err) {
            console.error(err);
        }
    };

    const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
    const totalDeposited = transactions
        .filter((t) => t.type === "DEPOSIT")
        .reduce((s, t) => s + t.amount, 0);
    const totalWithdrawn = transactions
        .filter((t) => t.type === "WITHDRAWAL")
        .reduce((s, t) => s + t.amount, 0);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const showToast = (msg, ok = true) => {
        setActionMsg({ msg, ok });
        setTimeout(() => setActionMsg(null), 3000);
    };

    const handleDeposit = async () => {
        try {
            await api.post("/accounts/deposit", {
                accountId: selectedAccount.id,
                amount: parseFloat(amount),
                description: description || "Deposit",
            });
            showToast("Deposit successful!");
            setShowModal(null);
            setAmount("");
            setDescription("");
            fetchAccounts();
        } catch (err) {
            showToast(err.response?.data?.message || "Deposit failed", false);
        }
    };

    const handleWithdraw = async () => {
        try {
            await api.post("/accounts/withdraw", {
                accountId: selectedAccount.id,
                amount: parseFloat(amount),
                description: description || "Withdrawal",
            });
            showToast("Withdrawal successful!");
            setShowModal(null);
            setAmount("");
            setDescription("");
            fetchAccounts();
        } catch (err) {
            showToast(err.response?.data?.message || "Insufficient balance", false);
        }
    };

    const handleCreateAccount = async () => {
        try {
            await api.post("/accounts", { accountType });
            showToast("Account created!");
            setShowModal(null);
            fetchAccounts();
        } catch (err) {
            showToast("Failed to create account", false);
        }
    };

    const handleTransfer = async () => {
        if (!transferFrom || !transferTo || !transferAmount) {
            showToast("Please fill all fields", false);
            return;
        }
        setTransferLoading(true);
        try {
            await api.post("/accounts/transfer", {
                fromAccountId: parseInt(transferFrom),
                toAccountNumber: transferTo,
                amount: parseFloat(transferAmount),
                description: transferDesc || "Transfer",
            });
            showToast("Transfer successful!");
            setTransferFrom("");
            setTransferTo("");
            setTransferAmount("");
            setTransferDesc("");
            fetchAccounts();
        } catch (err) {
            showToast(err.response?.data?.message || "Transfer failed", false);
        } finally {
            setTransferLoading(false);
        }
    };

    // ─── styles ───────────────────────────────────────────────────────────────
    const d = darkMode;
    const bg = d ? "#0f1117" : "#f4f6fb";
    const surface = d ? "#1a1d27" : "#ffffff";
    const surfaceAlt = d ? "#22263a" : "#f8f9fc";
    const border = d ? "#2e3354" : "#e5e8f0";
    const text = d ? "#e8eaf6" : "#1a1d2e";
    const textMuted = d ? "#8892b0" : "#6b7280";
    const blue = d ? "#7F77DD" : "#185FA5";
    const blueBg = d ? "#1e1b4b" : "#E6F1FB";
    const blueText = d ? "#AFA9EC" : "#0C447C";
    const greenBg = d ? "#14291e" : "#EAF3DE";
    const greenText = d ? "#5DCAA5" : "#27500A";
    const redBg = d ? "#2d1414" : "#FCEBEB";
    const redText = d ? "#F0997B" : "#791F1F";
    const sidebarActive = d ? "#1e1b4b" : "#E6F1FB";
    const sidebarActiveText = d ? "#AFA9EC" : "#185FA5";

    const navItems = [
        { id: "dashboard", icon: "ti-layout-dashboard", label: "Dashboard" },
        { id: "accounts", icon: "ti-credit-card", label: "Accounts" },
        { id: "transfer", icon: "ti-transfer", label: "Transfer" },
        { id: "history", icon: "ti-history", label: "History" },
        { id: "profile", icon: "ti-user", label: "Profile" },
    ];

    const inputStyle = {
        width: "100%",
        padding: "10px 12px",
        borderRadius: 8,
        border: `1px solid ${border}`,
        background: surfaceAlt,
        color: text,
        fontSize: isMobile ? 13 : 14,
        outline: "none",
        boxSizing: "border-box",
        marginTop: 4,
    };

    const labelStyle = {
        fontSize: isMobile ? 12 : 13,
        color: textMuted,
        display: "block",
        marginBottom: 2,
    };

    const btnPrimary = {
        background: blue,
        color: "#fff",
        border: "none",
        borderRadius: 8,
        padding: isMobile ? "12px 16px" : "10px 20px",
        fontWeight: 500,
        fontSize: isMobile ? 13 : 14,
        cursor: "pointer",
        width: "100%",
        minHeight: isMobile ? 44 : "auto",
    };

    const btnSecondary = {
        background: "transparent",
        color: textMuted,
        border: `1px solid ${border}`,
        borderRadius: 8,
        padding: isMobile ? "12px 16px" : "10px 20px",
        fontSize: isMobile ? 13 : 14,
        cursor: "pointer",
        width: "100%",
        minHeight: isMobile ? 44 : "auto",
    };

    // ─── render helpers ────────────────────────────────────────────────────────
    const StatCard = ({ label, value, bg: sbg, col }) => (
        <div style={{ background: sbg, borderRadius: 12, padding: isMobile ? "12px 14px" : "14px 16px" }}>
            <div style={{ fontSize: isMobile ? 11 : 12, color: col, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 500, color: col }}>
                ₹{value.toLocaleString("en-IN")}
            </div>
        </div>
    );

    const Modal = ({ title, onConfirm, confirmLabel, confirmColor, children }) => (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.5)",
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                zIndex: 100,
            }}
        >
            <div
                style={{
                    background: surface,
                    borderRadius: isMobile ? "20px 20px 0 0" : 16,
                    padding: isMobile ? 20 : 24,
                    width: "100%",
                    maxWidth: isMobile ? "100%" : 360,
                    border: isMobile ? "none" : `1px solid ${border}`,
                    maxHeight: isMobile ? "85vh" : "auto",
                    overflowY: "auto",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 20,
                    }}
                >
                    <span style={{ fontWeight: 500, fontSize: isMobile ? 15 : 16, color: text }}>
                        {title}
                    </span>
                    <button
                        onClick={() => setShowModal(null)}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: textMuted,
                            fontSize: 24,
                        }}
                    >
                        ×
                    </button>
                </div>
                {children}
                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                    <button onClick={() => setShowModal(null)} style={btnSecondary}>
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{ ...btnPrimary, background: confirmColor || blue }}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );

    // ─── pages ─────────────────────────────────────────────────────────────────
    const renderDashboard = () => (
        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 12 : 16 }}>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
                    gap: isMobile ? 10 : 12,
                }}
            >
                <StatCard
                    label="Total Balance"
                    value={totalBalance}
                    bg={blueBg}
                    col={blueText}
                />
                <StatCard
                    label="Total Deposited"
                    value={totalDeposited}
                    bg={greenBg}
                    col={greenText}
                />
                <StatCard
                    label="Total Withdrawn"
                    value={totalWithdrawn}
                    bg={redBg}
                    col={redText}
                />
            </div>

            {/* Account cards */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: isMobile ? "1fr" : "repeat(auto-fit,minmax(200px,1fr))",
                    gap: isMobile ? 10 : 12,
                }}
            >
                {accounts.map((acc) => (
                    <div
                        key={acc.id}
                        style={{
                            background: surface,
                            border: `1px solid ${border}`,
                            borderRadius: 12,
                            padding: isMobile ? 14 : 16,
                        }}
                    >
                        <div style={{ fontSize: isMobile ? 11 : 12, color: textMuted, marginBottom: 4 }}>
                            {acc.accountType} Account
                        </div>
                        <div style={{ fontSize: isMobile ? 20 : 22, fontWeight: 500, color: text }}>
                            ₹{acc.balance.toLocaleString("en-IN")}
                        </div>
                        <div
                            style={{ fontSize: 10, color: textMuted, marginTop: 2, marginBottom: 12 }}
                        >
                            {acc.accountNumber}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button
                                onClick={() => {
                                    setSelectedAccount(acc);
                                    setShowModal("deposit");
                                }}
                                style={{
                                    flex: 1,
                                    fontSize: isMobile ? 12 : 12,
                                    padding: isMobile ? "8px 0" : "6px 0",
                                    borderRadius: 8,
                                    border: "none",
                                    background: blueBg,
                                    color: blueText,
                                    cursor: "pointer",
                                    minHeight: isMobile ? 40 : "auto",
                                }}
                            >
                                Deposit
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedAccount(acc);
                                    setShowModal("withdraw");
                                }}
                                style={{
                                    flex: 1,
                                    fontSize: isMobile ? 12 : 12,
                                    padding: isMobile ? "8px 0" : "6px 0",
                                    borderRadius: 8,
                                    border: "none",
                                    background: redBg,
                                    color: redText,
                                    cursor: "pointer",
                                    minHeight: isMobile ? 40 : "auto",
                                }}
                            >
                                Withdraw
                            </button>
                        </div>
                    </div>
                ))}
                {/* Create Account card */}
                <div
                    onClick={() => setShowModal("createAccount")}
                    style={{
                        background: surfaceAlt,
                        border: `1.5px dashed ${border}`,
                        borderRadius: 12,
                        padding: isMobile ? 14 : 16,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        minHeight: isMobile ? 110 : 130,
                    }}
                >
                    <i
                        className="ti ti-plus"
                        style={{ fontSize: isMobile ? 24 : 28, color: textMuted }}
                        aria-hidden="true"
                    ></i>
                    <span style={{ fontSize: isMobile ? 12 : 13, color: textMuted, marginTop: 8 }}>
                        New Account
                    </span>
                </div>
            </div>

            {/* Recent transactions */}
            <div
                style={{
                    background: surface,
                    border: `1px solid ${border}`,
                    borderRadius: 12,
                    padding: isMobile ? 14 : 16,
                }}
            >
                <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 500, color: text, marginBottom: 12 }}>
                    Recent Transactions
                </div>
                {transactions.length === 0 && (
                    <div
                        style={{
                            color: textMuted,
                            fontSize: isMobile ? 12 : 13,
                            textAlign: "center",
                            padding: "20px 0",
                        }}
                    >
                        No transactions yet
                    </div>
                )}
                {transactions.slice(0, 5).map((t) => (
                    <div
                        key={t.id}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 0",
                            borderBottom: `1px solid ${border}`,
                            fontSize: isMobile ? 12 : 13,
                        }}
                    >
                        <div>
                            <div style={{ color: text }}>{t.description}</div>
                            <div style={{ fontSize: isMobile ? 10 : 11, color: textMuted }}>
                                {new Date(t.createdAt).toLocaleDateString("en-IN")}
                            </div>
                        </div>
                        <span
                            style={{
                                fontSize: isMobile ? 11 : 12,
                                padding: "3px 10px",
                                borderRadius: 20,
                                background:
                                    t.type === "DEPOSIT" || t.type === "TRANSFER_IN"
                                        ? greenBg
                                        : redBg,
                                color:
                                    t.type === "DEPOSIT" || t.type === "TRANSFER_IN"
                                        ? greenText
                                        : redText,
                            }}
                        >
                            {t.type === "DEPOSIT" || t.type === "TRANSFER_IN" ? "+" : "-"}
                            ₹{t.amount.toLocaleString("en-IN")}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderAccounts = () => (
        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 10 : 12 }}>
            <div style={{ fontSize: isMobile ? 15 : 16, fontWeight: 500, color: text }}>All Accounts</div>
            {accounts.map((acc) => (
                <div
                    key={acc.id}
                    style={{
                        background: surface,
                        border: `1px solid ${border}`,
                        borderRadius: 12,
                        padding: isMobile ? 14 : 20,
                        display: "flex",
                        flexDirection: isMobile ? "column" : "row",
                        justifyContent: "space-between",
                        alignItems: isMobile ? "flex-start" : "center",
                        gap: isMobile ? 12 : 0,
                    }}
                >
                    <div>
                        <div style={{ fontSize: isMobile ? 12 : 13, color: textMuted }}>
                            {acc.accountType} Account
                        </div>
                        <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 500, color: text }}>
                            ₹{acc.balance.toLocaleString("en-IN")}
                        </div>
                        <div style={{ fontSize: isMobile ? 11 : 12, color: textMuted, marginTop: 2 }}>
                            {acc.accountNumber}
                        </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, width: isMobile ? "100%" : "auto" }}>
                        <button
                            onClick={() => {
                                setSelectedAccount(acc);
                                setShowModal("deposit");
                            }}
                            style={{
                                flex: isMobile ? 1 : "auto",
                                fontSize: isMobile ? 12 : 13,
                                padding: isMobile ? "10px 14px" : "8px 16px",
                                borderRadius: 8,
                                border: "none",
                                background: blueBg,
                                color: blueText,
                                cursor: "pointer",
                                minHeight: isMobile ? 40 : "auto",
                            }}
                        >
                            Deposit
                        </button>
                        <button
                            onClick={() => {
                                setSelectedAccount(acc);
                                setShowModal("withdraw");
                            }}
                            style={{
                                flex: isMobile ? 1 : "auto",
                                fontSize: isMobile ? 12 : 13,
                                padding: isMobile ? "10px 14px" : "8px 16px",
                                borderRadius: 8,
                                border: "none",
                                background: redBg,
                                color: redText,
                                cursor: "pointer",
                                minHeight: isMobile ? 40 : "auto",
                            }}
                        >
                            Withdraw
                        </button>
                    </div>
                </div>
            ))}
            <button
                onClick={() => setShowModal("createAccount")}
                style={{ ...btnPrimary, marginTop: 4 }}
            >
                + Create New Account
            </button>
        </div>
    );

    const renderTransfer = () => (
        <div style={{ maxWidth: isMobile ? "100%" : 460 }}>
            <div style={{ fontSize: isMobile ? 15 : 16, fontWeight: 500, color: text, marginBottom: 16 }}>
                Transfer Money
            </div>
            <div
                style={{
                    background: surface,
                    border: `1px solid ${border}`,
                    borderRadius: 12,
                    padding: isMobile ? 16 : 24,
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                }}
            >
                {/* From account */}
                <div>
                    <label style={labelStyle}>From Account</label>
                    <select
                        value={transferFrom}
                        onChange={(e) => setTransferFrom(e.target.value)}
                        style={{ ...inputStyle, minHeight: isMobile ? 44 : "auto" }}
                    >
                        <option value="">Select account</option>
                        {accounts.map((acc) => (
                            <option key={acc.id} value={acc.id}>
                                {acc.accountType} — {acc.accountNumber} (₹
                                {acc.balance.toLocaleString("en-IN")})
                            </option>
                        ))}
                    </select>
                </div>

                {/* To account number */}
                <div>
                    <label style={labelStyle}>To Account Number</label>
                    <input
                        type="text"
                        value={transferTo}
                        onChange={(e) => setTransferTo(e.target.value)}
                        placeholder="e.g. ACC100234"
                        style={{ ...inputStyle, minHeight: isMobile ? 44 : "auto" }}
                    />
                </div>

                {/* Amount */}
                <div>
                    <label style={labelStyle}>Amount (₹)</label>
                    <input
                        type="number"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        placeholder="Enter amount"
                        style={{ ...inputStyle, minHeight: isMobile ? 44 : "auto" }}
                    />
                </div>

                {/* Description */}
                <div>
                    <label style={labelStyle}>Description (optional)</label>
                    <input
                        type="text"
                        value={transferDesc}
                        onChange={(e) => setTransferDesc(e.target.value)}
                        placeholder="e.g. Rent payment"
                        style={{ ...inputStyle, minHeight: isMobile ? 44 : "auto" }}
                    />
                </div>

                {/* Summary box */}
                {transferFrom && transferAmount && (
                    <div style={{ background: blueBg, borderRadius: 8, padding: "12px 16px" }}>
                        <div style={{ fontSize: isMobile ? 11 : 12, color: blueText }}>Transfer Summary</div>
                        <div style={{ fontSize: isMobile ? 12 : 13, color: blueText, marginTop: 4 }}>
                            Sending <strong>₹{parseFloat(transferAmount || 0).toLocaleString("en-IN")}</strong> to{" "}
                            <strong>{transferTo || "..."}</strong>
                        </div>
                    </div>
                )}

                <button
                    onClick={handleTransfer}
                    disabled={transferLoading}
                    style={{ ...btnPrimary, opacity: transferLoading ? 0.6 : 1 }}
                >
                    {transferLoading ? "Processing..." : "Send Money"}
                </button>
            </div>
        </div>
    );

    const renderHistory = () => (
        <div
            style={{
                background: surface,
                border: `1px solid ${border}`,
                borderRadius: 12,
                padding: isMobile ? 14 : 16,
            }}
        >
            <div style={{ fontSize: isMobile ? 15 : 16, fontWeight: 500, color: text, marginBottom: 12 }}>
                Transaction History
            </div>
            {transactions.length === 0 && (
                <div
                    style={{
                        color: textMuted,
                        fontSize: isMobile ? 12 : 13,
                        textAlign: "center",
                        padding: "30px 0",
                    }}
                >
                    No transactions yet
                </div>
            )}
            {transactions.map((t) => (
                <div
                    key={t.id}
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 0",
                        borderBottom: `1px solid ${border}`,
                        gap: isMobile ? 10 : 0,
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 10 : 12, flex: 1 }}>
                        <div
                            style={{
                                width: isMobile ? 32 : 36,
                                height: isMobile ? 32 : 36,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                                background:
                                    t.type === "DEPOSIT" || t.type === "TRANSFER_IN"
                                        ? greenBg
                                        : redBg,
                            }}
                        >
                            <i
                                className={
                                    t.type === "DEPOSIT" || t.type === "TRANSFER_IN"
                                        ? "ti ti-circle-arrow-down"
                                        : "ti ti-circle-arrow-up"
                                }
                                style={{
                                    fontSize: isMobile ? 16 : 18,
                                    color:
                                        t.type === "DEPOSIT" || t.type === "TRANSFER_IN"
                                            ? greenText
                                            : redText,
                                }}
                                aria-hidden="true"
                            ></i>
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: isMobile ? 12 : 13, color: text, wordBreak: "break-word" }}>
                                {t.description}
                            </div>
                            <div style={{ fontSize: isMobile ? 10 : 11, color: textMuted }}>
                                {new Date(t.createdAt).toLocaleString("en-IN")}
                            </div>
                        </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div
                            style={{
                                fontSize: isMobile ? 13 : 14,
                                fontWeight: 500,
                                color:
                                    t.type === "DEPOSIT" || t.type === "TRANSFER_IN"
                                        ? greenText
                                        : redText,
                            }}
                        >
                            {t.type === "DEPOSIT" || t.type === "TRANSFER_IN" ? "+" : "-"}
                            ₹{t.amount.toLocaleString("en-IN")}
                        </div>
                        <div style={{ fontSize: isMobile ? 10 : 11, color: textMuted }}>
                            Bal: ₹{t.balanceAfter?.toLocaleString("en-IN")}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const renderProfile = () => (
        <div
            style={{
                background: surface,
                border: `1px solid ${border}`,
                borderRadius: 12,
                padding: isMobile ? 16 : 24,
                maxWidth: isMobile ? "100%" : 420,
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 16, marginBottom: 24 }}>
                <div
                    style={{
                        width: isMobile ? 48 : 56,
                        height: isMobile ? 48 : 56,
                        borderRadius: "50%",
                        background: blueBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: isMobile ? 20 : 22,
                        fontWeight: 500,
                        color: blueText,
                        flexShrink: 0,
                    }}
                >
                    {user?.fullName?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                    <div style={{ fontSize: isMobile ? 15 : 16, fontWeight: 500, color: text }}>
                        {user?.fullName || "User"}
                    </div>
                    <div style={{ fontSize: isMobile ? 12 : 13, color: textMuted }}>{user?.email}</div>
                </div>
            </div>
            <div
                style={{
                    borderTop: `1px solid ${border}`,
                    paddingTop: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                }}
            >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: isMobile ? 12 : 13, color: textMuted }}>Total Accounts</span>
                    <span style={{ fontSize: isMobile ? 12 : 13, color: text, fontWeight: 500 }}>
                        {accounts.length}
                    </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: isMobile ? 12 : 13, color: textMuted }}>Total Transactions</span>
                    <span style={{ fontSize: isMobile ? 12 : 13, color: text, fontWeight: 500 }}>
                        {transactions.length}
                    </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: isMobile ? 12 : 13, color: textMuted }}>Net Balance</span>
                    <span style={{ fontSize: isMobile ? 12 : 13, color: blueText, fontWeight: 500 }}>
                        ₹{totalBalance.toLocaleString("en-IN")}
                    </span>
                </div>
            </div>
            <button
                onClick={handleLogout}
                style={{ ...btnPrimary, background: "#A32D2D", marginTop: 24 }}
            >
                Logout
            </button>
        </div>
    );

    const pageContent = () => {
        if (loading)
            return (
                <div style={{ color: textMuted, textAlign: "center", padding: 40 }}>
                    Loading...
                </div>
            );
        if (activePage === "dashboard") return renderDashboard();
        if (activePage === "accounts") return renderAccounts();
        if (activePage === "transfer") return renderTransfer();
        if (activePage === "history") return renderHistory();
        if (activePage === "profile") return renderProfile();
    };

    // ─── main render ───────────────────────────────────────────────────────────
    return (
        <div
            style={{
                minHeight: "100vh",
                background: bg,
                fontFamily: "system-ui, sans-serif",
                position: "relative"
            }}
        >
            {/* Toast */}
            {actionMsg && (
                <div
                    style={{
                        position: "fixed",
                        top: isMobile ? 10 : 20,
                        right: isMobile ? 10 : 20,
                        zIndex: 200,
                        background: actionMsg.ok ? greenBg : redBg,
                        color: actionMsg.ok ? greenText : redText,
                        padding: isMobile ? "10px 16px" : "12px 20px",
                        borderRadius: 10,
                        fontSize: isMobile ? 12 : 14,
                        fontWeight: 500,
                        border: `1px solid ${actionMsg.ok ? greenText : redText}`,
                        maxWidth: isMobile ? "calc(100% - 20px)" : "auto",
                    }}
                >
                    {actionMsg.msg}
                </div>
            )}

            {/* Top Navbar */}
            {/* Top Navbar */}
            <div
                style={{
                    background: surface,
                    borderBottom: `1px solid ${border}`,
                    padding: isMobile ? "10px 12px" : "0 24px",
                    minHeight: isMobile ? 52 : 56,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: "sticky",
                    top: 0,
                    zIndex: 50,
                    gap: 8,
                }}
            >
                {isMobile && (
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: text,
                            fontSize: 22,
                            padding: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            minWidth: 40,
                            minHeight: 40,
                        }}
                    >
                        ☰
                    </button>
                )}

                <span
                    style={{
                        fontSize: isMobile ? 16 : 18,
                        fontWeight: 500,
                        color: blue,
                        flex: 1,
                        textAlign: isMobile ? "center" : "left",
                    }}
                >
                    🏦 BankApp
                </span>

                {!isMobile && (
                    <span style={{ fontSize: 13, color: textMuted }}>
                        Welcome, {user?.fullName || "User"} 👋
                    </span>
                )}

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        style={{
                            background: surfaceAlt,
                            border: `1px solid ${border}`,
                            borderRadius: 20,
                            padding: isMobile ? "6px 10px" : "5px 14px",
                            cursor: "pointer",
                            fontSize: isMobile ? 12 : 13,
                            color: text,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 4,
                            minHeight: 40,
                            minWidth: 40,
                        }}
                    >
                        <span style={{ fontSize: 16 }}>
                            {darkMode ? "☀️" : "🌙"}
                        </span>
                        {!isMobile && (
                            <span>
                                {darkMode ? "Light" : "Dark"}
                            </span>
                        )}
                    </button>


                    {!isMobile && (
                        <button
                            onClick={handleLogout}
                            style={{
                                background: redBg,
                                color: redText,
                                border: "none",
                                borderRadius: 8,
                                padding: "6px 14px",
                                fontSize: 13,
                                cursor: "pointer",
                                minHeight: 40,
                            }}
                        >
                            Logout
                        </button>
                    )}
                </div>
            </div>

            {/* Body */}
            <div
                style={{
                    display: isMobile ? "block" : "grid",
                    gridTemplateColumns: isMobile ? undefined : "80px 1fr",
                    minHeight: `calc(100vh - ${isMobile ? 52 : 56}px)`,
                }}
            >
                {/* Sidebar — Mobile */}
                {isMobile && sidebarOpen && (
                    <div
                        style={{
                            position: "fixed",
                            top: 52,
                            left: 0,
                            width: "70vw",
                            maxWidth: 200,
                            background: surface,
                            border: `1px solid ${border}`,
                            borderTop: "none",
                            padding: "12px 6px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                            zIndex: 40,
                        }}
                    >
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActivePage(item.id);
                                    setSidebarOpen(false);
                                }}
                                style={{
                                    background: activePage === item.id ? sidebarActive : "transparent",
                                    color: activePage === item.id ? sidebarActiveText : textMuted,
                                    border: "none",
                                    borderRadius: 8,
                                    padding: "10px 12px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    fontSize: 13,
                                    width: "100%",
                                    textAlign: "left",
                                }}
                            >
                                <i className={`ti ${item.icon}`} style={{ fontSize: 18 }} aria-hidden="true"></i>
                                {item.label}
                            </button>
                        ))}
                        <div style={{ borderTop: `1px solid ${border}`, marginTop: 8, paddingTop: 8 }}>
                            <button
                                onClick={handleLogout}
                                style={{
                                    background: redBg,
                                    color: redText,
                                    border: "none",
                                    borderRadius: 8,
                                    padding: "10px 12px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 10,
                                    fontSize: 13,
                                    width: "100%",
                                    textAlign: "left",
                                }}
                            >
                                <i className="ti ti-logout" style={{ fontSize: 18 }} aria-hidden="true"></i>
                                Logout
                            </button>
                        </div>
                    </div>
                )}

                {/* Sidebar — Desktop */}
                {!isMobile && (
                    <div
                        style={{
                            background: surface,
                            borderRight: `1px solid ${border}`,
                            padding: "16px 6px",
                            display: "flex",
                            flexDirection: "column",
                            gap: 4,
                            position: "sticky",
                            top: 56,
                            height: `calc(100vh - 56px)`,
                        }}
                    >
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActivePage(item.id)}
                                style={{
                                    background: activePage === item.id ? sidebarActive : "transparent",
                                    color: activePage === item.id ? sidebarActiveText : textMuted,
                                    border: "none",
                                    borderRadius: 8,
                                    padding: "10px 4px",
                                    cursor: "pointer",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 4,
                                    fontSize: 10,
                                    width: "100%",
                                }}
                            >
                                <i className={`ti ${item.icon}`} style={{ fontSize: 20 }} aria-hidden="true"></i>
                                {item.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Main content */}
                <div style={{ padding: isMobile ? 14 : 24, paddingTop: isMobile ? 16 : 24 }}>
                    {pageContent()}
                </div>
            </div>

            {/* Deposit Modal */}
            {showModal === "deposit" && (
                <Modal
                    title={`Deposit — ${selectedAccount?.accountNumber}`}
                    onConfirm={handleDeposit}
                    confirmLabel="Deposit"
                    confirmColor={blue}
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <div>
                            <label style={labelStyle}>Amount (₹)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Description</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g. Salary"
                                style={inputStyle}
                            />
                        </div>
                    </div>
                </Modal>
            )}

            {/* Withdraw Modal */}
            {showModal === "withdraw" && (
                <Modal
                    title={`Withdraw — ${selectedAccount?.accountNumber}`}
                    onConfirm={handleWithdraw}
                    confirmLabel="Withdraw"
                    confirmColor="#A32D2D"
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        <div
                            style={{
                                background: surfaceAlt,
                                borderRadius: 8,
                                padding: "10px 14px",
                                fontSize: isMobile ? 12 : 13,
                                color: textMuted,
                            }}
                        >
                            Available:{" "}
                            <span style={{ fontWeight: 500, color: text }}>
                                ₹{selectedAccount?.balance?.toLocaleString("en-IN")}
                            </span>
                        </div>
                        <div>
                            <label style={labelStyle}>Amount (₹)</label>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={labelStyle}>Description</label>
                            <input
                                type="text"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="e.g. Rent"
                                style={inputStyle}
                            />
                        </div>
                    </div>
                </Modal>
            )}

            {/* Create Account Modal */}
            {showModal === "createAccount" && (
                <Modal
                    title="Create New Account"
                    onConfirm={handleCreateAccount}
                    confirmLabel="Create Account"
                >
                    <div>
                        <label style={labelStyle}>Account Type</label>
                        <select
                            value={accountType}
                            onChange={(e) => setAccountType(e.target.value)}
                            style={{ ...inputStyle, minHeight: isMobile ? 44 : "auto" }}
                        >
                            <option value="SAVINGS">Savings</option>
                            <option value="CHECKING">Checking</option>
                        </select>
                    </div>
                </Modal>
            )}
        </div>
    );
}
