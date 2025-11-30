import nodemailer from 'nodemailer'

// Create a transporter (mock or real if env vars exist)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'test@example.com',
    pass: process.env.EMAIL_PASS || 'password',
  },
})

export const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.EMAIL_USER) {
      console.log('📧 [Mock Email] To:', to)
      console.log('Subject:', subject)
      // console.log('Body:', html)
      return true
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"SevaSetu" <noreply@sevasetu.org>',
      to,
      subject,
      html,
    })

    console.log('Message sent: %s', info.messageId)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

export const sendAttendanceConfirmation = async (user, event, pointsEarned) => {
  const subject = `Attendance Confirmed: ${event.title}`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Attendance Confirmed!</h2>
      <p>Hi ${user.firstName},</p>
      <p>Thank you for attending <strong>${event.title}</strong>.</p>
      <p>Your attendance has been verified successfully.</p>
      
      <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-weight: bold;">Points Earned: +${pointsEarned}</p>
        <p style="margin: 5px 0 0 0;">Total Points: ${user.points}</p>
      </div>

      <p>Keep up the great work making a difference!</p>
      <p>Best regards,<br>The SevaSetu Team</p>
    </div>
  `
  return sendEmail(user.email, subject, html)
}

export const sendLevelUpNotification = async (user, newLevel) => {
  const subject = `🎉 Congratulations! You've reached Level ${newLevel}!`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #D97706;">Level Up! 🌟</h2>
      <p>Hi ${user.firstName},</p>
      <p>Incredible dedication! You've earned enough points to reach <strong>Level ${newLevel}</strong>.</p>
      
      <p>Your commitment to social service is inspiring. Thank you for being a vital part of our community.</p>

      <p>Best regards,<br>The SevaSetu Team</p>
    </div>
  `
  return sendEmail(user.email, subject, html)
}
