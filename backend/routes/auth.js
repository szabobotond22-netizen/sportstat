const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendEmail } = require('../utils/mailer');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: '7d'
  });
};

const generateNumericCode = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

const addMinutes = (date, minutes) => {
  return new Date(date.getTime() + minutes * 60000);
};

const createEmailTemplate = ({ title, message, code }) => {
  const codeLine = code
    ? `<div style="margin: 14px 0; padding: 10px; border: 1px solid #1fb874; border-radius: 8px; font-size: 24px; letter-spacing: 4px; font-weight: 700; text-align: center;">${code}</div>`
    : '';

  return `
    <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; color: #122027;">
      <h2 style="margin-bottom: 8px;">${title}</h2>
      <p style="line-height: 1.5;">${message}</p>
      ${codeLine}
      <p style="line-height: 1.5; color: #4b5962; font-size: 14px;">Ha nem te kezdeményezted ezt a műveletet, azonnal változtasd meg a jelszavad.</p>
    </div>
  `;
};

const shouldExposeDevCodes = () => String(process.env.DEV_EXPOSE_EMAIL_CODES || 'true') === 'true';

const issueAndSendLoginCode = async (user) => {
  const loginCode = generateNumericCode();
  user.loginOtpCode = loginCode;
  user.loginOtpExpires = addMinutes(new Date(), 10);
  user.loginOtpPending = true;
  await user.save();

  try {
    const mailResult = await sendEmail({
      to: user.email,
      subject: 'SportStat - Belépési verifikációs kód',
      text: `Belépési kód: ${loginCode}. A kód 10 percig érvényes.`,
      html: createEmailTemplate({
        title: 'Belépési verifikáció',
        message: 'A bejelentkezés folytatásához add meg az alábbi 6 jegyű kódot.',
        code: loginCode,
      }),
    });

    return { loginCode, mailResult };
  } catch (error) {
    user.loginOtpCode = null;
    user.loginOtpExpires = null;
    user.loginOtpPending = false;
    await user.save();
    throw error;
  }
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email or username already exists'
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password
    });

    await user.save();

    let registrationEmailSent = false;
    try {
      const mailResult = await sendEmail({
        to: user.email,
        subject: 'SportStat - Sikeres regisztráció',
        text: `Sikeres regisztráció történt a SportStat oldalon: ${new Date().toLocaleString('hu-HU')}.`,
        html: createEmailTemplate({
          title: 'Sikeres regisztráció',
          message: `A fiókod sikeresen létrejött (${new Date().toLocaleString('hu-HU')}). Most már be tudsz jelentkezni a SportStat felületére.`,
        }),
      });
      registrationEmailSent = mailResult.sent;
    } catch (_registerEmailError) {
      // Non-blocking registration email error.
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      registrationEmailSent,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    try {
      const { loginCode, mailResult } = await issueAndSendLoginCode(user);

      const responsePayload = {
        message: 'Verification code sent to email',
        requiresVerification: true,
        email: user.email,
      };

      if (mailResult.fallback && shouldExposeDevCodes()) {
        responsePayload.message = 'Fejlesztői mód: belépési kód automatikusan elérhető.';
        responsePayload.developmentCode = loginCode;
        responsePayload.emailDeliveryFallback = true;
      }

      return res.json(responsePayload);
    } catch (_emailError) {
      return res.status(503).json({
        message: 'Nem sikerült elküldeni a belépési kódot. Ellenőrizd az SMTP beállításokat.',
      });
    }
  } catch (error) {
    res.status(500).json({
      message: 'Login failed. Check SMTP configuration and try again.',
      details: error.message,
    });
  }
});

// Resend login OTP
router.post('/resend-login-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.loginOtpPending) {
      return res.status(400).json({ message: 'Nincs folyamatban belépési verifikáció ehhez az emailhez.' });
    }

    const { loginCode, mailResult } = await issueAndSendLoginCode(user);

    const responsePayload = {
      message: 'Belépési kód újraküldve.',
      requiresVerification: true,
      email: user.email,
    };

    if (mailResult.fallback && shouldExposeDevCodes()) {
      responsePayload.message = 'Fejlesztői mód: belépési kód automatikusan elérhető.';
      responsePayload.developmentCode = loginCode;
      responsePayload.emailDeliveryFallback = true;
    }

    return res.json(responsePayload);
  } catch (_error) {
    return res.status(503).json({
      message: 'Nem sikerült újraküldeni a belépési kódot.',
    });
  }
});

