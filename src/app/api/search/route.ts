import { NextRequest, NextResponse } from 'next/server';

interface ScreenName {
  name: string;
  start_date: string;
  end_date?: string;
}

interface Account {
  id: number;
  id_str: string;
  screen_names: ScreenName[];
}

interface User {
  username: string;
  accounts: Account[];
}

const formatData = (data: any): User[] => {
  return data.map((username: any) => {
    const accounts = username.accounts.map((account: any) => {
      const screen_names = Object.entries(account.screen_names).map(([name, dates]: [string, any]) => {
        return {
          name,
          start_date: dates?.[0] || null,
          end_date: dates?.[1] || null,
        };
      });

      return {
        id: account.id,
        id_str: account.id_str,
        screen_names,
      };
    });

    return {
      username: username.username,
      accounts,
    };
  });
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const usernames = searchParams.get('usernames');
  const platform = searchParams.get('platform') || 'twitter';
  const token = searchParams.get('token');

  if (!usernames) {
    return NextResponse.json(
      { error: 'Usernames are required' },
      { status: 400 }
    );
  }

  // Split usernames by comma and trim whitespace
  const formattedUsernames = usernames
    .split(',')
    .map((username) => username.trim())
    .join(',');

  try {
    const headers: Record<string, string> = {
      'User-Agent': 'MemoryLoler/1.0',
    };

    // Add authentication if token is provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('GET: Using authenticated request with token:', token.substring(0, 10) + '...');
    } else {
      console.log('GET: Making unauthenticated request');
    }

    const response = await fetch(
      `https://api.memory.lol/v1/${platform}/${encodeURIComponent(formattedUsernames)}`,
      {
        headers,
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { 
            error: 'No data found for these usernames',
            message: 'This could be due to limited access (60-day restriction) or usernames not existing',
            success: false 
          },
          { status: 404 }
        );
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const formattedData = formatData(Object.values(data));
    
    return NextResponse.json({
      success: true,
      data: formattedData,
      platform,
      query: formattedUsernames,
      timestamp: new Date().toISOString(),
      authenticated: !!token,
    });
  } catch (error: any) {
    console.error('MemoryLoler API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch data from Memory.lol',
        details: error.message,
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usernames, platform = 'twitter', token } = body;

    if (!usernames) {
      return NextResponse.json(
        { error: 'Usernames are required' },
        { status: 400 }
      );
    }

    // Handle both string and array inputs
    const usernameArray = Array.isArray(usernames) ? usernames : [usernames];
    const formattedUsernames = usernameArray
      .map((username) => username.trim())
      .join(',');

    const headers: Record<string, string> = {
      'User-Agent': 'MemoryLoler/1.0',
    };

    // Add authentication if token is provided
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('POST: Using authenticated request with token:', token.substring(0, 10) + '...');
    } else {
      console.log('POST: Making unauthenticated request');
    }

    const response = await fetch(
      `https://api.memory.lol/v1/${platform}/${encodeURIComponent(formattedUsernames)}`,
      {
        headers,
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { 
            error: 'No data found for these usernames',
            message: 'This could be due to limited access (60-day restriction) or usernames not existing',
            success: false 
          },
          { status: 404 }
        );
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const formattedData = formatData(Object.values(data));
    
    return NextResponse.json({
      success: true,
      data: formattedData,
      platform,
      query: formattedUsernames,
      timestamp: new Date().toISOString(),
      authenticated: !!token,
    });
  } catch (error: any) {
    console.error('MemoryLoler API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch data from Memory.lol',
        details: error.message,
        success: false 
      },
      { status: 500 }
    );
  }
} 