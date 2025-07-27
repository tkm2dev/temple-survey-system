const express = require("express");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { executeQuery } = require("../config/database");
const { logActivity } = require("../utils/auditLogger");
const logger = require("../utils/logger");

const router = express.Router();

// Email transporter configuration
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// @route   POST /api/verification/send-otp
// @desc    Send OTP for verification
// @access  Public
router.post("/send-otp", async (req, res) => {
  try {
    const { session_token, otp_type, contact_info } = req.body;

    console.log(`📱 [SEND OTP] Request for ${otp_type}: ${contact_info}`);

    // Validation
    if (!session_token || !otp_type || !contact_info) {
      return res.status(400).json({
        success: false,
        message: "ข้อมูลไม่ครบถ้วน",
      });
    }

    if (!["email", "sms"].includes(otp_type)) {
      return res.status(400).json({
        success: false,
        message: "ประเภทการยืนยันไม่ถูกต้อง",
      });
    }

    // Validate contact info based on type
    if (otp_type === "email" && !isValidEmail(contact_info)) {
      return res.status(400).json({
        success: false,
        message: "รูปแบบอีเมลไม่ถูกต้อง",
      });
    }

    if (otp_type === "sms" && !isValidPhoneNumber(contact_info)) {
      return res.status(400).json({
        success: false,
        message: "รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง",
      });
    }

    // Check if session token exists
    const tokenCheck = await executeQuery(
      "SELECT * FROM verification_tokens WHERE token = ? AND expires_at > NOW()",
      [session_token]
    );

    if (tokenCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Session ไม่ถูกต้องหรือหมดอายุแล้ว",
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTP for this session
    await executeQuery(
      "DELETE FROM verification_otps WHERE session_token = ?",
      [session_token]
    );

    // Store OTP in database
    await executeQuery(
      `INSERT INTO verification_otps (session_token, otp_code, otp_type, contact_info, attempts, is_used, expires_at) 
       VALUES (?, ?, ?, ?, 0, FALSE, ?)`,
      [session_token, otp, otp_type, contact_info, otpExpiry]
    );

    // Send OTP based on type
    if (otp_type === "email") {
      await sendEmailOTP(contact_info, otp);
    } else if (otp_type === "sms") {
      await sendSMSOTP(contact_info, otp);
    }

    console.log(`✅ [SEND OTP] OTP sent successfully to ${contact_info}`);

    res.json({
      success: true,
      message: `รหัสยืนยันได้ถูกส่งไปยัง${
        otp_type === "email" ? "อีเมล" : "โทรศัพท์"
      }ของท่านแล้ว`,
      data: {
        otp_type,
        contact_info: maskSensitiveData(contact_info, otp_type),
        expires_in: 600, // 10 minutes in seconds
      },
    });
  } catch (error) {
    console.error(`💥 [SEND OTP] Error: ${error.message}`);
    logger.error("Send OTP error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการส่งรหัสยืนยัน",
    });
  }
});

