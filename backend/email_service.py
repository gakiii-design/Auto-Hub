import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from jinja2 import Template
from config import Config
import logging

logger = logging.getLogger(__name__)

class EmailService:
    def __init__(self):
        self.config = Config()
        
    def send_booking_confirmation(self, booking_details):
        """Send booking confirmation email to user"""
        try:
            subject = f"Booking Confirmed - {booking_details['service_type']}"
            
            html_template = """
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4; }
                    .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; }
                    .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { padding: 20px; }
                    .booking-details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    .footer { text-align: center; color: #666; margin-top: 20px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Booking Confirmed!</h1>
                    </div>
                    <div class="content">
                        <h2>Hello {{ customer_name }},</h2>
                        <p>Your service booking has been confirmed. Here are your booking details:</p>
                        
                        <div class="booking-details">
                            <h3>Booking Details</h3>
                            <p><strong>Service Type:</strong> {{ service_type }}</p>
                            <p><strong>Date:</strong> {{ date }}</p>
                            <p><strong>Time:</strong> {{ time }}</p>
                            <p><strong>Booking ID:</strong> #{{ booking_id }}</p>
                            <p><strong>Status:</strong> {{ status }}</p>
                        </div>
                        
                        <p>We'll send you a reminder closer to your appointment date.</p>
                        <p>If you need to reschedule or cancel, please contact us.</p>
                        
                        <p>Thank you for choosing Auto-Hub!</p>
                    </div>
                    <div class="footer">
                        <p>Auto-Hub Service Center<br>
                        Email: support@autohub.com<br>
                        Phone: (555) 123-4567</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            template = Template(html_template)
            html_body = template.render(
                customer_name=booking_details.get('customer_name', 'Valued Customer'),
                service_type=booking_details['service_type'],
                date=booking_details['date'],
                time=booking_details['time'],
                booking_id=booking_details['booking_id'],
                status=booking_details['status']
            )
            
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = self.config.MAIL_DEFAULT_SENDER
            msg['To'] = booking_details['user_email']
            
            html_part = MIMEText(html_body, 'html')
            msg.attach(html_part)
            
            self._send_email(msg)
            
            logger.info(f"Booking confirmation email sent to {booking_details['user_email']}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending booking confirmation email: {str(e)}")
            return False
    
    def _send_email(self, msg):
        """Send email using SMTP"""
        try:
            with smtplib.SMTP(self.config.MAIL_SERVER, self.config.MAIL_PORT) as server:
                server.starttls()
                server.login(self.config.MAIL_USERNAME, self.config.MAIL_PASSWORD)
                server.send_message(msg)
        except Exception as e:
            logger.error(f"SMTP error: {str(e)}")
            raise
