import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
const COST_TRACKER_PATH = "/Users/jacma/.openclaw/workspace/costs/api-cost-tracker.js";

interface CostData {
  provider: string;
  cost: number;
  requests: number;
  tokens: number;
}

interface AnthropicUsageResult {
  amount: { value: number; currency: string };
  line_item?: string;
  tokens_input?: number;
  tokens_output?: number;
  requests?: number;
}

interface OpenAIUsageResult {
  input_tokens: number;
  output_tokens: number;
  num_model_requests: number;
}

// API key detection from environment or secrets file
function getAPIKeys() {
  // Try to load from secrets file
  let secrets: Record<string, string> = {};
  try {
    const fs = require('fs');
    const path = require('path');
    const secretsPath = path.join(process.cwd(), '../.secrets/ai-provider-keys.env');
    
    if (fs.existsSync(secretsPath)) {
      const secretsContent = fs.readFileSync(secretsPath, 'utf8');
      const lines = secretsContent.split('\n');
      
      lines.forEach((line: string) => {
        if (line.trim() && !line.startsWith('#') && line.includes('=')) {
          const [key, ...valueParts] = line.split('=');
          const value = valueParts.join('=').trim();
          if (value && value !== '') {
            secrets[key.trim()] = value;
          }
        }
      });
    }
  } catch (error) {
    console.log('Could not load secrets file, falling back to environment variables');
  }

  return {
    anthropic: secrets['ANTHROPIC_API_KEY'] || process.env.ANTHROPIC_API_KEY || null,
    openai: secrets['OPENAI_API_KEY'] || process.env.OPENAI_API_KEY || null,
    google: secrets['GOOGLE_APPLICATION_CREDENTIALS'] || secrets['GCLOUD_API_KEY'] || 
            process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GCLOUD_API_KEY || null,
  };
}

// Fetch Anthropic usage data
async function fetchAnthropicUsage(apiKey: string): Promise<CostData | null> {
  try {
    const startTime = new Date();
    startTime.setDate(1); // Start of current month
    const endTime = new Date();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(
      `https://api.anthropic.com/v1/organizations/cost_report?starting_at=${startTime.toISOString()}&ending_at=${endTime.toISOString()}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        signal: controller.signal,
      }
    );
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Anthropic API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const results = data.results || [];
    
    let totalCost = 0;
    let totalTokens = 0;
    let totalRequests = 0;

    results.forEach((result: AnthropicUsageResult) => {
      totalCost += result.amount?.value || 0;
      totalTokens += (result.tokens_input || 0) + (result.tokens_output || 0);
      totalRequests += result.requests || 0;
    });

    return {
      provider: "Anthropic (Real)",
      cost: totalCost,
      requests: totalRequests,
      tokens: totalTokens,
    };
  } catch (error) {
    console.warn('Failed to fetch Anthropic usage:', error);
    return null;
  }
}

// Fetch OpenAI usage data
async function fetchOpenAIUsage(apiKey: string): Promise<CostData | null> {
  try {
    const startTime = Math.floor(Date.now() / 1000) - (30 * 24 * 60 * 60); // 30 days ago
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    // Fetch usage data
    const usageResponse = await fetch(
      `https://api.openai.com/v1/organization/usage/completions?start_time=${startTime}&limit=30`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      }
    );

    // Fetch cost data
    const costsResponse = await fetch(
      `https://api.openai.com/v1/organization/costs?start_time=${startTime}&limit=30`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      }
    );
    
    clearTimeout(timeoutId);

    let totalCost = 0;
    let totalTokens = 0;
    let totalRequests = 0;

    // Process costs
    if (costsResponse.ok) {
      const costsData = await costsResponse.json();
      costsData.data?.forEach((bucket: any) => {
        bucket.results?.forEach((result: any) => {
          totalCost += result.amount?.value || 0;
        });
      });
    }

    // Process usage
    if (usageResponse.ok) {
      const usageData = await usageResponse.json();
      usageData.data?.forEach((bucket: any) => {
        bucket.results?.forEach((result: OpenAIUsageResult) => {
          totalTokens += (result.input_tokens || 0) + (result.output_tokens || 0);
          totalRequests += result.num_model_requests || 0;
        });
      });
    }

    if (!usageResponse.ok && !costsResponse.ok) {
      return null;
    }

    return {
      provider: "OpenAI (Real)",
      cost: totalCost,
      requests: totalRequests,
      tokens: totalTokens,
    };
  } catch (error) {
    console.warn('Failed to fetch OpenAI usage:', error);
    return null;
  }
}

// Fetch Google Cloud Billing data  
async function fetchGoogleUsage(credentials: string): Promise<CostData | null> {
  try {
    // Note: Google Cloud Billing API requires more complex setup with service accounts
    // For now, we'll return null and rely on estimates
    // TODO: Implement proper Google Cloud Billing API integration
    console.warn('Google Cloud Billing API not yet implemented - using estimates');
    return null;
  } catch (error) {
    console.warn('Failed to fetch Google usage:', error);
    return null;
  }
}

