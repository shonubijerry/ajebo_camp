type RegistrationSuccessData = {
  first_name: string
  registration_number: string
  camp_name: string
}

export const registrationSuccessTemplate = ({
  first_name,
  registration_number,
  camp_name,
}: RegistrationSuccessData) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[TEST] Camp Registration Successful</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
      }
      .email-container {
        max-width: 600px;
        margin: 20px auto;
        background-color: #ffffff;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
      }
      .email-header {
        background-color: #ffffff;
        padding: 20px 24px;
        border-bottom: 1px solid #e0e0e0;
      }
      .email-subject {
        font-size: 20px;
        font-weight: 400;
        color: #202124;
        margin: 0;
      }
      .inbox-label {
        display: inline-block;
        background-color: #f1f3f4;
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        color: #5f6368;
        margin-left: 8px;
      }
      .sender-info {
        display: flex;
        align-items: center;
        padding: 16px 24px;
        background-color: #ffffff;
      }
      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #8ab4f8;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
      }
      .avatar-icon {
        width: 24px;
        height: 24px;
      }
      .sender-details {
        flex: 1;
      }
      .sender-name {
        font-weight: 500;
        color: #202124;
        font-size: 14px;
      }
      .sender-email {
        color: #5f6368;
        font-size: 12px;
      }
      .recipient {
        color: #5f6368;
        font-size: 12px;
        margin-top: 2px;
      }
      .email-body {
        padding: 24px;
        color: #202124;
        font-size: 14px;
        line-height: 1.6;
      }
      .email-body p {
        margin: 0 0 16px;
      }
      .registration-number {
        font-weight: 600;
        margin: 20px 0;
      }
      .qr-code-container {
        text-align: center;
        margin: 30px 0;
        padding: 20px;
        background-color: #f8f9fa;
        border-radius: 8px;
      }
      .qr-code-container img {
        max-width: 200px;
        height: auto;
      }
      .signature {
        margin-top: 24px;
      }
      .email-actions {
        padding: 16px 24px;
        border-top: 1px solid #e0e0e0;
        display: flex;
        gap: 12px;
      }
      .action-button {
        display: inline-flex;
        align-items: center;
        padding: 8px 16px;
        border: 1px solid #dadce0;
        border-radius: 20px;
        background-color: #ffffff;
        color: #5f6368;
        font-size: 14px;
        cursor: pointer;
        text-decoration: none;
      }
      .action-button:hover {
        background-color: #f8f9fa;
      }
    </style>
  </head>
  <body>
    <div class="email-container">

      <div class="email-body">
        <p>Hi ${first_name}</p>

        <p>This is to confirm that your registration for ${camp_name} is successful. Below is your registration number. You will need it at the point of entry to Ajebo</p>

        <p class="registration-number">Registration Number - ${registration_number}</p>
        <p>You can provide us with this number or below qr code at the camp gate for check in.</p>

        <div class="qr-code-container">
          <img src="cid:qr-code" alt="QR Code" />
        </div>

        <div class="signature">
          <p>Happy Camping</p>
          <p>${camp_name} Registration Team</p>
        </div>
      </div>
    </div>
  </body>
</html>`