// @route   POST /api/verification/verify-otp
// @desc    Verify OTP code
// @access  Public
router.post("/verify-otp", async (req, res) => {
  try {
    const { session_token, otp_code } = req.body;

    console.log(`🔍 [VERIFY OTP] Verifying OTP for session: ${session_token}`);

    // Validation
    if (!session_token || !otp_code) {
      return res.status(400).json({
        success: false,
        message: "ข้อมูลไม่ครบถ้วน",
      });
    }

    // Check OTP in database
    const otpRecords = await executeQuery(
      `SELECT * FROM verification_otps 
       WHERE session_token = ? AND is_used = FALSE 
       ORDER BY created_at DESC LIMIT 1`,
      [session_token]
    );

    if (otpRecords.length === 0) {
      return res.status(400).json({
        success: false,
        message: "ไม่พบรหัสยืนยันหรือรหัสยืนยันถูกใช้งานแล้ว",
      });
    }

    const otpRecord = otpRecords[0];

    // Check if OTP expired
    if (new Date() > new Date(otpRecord.expires_at)) {
      return res.status(400).json({
        success: false,
        message: "รหัสยืนยันหมดอายุแล้ว กรุณาขอรหัสใหม่",
      });
    }

    // Check maximum attempts
    if (otpRecord.attempts >= 5) {
      return res.status(400).json({
        success: false,
        message: "ใส่รหัสยืนยันผิดเกินจำนวนที่กำหนด กรุณาขอรหัสใหม่",
      });
    }

    // Check if OTP matches
    if (otpRecord.otp_code !== otp_code) {
      // Increment failed attempts
      await executeQuery(
        `UPDATE verification_otps SET attempts = attempts + 1 WHERE id = ?`,
        [otpRecord.id]
      );

      return res.status(400).json({
        success: false,
        message: `รหัสยืนยันไม่ถูกต้อง (เหลืออีก ${
          4 - otpRecord.attempts
        } ครั้ง)`,
      });
    }

    // Mark OTP as used
    await executeQuery(
      `UPDATE verification_otps SET is_used = TRUE WHERE id = ?`,
      [otpRecord.id]
    );

    // Update verification token step
    await executeQuery(
      `UPDATE verification_tokens 
       SET verification_step = 'complete', updated_at = NOW() 
       WHERE token = ?`,
      [session_token]
    );

    console.log(
      `✅ [VERIFY OTP] OTP verified successfully for session: ${session_token}`
    );

    // Log verification activity
    await logActivity(
      null,
      "OTP_VERIFICATION",
      null,
      null,
      {
        otp_type: otpRecord.otp_type,
        contact_info: maskSensitiveData(
          otpRecord.contact_info,
          otpRecord.otp_type
        ),
        status: "success",
      },
      req.ip
    );

    res.json({
      success: true,
      message: "ยืนยันรหัสสำเร็จ",
      data: {
        session_token: session_token,
        verification_step: "complete",
      },
    });
  } catch (error) {
    console.error(`💥 [VERIFY OTP] Error: ${error.message}`);
    logger.error("Verify OTP error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการยืนยันรหัส",
    });
  }
});

// @route   POST /api/verification/verify-national-id
// @desc    Verify national ID with DGA-like system
// @access  Public
router.post("/verify-national-id", async (req, res) => {
  try {
    const { session_token, national_id, first_name, last_name, birth_date } =
      req.body;

    console.log(`🆔 [VERIFY NATIONAL ID] Verifying ID: ${national_id}`);

    // Validation
    if (!session_token || !national_id || !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: "ข้อมูลไม่ครบถ้วน กรุณากรอกข้อมูลให้ครบ",
      });
    }

    // Check if session token exists
    const tokenCheck = await executeQuery(
      "SELECT * FROM verification_tokens WHERE token = ? AND expires_at > NOW()",
      [session_token]
    );

    if (tokenCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Session ไม่ถูกต้องหรือหมดอายุแล้ว",
      });
    }

    // Validate national ID format
    const cleanNationalId = national_id.replace(/\D/g, "");
    if (cleanNationalId.length !== 13) {
      return res.status(400).json({
        success: false,
        message: "เลขบัตรประจำตัวประชาชนไม่ถูกต้อง",
      });
    }

    // Mock verification with government database
    const verificationResult = await mockGovernmentIdVerification({
      national_id: cleanNationalId,
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      birth_date,
    });

    if (!verificationResult.valid) {
      return res.status(400).json({
        success: false,
        message:
          verificationResult.message ||
          "ไม่สามารถยืนยันตัวตนได้ กรุณาตรวจสอบข้อมูลอีกครั้ง",
      });
    }

    // Store verification result
    await executeQuery(
      `INSERT INTO national_id_verifications (session_token, national_id, first_name, last_name, is_verified, verification_result) 
       VALUES (?, ?, ?, ?, TRUE, ?)`,
      [
        session_token,
        cleanNationalId,
        first_name.trim(),
        last_name.trim(),
        JSON.stringify(verificationResult),
      ]
    );

    // Update verification token step
    await executeQuery(
      `UPDATE verification_tokens 
       SET verification_step = 'otp', updated_at = NOW() 
       WHERE token = ?`,
      [session_token]
    );

    console.log(
      `✅ [VERIFY NATIONAL ID] ID verified successfully: ${cleanNationalId}`
    );

    // Log verification activity
    await logActivity(
      null,
      "NATIONAL_ID_VERIFICATION",
      null,
      null,
      {
        national_id: maskSensitiveData(cleanNationalId, "national_id"),
        first_name,
        last_name,
        status: "success",
      },
      req.ip
    );

    res.json({
      success: true,
      message: "ยืนยันตัวตนสำเร็จ",
      data: {
        session_token: session_token,
        verified_data: {
          national_id: cleanNationalId,
          first_name: verificationResult.first_name,
          last_name: verificationResult.last_name,
          birth_date: verificationResult.birth_date,
        },
        verification_step: "otp",
      },
    });
  } catch (error) {
    console.error(`💥 [VERIFY NATIONAL ID] Error: ${error.message}`);
    logger.error("National ID verification error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการยืนยันตัวตน",
    });
  }
});