// Get fallback estimates
function getFallbackEstimates(): CostData[] {
  return [
    { provider: "Anthropic (Est)", cost: 8.50, requests: 45, tokens: 120000 },
    { provider: "Google/Gemini (Est)", cost: 1.20, requests: 180, tokens: 450000 },
    { provider: "OpenAI (Est)", cost: 2.80, requests: 95, tokens: 180000 },
    { provider: "Helius", cost: 0, requests: 2500, tokens: 0 },
    { provider: "DexScreener", cost: 0, requests: 1200, tokens: 0 },
  ];
}

export async function GET() {
  try {
    let costs: CostData[] = [];
    const apiKeys = getAPIKeys();
    
    // Try to get real usage data from each provider
    const realUsagePromises: Promise<CostData | null>[] = [];
    
    if (apiKeys.anthropic) {
      realUsagePromises.push(fetchAnthropicUsage(apiKeys.anthropic));
    }
    
    if (apiKeys.openai) {
      realUsagePromises.push(fetchOpenAIUsage(apiKeys.openai));
    }
    
    if (apiKeys.google) {
      realUsagePromises.push(fetchGoogleUsage(apiKeys.google));
    }
    
    // Wait for all API calls to complete (with timeout)
    const realUsageResults = await Promise.allSettled(
      realUsagePromises.map(promise => 
        Promise.race([
          promise,
          new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 8000)
          )
        ])
      )
    );
    
    // Collect successful results (ensure cost is a number)
    realUsageResults.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        const costData = result.value;
        costData.cost = Number(costData.cost || 0);
        costData.requests = Number(costData.requests || 0);
        costData.tokens = Number(costData.tokens || 0);
        costs.push(costData);
      }
    });
    
    // Fill in with estimates for missing providers
    const fallbackEstimates = getFallbackEstimates();
    const existingProviders = new Set(costs.map(c => c.provider.split(' ')[0]));
    
    fallbackEstimates.forEach(estimate => {
      const providerName = estimate.provider.split(' ')[0];
      if (!existingProviders.has(providerName)) {
        costs.push(estimate);
      }
    });
    
    // Also try the legacy cost tracker script as backup
    try {
      const { stdout } = await execAsync(`node ${COST_TRACKER_PATH} --json`, {
        timeout: 5000,
      });
      const parsed = JSON.parse(stdout);
      if (parsed.costs && Array.isArray(parsed.costs) && parsed.costs.length > 0) {
        // Merge with any additional data from the script
        parsed.costs.forEach((scriptCost: CostData) => {
          if (!costs.some(c => c.provider === scriptCost.provider)) {
            costs.push(scriptCost);
          }
        });
      }
    } catch (scriptError) {
      console.log('Legacy cost tracker script not available or failed');
    }

    const totalCost = costs.reduce((sum, c) => sum + Number(c.cost || 0), 0);
    const totalRequests = costs.reduce((sum, c) => sum + Number(c.requests || 0), 0);
    const totalTokens = costs.reduce((sum, c) => sum + Number(c.tokens || 0), 0);

    const monthlyBudget = 50;
    const currentDay = new Date().getDate();
    const daysInMonth = new Date(2026, 2, 0).getDate(); // Feb 2026
    const projectedMonthly = (totalCost / currentDay) * daysInMonth;
    const dailyAverage = totalCost / currentDay;
    const remaining = monthlyBudget - totalCost;
    const budgetUsedPercent = (totalCost / monthlyBudget) * 100;

    // Data source info
    const realDataSources = costs.filter(c => c.provider.includes('(Real)')).map(c => c.provider.split(' ')[0]);
    const estimatedSources = costs.filter(c => c.provider.includes('(Est)')).map(c => c.provider.split(' ')[0]);
    
    return NextResponse.json({
      monthToDate: totalCost,
      monthlyBudget,
      projectedMonthly,
      dailyAverage,
      remaining,
      budgetUsedPercent,
      currentDay,
      daysInMonth,
      totalRequests,
      totalTokens,
      costs,
      dataSources: {
        realData: realDataSources,
        estimates: estimatedSources,
        availableKeys: {
          anthropic: !!apiKeys.anthropic,
          openai: !!apiKeys.openai,
          google: !!apiKeys.google,
        }
      },
      optimizations: [
        { done: true, text: "Switched trading crons from GPT-4.1 to Gemini Flash (~80% savings)" },
        { done: true, text: "Using Helius free tier (50k req/day)" },
        { done: false, text: "Consider batching API calls where possible" },
        { done: false, text: "Cache DexScreener responses (5 min TTL)" },
        { done: true, text: "Set up real API cost tracking for available providers" },
      ],
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Costs API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cost data" },
      { status: 500 }
    );
  }
}
