# API Cost Tracking Setup

The Command Center dashboard now supports real-time API cost tracking for major AI providers. By default, it uses estimates, but you can set up API keys to get real usage data.

## Supported Providers

### ✅ OpenAI
- **API Endpoint**: `https://api.openai.com/v1/organization/usage/completions` and `/costs`
- **Key Type Required**: Organization Admin API Key
- **What we track**: Token usage, request counts, and actual costs
- **Setup**: Get admin key from [OpenAI Platform](https://platform.openai.com/api-keys)

### ✅ Anthropic
- **API Endpoint**: `https://api.anthropic.com/v1/organizations/cost_report`
- **Key Type Required**: Admin API Key
- **What we track**: Token usage, request counts, and actual costs  
- **Setup**: Get admin key from [Anthropic Console](https://console.anthropic.com/account/keys)

### 🔄 Google Cloud (In Progress)
- **API Endpoint**: Google Cloud Billing API
- **Key Type Required**: Service Account with Billing permissions
- **Status**: Framework in place, full implementation pending
- **Fallback**: Uses estimates for now

## Setup Instructions

1. **Add API Keys**:
   Edit `/Users/jacma/.openclaw/workspace/.secrets/ai-provider-keys.env`:
   ```bash
   ANTHROPIC_API_KEY=your_admin_key_here
   OPENAI_API_KEY=your_admin_key_here
   ```

2. **Key Requirements**:
   - Keys must be **Admin/Organization level**, not regular API keys
   - Regular user API keys cannot access usage/billing endpoints
   - Test your keys have proper permissions before adding

3. **Restart Dashboard**:
   The dashboard will automatically pick up the new keys on next load

## What You'll See

- **Real Data**: Shows "(Real)" in provider names when API data is available
- **Estimates**: Shows "(Est)" when using fallback estimates  
- **Mixed Mode**: Some providers real, others estimated based on available keys

## API Key Security

- Keys are stored in `.secrets/` directory (gitignored)
- Never commit API keys to version control
- Keys are only loaded server-side for API calls
- Consider using environment variables in production

## Troubleshooting

**"No real data showing"**:
- Check API key permissions (must be admin/org level)
- Verify keys are properly formatted in the secrets file
- Check browser dev tools for API errors

**"API timeouts"**:
- APIs have 5-8 second timeouts to avoid hanging
- Falls back to estimates if APIs are slow/unavailable

**"Mixed real/estimate data"**:
- This is normal - only providers with valid keys show real data
- Add missing API keys to get full real-time tracking

## Future Enhancements

- Google Cloud Billing API integration
- Historical cost trending
- Budget alerts and notifications
- Per-project cost breakdown
- Usage optimization recommendations

---

*Last Updated: February 2, 2026*