// @route   GET /api/verification/check-token/:token
// @desc    Check if verification token is valid
// @access  Public
router.get("/check-token/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const tokenRecords = await executeQuery(
      `SELECT * FROM verification_tokens WHERE token = ? AND expires_at > NOW()`,
      [token]
    );

    if (tokenRecords.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Token ไม่ถูกต้องหรือหมดอายุแล้ว",
      });
    }

    const tokenRecord = tokenRecords[0];

    res.json({
      success: true,
      message: "Token ถูกต้อง",
      data: {
        token: tokenRecord.token,
        verification_step: tokenRecord.verification_step,
        is_completed: tokenRecord.is_completed,
        expires_at: tokenRecord.expires_at,
        user_data: tokenRecord.user_data
          ? JSON.parse(tokenRecord.user_data)
          : null,
      },
    });
  } catch (error) {
    console.error(`💥 [CHECK TOKEN] Error: ${error.message}`);
    logger.error("Check token error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการตรวจสอบ token",
    });
  }
});

// @route   POST /api/verification/start
// @desc    Start verification process and generate session token
// @access  Public
router.post("/start", async (req, res) => {
  try {
    const { user_data } = req.body;

    console.log(`🚀 [START VERIFICATION] Starting verification process`);

    // Generate session token
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store verification session
    await executeQuery(
      `INSERT INTO verification_tokens (token, user_data, verification_step, is_completed, expires_at) 
       VALUES (?, ?, 'terms', FALSE, ?)`,
      [sessionToken, JSON.stringify(user_data || {}), tokenExpiry]
    );

    console.log(`✅ [START VERIFICATION] Session created: ${sessionToken}`);

    res.json({
      success: true,
      message: "เริ่มกระบวนการยืนยันตัวตน",
      data: {
        session_token: sessionToken,
        verification_step: "terms",
        expires_in: 3600, // 1 hour in seconds
      },
    });
  } catch (error) {
    console.error(`💥 [START VERIFICATION] Error: ${error.message}`);
    logger.error("Start verification error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการเริ่มกระบวนการยืนยัน",
    });
  }
});

