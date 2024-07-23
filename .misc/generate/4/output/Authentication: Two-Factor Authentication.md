Sure, here's a detailed prompt for implementing two-factor authentication (2FA) in the User Service:

```typescript
// auth.controller.ts

// ... (existing code)

/**
 * Enable two-factor authentication for a user
 *
 * @route POST /api/auth/2fa/enable
 * @access Private
 * @req.headers Authorization: Bearer {token}
 * @res {qrCode, secret}
 * @res.status 200 - OK
 * @res.status 401 - Unauthorized (invalid token)
 * @res.status 500 - Internal Server Error
 */
export const enable2FA = async (req: Request, res: Response) => {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const secret = speakeasy.generateSecret({ length: 20 });
    const qrCode = speakeasy.toQRCode(secret.ascii);

    // Save the secret to the user record
    user.twoFactorSecret = secret.base32;
    await user.save();

    res.json({ qrCode, secret: secret.base32 });
  } catch (error) {
    console.error('Failed to enable 2FA:', error);
    res.status(500).json({ error: 'Failed to enable 2FA' });
  }
};

/**
 * Verify two-factor authentication code
 *
 * @route POST /api/auth/2fa/verify
 * @access Private
 * @req.headers Authorization: Bearer {token}
 * @req.body {code}
 * @res {message}
 * @res.status 200 - OK
 * @res.status 400 - Bad Request (validation errors)
 * @res.status 401 - Unauthorized (invalid token or code)
 * @res.status 500 - Internal Server Error
 */
export const verify2FA = async (req: Request, res: Response) => {
  // Validate request body
  await body('code').isNumeric().isLength({ min: 6, max: 6 }).run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await getUserFromToken(req);
    if (!user || !user.twoFactorSecret) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { code } = req.body;
    const isCodeValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token: code,
    });

    if (!isCodeValid) {
      return res.status(401).json({ error: 'Invalid 2FA code' });
    }

    res.json({ message: '2FA code verified successfully' });
  } catch (error) {
    console.error('Failed to verify 2FA code:', error);
    res.status(500).json({ error: 'Failed to verify 2FA code' });
  }
};
```

**Requirements Addressed:**

- Implement two-factor authentication (2FA) for enhanced security.

**Dependencies:**

- `speakeasy`: A library for generating and verifying Time-based One-Time Passwords (TOTP) for 2FA.
- `getUserFromToken` utility function: A function to retrieve the user object from the JWT token in the request headers.

**Implementation Details:**

1. **Enable 2FA**: The `enable2FA` function generates a secret key using `speakeasy.generateSecret` and a QR code using `speakeasy.toQRCode`. The secret key is saved to the user's record in the database. The QR code and secret key are returned to the client, allowing the user to set up 2FA in their authenticator app.

2. **Verify 2FA Code**: The `verify2FA` function validates the 2FA code provided by the user. It retrieves the user's secret key from the database and uses `speakeasy.totp.verify` to verify the code. If the code is valid, a success message is returned; otherwise, an error is returned.

**Best Practices and Considerations:**

1. **Input Validation**: Use the `express-validator` middleware to validate the 2FA code input from the client.
2. **Security**: Store the 2FA secret key securely in the database, preferably encrypted or hashed.
3. **User Experience**: Provide clear instructions and guidance to users on setting up and using 2FA, including how to scan the QR code and enter the 2FA code during login.
4. **Backup Codes**: Consider implementing backup codes or recovery mechanisms in case users lose access to their authenticator app.
5. **Logging and Monitoring**: Implement logging and monitoring mechanisms to track 2FA-related events, such as enabling 2FA, failed verification attempts, and successful logins with 2FA.

**Error Handling and Logging:**

Implement proper error handling and logging mechanisms for the 2FA-related endpoints. Log relevant information, such as failed 2FA verification attempts, errors during secret key generation, and any other issues related to 2FA setup or verification.

**Documentation:**

Document the 2FA implementation, including the endpoints, request/response formats, and the overall flow of enabling and verifying 2FA. Provide clear instructions for users on setting up and using 2FA, as well as guidelines for developers on integrating 2FA into the application.

**Security Considerations:**

1. **Input Validation**: Validate the 2FA code input to prevent injection attacks or other malicious input.
2. **Secure Storage**: Store the 2FA secret key securely in the database, preferably encrypted or hashed, to prevent unauthorized access or tampering.
3. **Brute-Force Protection**: Implement rate-limiting or other mechanisms to prevent brute-force attacks on the 2FA verification endpoint.
4. **Secure Communication**: Ensure that the communication between the client and server is encrypted (e.g., using HTTPS) to prevent interception of the 2FA code or secret key.

By following this prompt, you can implement two-factor authentication in the User Service, enhancing the security of the application and providing an additional layer of protection against unauthorized access.