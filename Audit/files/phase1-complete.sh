#!/bin/bash

# Phase 1 Auth Security - Completion Script
# This script copies all production files and runs tests
# Usage: bash phase1-complete.sh

set -e

echo "🔐 Phase 1 Auth Security Implementation"
echo "======================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -f "nuxt.config.ts" ]; then
    echo -e "${RED}❌ Error: Must run from project root${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}📋 Step 1: Copy Utility Files${NC}"

# Copy rate limiter
mkdir -p server/utils/auth
cp -v server_utils_rateLimiter.ts server/utils/auth/rateLimiter.ts
echo -e "${GREEN}✅ Rate limiter copied${NC}"

# Copy password validator
cp -v server_utils_passwordValidator.ts server/utils/auth/passwordValidator.ts
echo -e "${GREEN}✅ Password validator copied${NC}"

# Copy audit logging
cp -v server_utils_auditLog.ts server/utils/auth/auditLog.ts
echo -e "${GREEN}✅ Audit logging copied${NC}"

# Copy CSRF protection
mkdir -p server/utils/security
cp -v server_utils_csrf.ts server/utils/security/csrf.ts
echo -e "${GREEN}✅ CSRF protection copied${NC}"

# Copy error handling
cp -v server_utils_errors.ts server/utils/security/errors.ts
echo -e "${GREEN}✅ Error handling copied${NC}"

# Copy monitoring
mkdir -p server/utils/monitoring
cp -v server_utils_monitoring_authMonitoring.ts server/utils/monitoring/authMonitoring.ts
echo -e "${GREEN}✅ Monitoring copied${NC}"

echo ""
echo -e "${YELLOW}🔌 Step 2: Copy API Endpoints${NC}"

mkdir -p server/api/auth
cp -v server_api_auth_login_improved.post.ts server/api/auth/login.post.ts
echo -e "${GREEN}✅ Login endpoint copied${NC}"

cp -v server_api_auth_register_COMPLETE.post.ts server/api/auth/register.post.ts
echo -e "${GREEN}✅ Register endpoint copied${NC}"

cp -v server_api_auth_forgot_password_COMPLETE.post.ts server/api/auth/forgot-password.post.ts
echo -e "${GREEN}✅ Forgot password endpoint copied${NC}"

cp -v server_api_auth_reset_password_COMPLETE.post.ts server/api/auth/reset-password.post.ts
echo -e "${GREEN}✅ Reset password endpoint copied${NC}"

echo ""
echo -e "${YELLOW}🧪 Step 3: Copy Test Files${NC}"

mkdir -p layers/auth/tests
cp -v auth_security_edge_cases_test.ts layers/auth/tests/auth.security.test.ts
echo -e "${GREEN}✅ Security tests copied${NC}"

cp -v auth_integration_tests_COMPLETE.ts layers/auth/tests/auth.integration.test.ts
echo -e "${GREEN}✅ Integration tests copied${NC}"

echo ""
echo -e "${YELLOW}💾 Step 4: Check Database Schema${NC}"

if grep -q "model AuditLog" prisma/schema.prisma; then
    echo -e "${GREEN}✅ AuditLog model found${NC}"
else
    echo -e "${RED}⚠️  AuditLog model not found. Add it to prisma/schema.prisma${NC}"
fi

if grep -q "model EmailVerificationToken" prisma/schema.prisma; then
    echo -e "${GREEN}✅ EmailVerificationToken model found${NC}"
else
    echo -e "${RED}⚠️  EmailVerificationToken model not found. Add it to prisma/schema.prisma${NC}"
fi

if grep -q "model PasswordResetToken" prisma/schema.prisma; then
    echo -e "${GREEN}✅ PasswordResetToken model found${NC}"
else
    echo -e "${RED}⚠️  PasswordResetToken model not found. Add it to prisma/schema.prisma${NC}"
fi

echo ""
echo -e "${YELLOW}🗄️  Step 5: Run Database Migration${NC}"

read -p "Run 'npx prisma migrate dev --name add_auth_security_tables'? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npx prisma migrate dev --name add_auth_security_tables
    echo -e "${GREEN}✅ Migration complete${NC}"
else
    echo -e "${YELLOW}⏭️  Skipped migration. Run it manually:${NC}"
    echo "   npx prisma migrate dev --name add_auth_security_tables"
fi

echo ""
echo -e "${YELLOW}🧪 Step 6: Run Tests${NC}"

read -p "Run npm tests? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run test:auth || npm test
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ All tests passed${NC}"
    else
        echo -e "${RED}❌ Some tests failed. Check output above.${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Skipped tests. Run manually:${NC}"
    echo "   npm run test:auth"
fi

echo ""
echo -e "${YELLOW}📝 Step 7: Environment Variables${NC}"

if grep -q "REQUIRE_EMAIL_VERIFICATION" .env; then
    echo -e "${GREEN}✅ .env already configured${NC}"
else
    echo -e "${YELLOW}⚠️  Add these to .env:${NC}"
    cat << 'EOF'
REQUIRE_EMAIL_VERIFICATION=true
RATE_LIMIT_LOGIN_ATTEMPTS=5
RATE_LIMIT_LOGIN_WINDOW_MS=900000
RATE_LIMIT_LOGIN_LOCKOUT_MS=1800000
EMAIL_SERVICE_PROVIDER=sendgrid
SENDGRID_API_KEY=your_key_here
SENDER_EMAIL=noreply@reelcart.app
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR_WEBHOOK
EOF
fi

echo ""
echo -e "${YELLOW}🚀 Step 8: Build & Test${NC}"

read -p "Run 'npm run build'? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run build
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Build successful${NC}"
    else
        echo -e "${RED}❌ Build failed. Check output above.${NC}"
    fi
else
    echo -e "${YELLOW}⏭️  Skipped build. Run manually: npm run build${NC}"
fi

echo ""
echo -e "${GREEN}✨ Phase 1 Implementation Complete!${NC}"
echo ""
echo "📋 Checklist:"
echo "  [x] Files copied"
echo "  [ ] Database migrated (run: npx prisma migrate dev --name add_auth_security_tables)"
echo "  [ ] Tests passed (run: npm run test:auth)"
echo "  [ ] .env configured"
echo "  [ ] Manual testing done"
echo "  [ ] Staging deployed"
echo ""
echo "Next steps:"
echo "1. Run: npx prisma studio (verify tables)"
echo "2. Run: npm run dev (start dev server)"
echo "3. Test endpoints manually"
echo "4. Deploy to staging"
echo "5. Monitor metrics"
echo ""
echo -e "${GREEN}Good luck! 🚀${NC}"