// @route   POST /api/verification/update-step
// @desc    Update verification step
// @access  Public
router.post("/update-step", async (req, res) => {
  try {
    const { session_token, verification_step, user_data } = req.body;

    console.log(`📝 [UPDATE STEP] Updating step to: ${verification_step}`);

    // Validation
    if (!session_token || !verification_step) {
      return res.status(400).json({
        success: false,
        message: "ข้อมูลไม่ครบถ้วน",
      });
    }

    const validSteps = ["terms", "method", "identity", "otp", "complete"];
    if (!validSteps.includes(verification_step)) {
      return res.status(400).json({
        success: false,
        message: "ขั้นตอนการยืนยันไม่ถูกต้อง",
      });
    }

    // Check if session exists
    const sessionCheck = await executeQuery(
      "SELECT * FROM verification_tokens WHERE token = ? AND expires_at > NOW()",
      [session_token]
    );

    if (sessionCheck.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Session ไม่ถูกต้องหรือหมดอายุแล้ว",
      });
    }

    // Update verification step and user data
    const updateParams = [verification_step];
    let updateQuery =
      "UPDATE verification_tokens SET verification_step = ?, updated_at = NOW()";

    if (user_data) {
      updateQuery += ", user_data = ?";
      updateParams.push(JSON.stringify(user_data));
    }

    if (verification_step === "complete") {
      updateQuery += ", is_completed = TRUE";
    }

    updateQuery += " WHERE token = ?";
    updateParams.push(session_token);

    await executeQuery(updateQuery, updateParams);

    console.log(
      `✅ [UPDATE STEP] Step updated successfully: ${verification_step}`
    );

    res.json({
      success: true,
      message: "อัปเดตขั้นตอนสำเร็จ",
      data: {
        session_token: session_token,
        verification_step: verification_step,
        is_completed: verification_step === "complete",
      },
    });
  } catch (error) {
    console.error(`💥 [UPDATE STEP] Error: ${error.message}`);
    logger.error("Update step error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดตขั้นตอน",
    });
  }
});

// Helper function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Helper function to validate phone number format
function isValidPhoneNumber(phone) {
  const phoneRegex = /^(\+66|0)[0-9]{8,9}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ""));
}

