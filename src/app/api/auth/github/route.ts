import { NextRequest, NextResponse } from 'next/server';

const GITHUB_CLIENT_ID = 'b8ab5a8c1a2745d514b7';
const MEMORY_LOL_API = 'https://api.memory.lol';

interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

export async function POST(request: NextRequest) {
  try {
    // Step 1: Get device code from GitHub
    const deviceCodeResponse = await fetch('https://github.com/login/device/code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: `client_id=${GITHUB_CLIENT_ID}`,
    });

    if (!deviceCodeResponse.ok) {
      throw new Error(`GitHub device code request failed: ${deviceCodeResponse.status}`);
    }

    const deviceCodeData: DeviceCodeResponse = await deviceCodeResponse.json();

    return NextResponse.json({
      success: true,
      device_code: deviceCodeData.device_code,
      user_code: deviceCodeData.user_code,
      verification_uri: deviceCodeData.verification_uri,
      expires_in: deviceCodeData.expires_in,
      interval: deviceCodeData.interval,
    });
  } catch (error: any) {
    console.error('GitHub auth error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initiate GitHub authentication',
        details: error.message,
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const deviceCode = searchParams.get('device_code');

  if (!deviceCode) {
    return NextResponse.json(
      { error: 'Device code is required' },
      { status: 400 }
    );
  }

  try {
    // Step 2: Exchange device code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: `device_code=${deviceCode}&client_id=${GITHUB_CLIENT_ID}&grant_type=urn:ietf:params:oauth:grant-type:device_code`,
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('GitHub token response error:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        body: errorText.substring(0, 500) // Log first 500 chars
      });
      throw new Error(`GitHub token exchange failed: ${tokenResponse.status} - ${errorText.substring(0, 100)}`);
    }

    const responseText = await tokenResponse.text();
    console.log('GitHub token response:', responseText);
    
    let tokenData: TokenResponse;
    try {
      tokenData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse GitHub response as JSON:', responseText);
      throw new Error(`Invalid JSON response from GitHub: ${responseText.substring(0, 100)}`);
    }

    if (!tokenData.access_token) {
      return NextResponse.json(
        { 
          error: 'Authentication not completed',
          message: 'Please complete the GitHub authentication process',
          success: false 
        },
        { status: 400 }
      );
    }

    // Step 3: Verify access with Memory.lol
    const memoryLolResponse = await fetch(`https://api.memory.lol/v1/tw/twitter`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'User-Agent': 'MemoryLoler/1.0',
      },
    });

    let memoryLolData;
    const contentType = memoryLolResponse.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      memoryLolData = await memoryLolResponse.json();
    } else {
      const text = await memoryLolResponse.text();
      console.error('Memory.lol returned non-JSON:', text);
      memoryLolData = { error: 'Memory.lol returned non-JSON', details: text };
    }

    return NextResponse.json({
      success: true,
      access_token: tokenData.access_token,
      token_type: tokenData.token_type,
      scope: tokenData.scope,
      memory_lol_status: memoryLolData,
    });
  } catch (error: any) {
    console.error('Token exchange error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to complete authentication',
        details: error.message,
        success: false 
      },
      { status: 500 }
    );
  }
} 