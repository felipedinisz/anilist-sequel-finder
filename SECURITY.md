# 🔒 Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please send an email to the maintainer. All security vulnerabilities will be promptly addressed.

**Please do not open a public issue for security vulnerabilities.**

## Security Best Practices

### For Users

1. **Never commit `.env` files** containing real credentials
2. **Use `.env.example`** as a template, then create your own `.env`
3. **Rotate tokens regularly** - Generate new AniList tokens periodically
4. **Keep dependencies updated** - Run `pip install --upgrade` regularly
5. **Use strong secrets** - Generate random strings for `SECRET_KEY` and `JWT_SECRET_KEY`

### Generating Secure Keys

```bash
# Generate a secure SECRET_KEY
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Generate a secure JWT_SECRET_KEY
python -c "import secrets; print(secrets.token_hex(32))"
```

### Environment Variables

The following variables must **NEVER** be committed:

- `SECRET_KEY` - Application secret key
- `JWT_SECRET_KEY` - JWT signing key
- `ANILIST_CLIENT_ID` - AniList OAuth client ID
- `ANILIST_CLIENT_SECRET` - AniList OAuth client secret
- `DATABASE_URL` - Database connection string (if contains credentials)
- Any user access tokens

### `.gitignore` Protection

Ensure your `.gitignore` includes:

```
.env
*.env
!.env.example
*.key
*.pem
*.secret
```

## Known Security Considerations

### 1. Token Storage

- User access tokens are stored in the database
- **Production TODO**: Implement encryption at rest for tokens
- Consider using environment-specific encryption keys

### 2. CORS Configuration

- Default CORS allows `localhost:3000` and `localhost:8000`
- **Production**: Update `CORS_ORIGINS` to only allow your production domain

### 3. Rate Limiting

- Basic rate limiting is configured via `RATE_LIMIT_PER_MINUTE`
- **Production TODO**: Implement Redis-based distributed rate limiting

### 4. JWT Tokens

- Default expiration: 7 days (`ACCESS_TOKEN_EXPIRE_MINUTES=10080`)
- Uses HS256 algorithm
- **Production**: Consider shorter expiration times and refresh tokens

### 5. Database

- Development uses SQLite (file-based)
- **Production**: Use PostgreSQL with proper authentication
- Never expose database files publicly

### 6. HTTPS

- Development runs on HTTP
- **Production REQUIRED**: Use HTTPS/TLS for all API endpoints
- Recommended: Use reverse proxy (nginx/traefik) with Let's Encrypt

## Vulnerability Disclosure Timeline

1. **Day 0**: Vulnerability reported privately
2. **Day 1-7**: Assessment and patch development
3. **Day 7-14**: Testing and verification
4. **Day 14**: Public disclosure and patch release

## Security Checklist for Production

- [ ] Use HTTPS/TLS everywhere
- [ ] Rotate all default secrets
- [ ] Enable database encryption at rest
- [ ] Implement proper CORS restrictions
- [ ] Use environment variables (never hardcode secrets)
- [ ] Set up automated dependency scanning (Dependabot, Snyk)
- [ ] Enable security headers (HSTS, CSP, X-Frame-Options)
- [ ] Implement rate limiting with Redis
- [ ] Set up logging and monitoring
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Use secrets management (Vault, AWS Secrets Manager, etc.)

## Dependencies

We use automated dependency scanning via:

- GitHub Dependabot (configured)
- `pip-audit` for Python package vulnerabilities

Run security audit:

```bash
pip install pip-audit
pip-audit
```

## Contact

For security concerns: Create a private security advisory on GitHub or contact the maintainer directly.

---

**Last Updated**: November 2025
