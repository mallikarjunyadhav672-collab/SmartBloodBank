"""Email service module for notifications."""
import os
from flask_mail import Mail, Message
from flask import current_app

mail = Mail()


def send_email(to_email: str, subject: str, body: str, html: str = None):
    """Send email asynchronously if configured, otherwise log."""
    try:
        if not current_app.config.get('MAIL_SERVER'):
            current_app.logger.info(f"Email to {to_email}: {subject}")
            return True
        msg = Message(subject=subject, recipients=[to_email], body=body, html=html or body)
        mail.send(msg)
        return True
    except Exception as e:
        current_app.logger.error(f"Failed to send email to {to_email}: {e}")
        return False


def send_verification_email(user):
    """Send email verification link."""
    token = user.generate_token(expires_in=3600)  # 1 hour
    verify_url = f"{os.environ.get('FRONTEND_URL', 'http://localhost:5173')}/verify/{token}"
    subject = "Verify your SmartBloodBank email"
    body = f"Click here to verify: {verify_url}"
    html = f'<p>Verify your email: <a href="{verify_url}">Click here</a></p>'
    return send_email(user.email, subject, body, html)


def send_request_notification(receiver_email: str, donor_name: str, blood_group: str, units: int):
    """Notify receiver when donor responds."""
    subject = f"Good news! Donor {donor_name} is willing to donate {blood_group}"
    body = f"{donor_name} has responded to your blood request for {units} unit(s) of {blood_group}. Contact them ASAP!"
    html = f'<h3>Donor Response!</h3><p>{donor_name} ({blood_group}) wants to help. Contact details will be in your dashboard.</p>'
    return send_email(receiver_email, subject, body, html)


def send_donation_confirmation(donor_email: str, receiver_name: str):
    """Notify donor after successful donation."""
    subject = "Thank you for donating!"
    body = f"Your blood donation to {receiver_name} has been recorded. Your next eligible donation date is 56 days from now."
    html = f'<h3>Donation Recorded</h3><p>Thank you for helping {receiver_name}! You can donate again after 56 days.</p>'
    return send_email(donor_email, subject, body, html)