// Verify login OTP and create session
router.post('/verify-login', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email and verification code are required' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user || !user.loginOtpPending) {
      return res.status(400).json({ message: 'No pending login verification found' });
    }

    const now = new Date();
    if (!user.loginOtpExpires || now > user.loginOtpExpires) {
      user.loginOtpCode = null;
      user.loginOtpExpires = null;
      user.loginOtpPending = false;
      await user.save();
      return res.status(400).json({ message: 'Verification code expired' });
    }

    if (String(user.loginOtpCode) !== String(code).trim()) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    user.loginOtpCode = null;
    user.loginOtpExpires = null;
    user.loginOtpPending = false;
    await user.save();

    const token = generateToken(user._id);

    try {
      await sendEmail({
        to: user.email,
        subject: 'SportStat - Sikeres belépés',
        text: `Sikeres belépés történt a fiókodba: ${new Date().toLocaleString('hu-HU')}.`,
        html: createEmailTemplate({
          title: 'Sikeres belépés',
          message: `Most léptek be a SportStat fiókodba (${new Date().toLocaleString('hu-HU')}).`,
        }),
      });
    } catch (_notifyError) {
      // Non-blocking notification error.
    }

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Start forgot password flow
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.json({ message: 'If this email exists, a reset code has been sent.' });
    }

    const resetCode = generateNumericCode();
    user.passwordResetCode = resetCode;
    user.passwordResetExpires = addMinutes(new Date(), 15);
    await user.save();

    let emailSent = false;
    let usedFallback = false;
    try {
      const mailResult = await sendEmail({
        to: user.email,
        subject: 'SportStat - Jelszó visszaállítási kód',
        text: `Jelszó-visszaállító kód: ${resetCode}. A kód 15 percig érvényes.`,
        html: createEmailTemplate({
          title: 'Jelszó visszaállítás',
          message: 'A jelszó cseréhez add meg az alábbi 6 jegyű kódot.',
          code: resetCode,
        }),
      });

      emailSent = mailResult.sent;
      usedFallback = mailResult.fallback;
    } catch (_emailError) {
      user.passwordResetCode = null;
      user.passwordResetExpires = null;
      await user.save();
    }

    if (usedFallback && shouldExposeDevCodes()) {
      return res.json({
        message: 'Fejlesztői mód: reset kód automatikusan elérhető.',
        emailSent: false,
        emailDeliveryFallback: true,
        developmentCode: resetCode,
      });
    }

    if (!emailSent) {
      user.passwordResetCode = null;
      user.passwordResetExpires = null;
      await user.save();
      return res.status(503).json({
        message: 'Nem sikerült elküldeni a reset kódot. Ellenőrizd az SMTP beállításokat.',
        emailSent: false,
      });
    }

    res.json({ message: 'If this email exists, a reset code has been sent.', emailSent: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Complete password reset flow
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'Email, code and new password are required' });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid reset request' });
    }

    const now = new Date();
    if (!user.passwordResetExpires || now > user.passwordResetExpires) {
      user.passwordResetCode = null;
      user.passwordResetExpires = null;
      await user.save();
      return res.status(400).json({ message: 'Reset code expired' });
    }

    if (String(user.passwordResetCode) !== String(code).trim()) {
      return res.status(400).json({ message: 'Invalid reset code' });
    }

    user.password = newPassword;
    user.passwordResetCode = null;
    user.passwordResetExpires = null;
    user.loginOtpCode = null;
    user.loginOtpExpires = null;
    user.loginOtpPending = false;

    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user profile (protected route)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('favoriteTeams')
      .populate('favoritePlayers');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile (protected route)
router.patch('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const allowedFields = ['username', 'favoriteTeams', 'favoritePlayers'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();
    await user.populate('favoriteTeams favoritePlayers');

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

module.exports = { router, authenticateToken };