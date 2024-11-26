class TOTPController {
    constructor() {
        this.totp = null;
        this.intervalId = null;
        this.setupEventListeners();
        this.handleURLParams();
    }

    setupEventListeners() {
        document.getElementById('generateBtn').addEventListener('click', () => {
            const uriInput = document.getElementById('totpUri').value;
            this.updateURL(uriInput);
        });
        
        document.getElementById('totpUri').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const uriInput = e.target.value;
                this.updateURL(uriInput);
            }
        });
    }

    updateURL(uri) {
        // Cập nhật URL với URI mới
        const newURL = new URL(window.location.href);
        newURL.searchParams.set('uri', encodeURIComponent(uri));
        window.history.pushState({}, '', newURL);
        
        // Xử lý URI mới
        this.handleURLParams();
    }

    handleURLParams() {
        // Lấy query parameters từ URL
        const urlParams = new URLSearchParams(window.location.search);
        const uri = urlParams.get('uri');
        
        if (uri) {
            // Gán giá trị vào input
            const inputElement = document.getElementById('totpUri');
            const decodedUri = decodeURIComponent(uri);
            inputElement.value = decodedUri;
            
            // Generate OTP
            this.handleGenerate(decodedUri);
        } else {
            // Nếu không có URI trong URL, ẩn container OTP
            document.getElementById('otpContainer').style.display = 'none';
            document.getElementById('errorMsg').textContent = '';
        }
    }

    handleGenerate(uri) {
        const errorMsg = document.getElementById('errorMsg');
        const otpContainer = document.getElementById('otpContainer');

        try {
            // Dừng timer cũ nếu có
            if (this.intervalId) {
                clearInterval(this.intervalId);
            }

            // Tạo TOTP từ URI
            this.totp = window.OTPAuth.URI.parse(uri);

            // Cập nhật UI
            this.updateInfo();
            otpContainer.style.display = 'block';
            errorMsg.textContent = '';

            // Bắt đầu cập nhật
            this.updateOTP();
            this.startTimer();

        } catch (error) {
            errorMsg.textContent = 'Invalid TOTP URI: ' + error.message;
            otpContainer.style.display = 'none';
        }
    }

    updateInfo() {
        document.getElementById('issuer').textContent = this.totp.issuer || '-';
        document.getElementById('account').textContent = this.totp.label || '-';
        document.getElementById('algorithm').textContent = this.totp.algorithm;
        document.getElementById('digits').textContent = this.totp.digits;
        document.getElementById('period').textContent = this.totp.period + 's';
    }

    updateOTP() {
        if (this.totp) {
            const token = this.totp.generate();
            document.getElementById('otpCode').textContent = token;
        }
    }

    updateTimer() {
        const now = Math.floor(Date.now() / 1000);
        const period = this.totp.period;
        const secondsRemaining = period - (now % period);
        const percentage = (secondsRemaining / period) * 100;

        document.getElementById('timeLeft').textContent = `${secondsRemaining}s`;
        document.getElementById('progressBar').style.width = `${percentage}%`;

        if (secondsRemaining === period) {
            this.updateOTP();
        }
    }

    startTimer() {
        this.updateTimer();
        this.intervalId = setInterval(() => this.updateTimer(), 1000);
    }
}

// Thêm xử lý popstate event để handle khi người dùng sử dụng nút back/forward của trình duyệt
window.addEventListener('popstate', () => {
    const controller = new TOTPController();
});

// Khởi tạo controller khi trang load xong
document.addEventListener('DOMContentLoaded', () => {
    const controller = new TOTPController();
});
