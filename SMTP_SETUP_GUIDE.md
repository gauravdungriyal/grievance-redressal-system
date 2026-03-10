# 📧 Google SMTP Setup Guide

Follow these steps to configure your system to send emails using your Gmail account.

## Step 1: Generate a Google App Password
Since 2022, Google requires an **App Password** for third-party scripts. Your regular Gmail password will **not** work.

1.  Go to your [Google Account Settings](https://myaccount.google.com/).
2.  Click on **Security** in the left menu.
3.  Ensure **2-Step Verification** is turned **ON**. (Required to generate App Passwords).
4.  In the search bar at the top, type **"App Passwords"** and click on the result.
5.  Enter a name (e.g., `Grievance System`) and click **Create**.
6.  **Copy the 16-character code** shown in the yellow box. This is your `SMTP_PASS`.

---

## Step 2: Configure your `.env` File
Open your `server/.env` file and fill in the details as follows:

```env
# --- SMTP Configuration ---
# The server that sends the mail (Google's SMTP server)
SMTP_HOST=smtp.gmail.com

# Port 587 is the most compatible port for Gmail
SMTP_PORT=587

# Your full Gmail address (e.g., mahesh@gmail.com)
SMTP_USER=your-email@gmail.com

# For Gmail, this MUST be the same as SMTP_USER. 
# You cannot use "no-reply@csdept.com" without a custom domain.
EMAIL_FROM=your-email@gmail.com

# The name people will see in their inbox (e.g. "Grievance System")
FROM_NAME=Grievance Redressal System

# Your deployed website URL (for links in emails)
APP_URL=https://your-app-name.render.com

# --- Notification Recipients ---
# These are the people who will receive the notifications
COURSE_COORD_EMAIL=coordinator@example.com
IT_SUPPORT_EMAIL=it-support@example.com
LAB_COORD_BSCIT=lab-it@example.com
LAB_COORD_BCA=lab-bca@example.com
LAB_COORD_MCA=lab-mca@example.com
```

---

## Step 3: Verify the Setup
Once you have saved the `.env` file, you can test if everything is working correctly by running this command in your terminal (inside the `server` folder):

```bash
node test-mailer.js
```

### 💡 Common Issues
- **Authentication Failed**: Double-check your `SMTP_USER` and `SMTP_PASS`. Ensure the App Password is correct.
- **Connection Timeout / Unreachable**:
    - I have forced the system to use **IPv4** (your network was struggling with IPv6).
    - We switched to **Port 587**, which is more likely to be open on home/office networks than port 465.
- **Emails in Spam**: Sometimes first emails go to spam. Mark them as "Not Spam" to train the filter.