// Helper function to send email OTP
async function sendEmailOTP(email, otp) {
  const mailOptions = {
    from: process.env.SMTP_FROM || "noreply@temple-survey.gov.th",
    to: email,
    subject: "รหัสยืนยันระบบสำรวจข้อมูลวัด - ระบบยืนยันตัวตน DGA",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background-color: #2c5aa0; color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin: 0; font-size: 24px;">🏛️ ระบบสำรวจข้อมูลวัด</h2>
              <p style="margin: 5px 0 0 0; opacity: 0.9;">ระบบยืนยันตัวตนแบบ DGA</p>
            </div>
          </div>
          
          <div style="background-color: #e3f2fd; padding: 25px; border-radius: 8px; text-align: center; margin: 20px 0; border-left: 4px solid #2196f3;">
            <p style="margin: 0 0 15px 0; color: #1565c0; font-size: 16px; font-weight: 500;">รหัสยืนยันตัวตนของท่าน</p>
            <h1 style="font-size: 42px; font-weight: bold; color: #1565c0; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</h1>
          </div>
          
          <div style="margin: 25px 0; padding: 20px; background-color: #fff3e0; border-radius: 8px; border-left: 4px solid #ff9800;">
            <h3 style="color: #e65100; margin: 0 0 15px 0; font-size: 18px;">⚠️ ข้อปฏิบัติสำคัญ</h3>
            <ul style="color: #bf360c; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>รหัสนี้มีอายุ <strong>10 นาที</strong> เท่านั้น</li>
              <li>กรุณานำรหัสนี้ไปกรอกในระบบยืนยันตัวตน</li>
              <li>ห้ามแชร์รหัสนี้กับบุคคลอื่น</li>
              <li>หากท่านไม่ได้ขอรหัสนี้ กรุณาเพิกเฉยต่ออีเมลนี้</li>
            </ul>
          </div>
          
          <div style="margin: 25px 0; padding: 15px; background-color: #f1f8e9; border-radius: 8px; border-left: 4px solid #4caf50;">
            <p style="color: #2e7d32; margin: 0; line-height: 1.6;">
              <strong>🔒 ความปลอดภัย:</strong> ระบบยืนยันตัวตนนี้ได้รับการพัฒนาตามมาตรฐานของ Digital Government Agency (DGA) 
              เพื่อความปลอดภัยและความน่าเชื่อถือสูงสุด
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
          
          <div style="text-align: center;">
            <p style="color: #757575; font-size: 13px; margin: 0; line-height: 1.4;">
              อีเมลนี้ส่งโดยอัตโนมัติ กรุณาอย่าตอบกลับ<br>
              <strong>ระบบสำรวจข้อมูลวัด</strong> | สำนักงานตำรวจแห่งชาติ<br>
              📧 support@temple-survey.gov.th | 📞 02-XXX-XXXX
            </p>
          </div>
        </div>
      </div>
    `,
  };

  await emailTransporter.sendMail(mailOptions);
}

// Helper function to send SMS OTP (mock implementation)
async function sendSMSOTP(phoneNumber, otp) {
  // In production, integrate with SMS gateway
  console.log(`📱 [SMS OTP] Would send OTP ${otp} to ${phoneNumber}`);

  // Mock SMS sending
  return new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });
}

// Mock national ID verification with DGA-like system
async function mockNationalIdVerification(nationalId, otp) {
  console.log(
    `🆔 [MOCK DGA] Sending OTP ${otp} for national ID: ${nationalId}`
  );
  return new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });
}

// Helper function to send SMS OTP (mock implementation)
async function sendSMSOTP(phoneNumber, otp) {
  // In production, integrate with SMS gateway (e.g., Twilio, AWS SNS, Thai SMS providers)
  console.log(`📱 [SMS OTP] Sending OTP ${otp} to ${phoneNumber}`);

  // Mock SMS content for logging
  const smsContent = `
🏛️ ระบบสำรวจข้อมูลวัด
รหัสยืนยันตัวตน DGA: ${otp}
อายุ 10 นาที
ห้ามแชร์รหัสนี้กับบุคคลอื่น
สำนักงานตำรวจแห่งชาติ
  `.trim();

  console.log(`📱 [SMS CONTENT] ${smsContent}`);

  // Mock SMS sending delay
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`✅ [SMS OTP] SMS sent successfully to ${phoneNumber}`);
      resolve();
    }, 1000);
  });
}

// Mock government ID verification
async function mockGovernmentIdVerification(data) {
  // In production, this would call actual DGA/government services
  console.log(`🏛️ [MOCK DGA] Verifying government ID:`, {
    national_id: maskSensitiveData(data.national_id, "national_id"),
    first_name: data.first_name,
    last_name: data.last_name,
  });

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const { national_id, first_name, last_name } = data;

  // Simple validation for demo purposes
  if (national_id.length === 13 && first_name && last_name) {
    // Mock successful verification
    return {
      valid: true,
      first_name: first_name,
      last_name: last_name,
      birth_date: data.birth_date || "1990-01-01",
      address: "123 หมู่ 1 ตำบลตัวอย่าง อำเภอตัวอย่าง จังหวัดตัวอย่าง",
      verification_method: "DGA_MOCK",
      verification_level: "HIGH",
      message: "ยืนยันตัวตนสำเร็จผ่านระบบ DGA",
    };
  }

  // Mock failed verification
  return {
    valid: false,
    error_code: "INVALID_DATA",
    message: "ไม่สามารถยืนยันตัวตนได้ กรุณาตรวจสอบข้อมูลอีกครั้ง",
  };
}

// Helper function to mask sensitive data for logging/display
function maskSensitiveData(data, type) {
  if (!data) return "";

  switch (type) {
    case "email":
      const [localPart, domain] = data.split("@");
      if (localPart.length <= 2) {
        return `${localPart.charAt(0)}*@${domain}`;
      }
      const maskedLocal =
        localPart.charAt(0) +
        "*".repeat(Math.max(localPart.length - 2, 1)) +
        localPart.charAt(localPart.length - 1);
      return `${maskedLocal}@${domain}`;

    case "sms":
      const cleanPhone = data.replace(/\D/g, "");
      if (cleanPhone.length <= 6) {
        return cleanPhone.charAt(0) + "*".repeat(cleanPhone.length - 1);
      }
      return (
        cleanPhone.substring(0, 3) +
        "***" +
        cleanPhone.substring(cleanPhone.length - 4)
      );

    case "national_id":
      if (data.length !== 13) return "*".repeat(data.length);
      return (
        data.substring(0, 1) +
        "-****-*****-**-" +
        data.substring(data.length - 1)
      );

    default:
      return data;
  }
}

module.exports = router;
