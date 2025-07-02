"use client";

import { AuthModal } from "@/components/auth-modal";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  Clock,
  Copy,
  Github,
  Hash,
  Info,
  Search,
  Shield,
  User,
  XCircle
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

interface SearchResult {
  success: boolean;
  data?: User[];
  query?: string;
  timestamp?: string;
  authenticated?: boolean;
  error?: string;
  message?: string;
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const exampleQueries = [
    "libsoftiktok",
    "elonmusk", 
    "jack",
    "zuck",
    "kanyewest"
  ];

  // Load auth token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('memoryloler_auth_token');
    if (savedToken) {
      setAuthToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuthSuccess = (token: string) => {
    setAuthToken(token);
    setIsAuthenticated(true);
    localStorage.setItem('memoryloler_auth_token', token);
    setShowAuthModal(false);
    toast.success('Authentication successful! You now have full access.');
  };

  const handleLogout = () => {
    setAuthToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('memoryloler_auth_token');
    toast.success('Logged out successfully');
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      const url = new URL('/api/search', window.location.origin);
      url.searchParams.set('usernames', searchQuery);
      url.searchParams.set('platform', 'twitter');
      if (authToken) {
        url.searchParams.set('token', authToken);
      }

      const response = await fetch(url.toString());
      const result = await response.json();
      
      if (result.success) {
        setSearchResults(result);
        toast.success(`Found data for ${result.data?.length || 0} username(s)${result.authenticated ? ' (Full Access)' : ' (Limited Access)'}`);
      } else {
        setSearchResults(result);
        if (result.error === 'No data found for these usernames' && !isAuthenticated) {
          toast.error('No data found. Try authenticating for full access to historical data.');
        } else {
          toast.error(result.error || 'Search failed');
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Failed to search. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const renderSearchResults = () => {
    if (!searchResults) return null;

    // Handle error case
    if (!searchResults.success) {
      return (
        <div className="mt-8 space-y-6">
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center space-x-2">
                <XCircle className="h-5 w-5" />
                <span>Search Error</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-destructive font-medium">{searchResults.error}</p>
                {searchResults.message && (
                  <p className="text-sm text-muted-foreground">{searchResults.message}</p>
                )}
                {!isAuthenticated && searchResults.error === 'No data found for these usernames' && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-orange-800 mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">Limited Access</span>
                    </div>
                    <p className="text-sm text-orange-700 mb-3">
                      Public access is limited to data from the past 60 days. Authenticate with GitHub for full access to 12 years of historical data.
                    </p>
                    <p className="text-xs text-orange-600 mb-3">
                      Note: Full access requires manual approval by the Memory.lol team for researchers, journalists, and activists.
                    </p>
                    <Button 
                      onClick={() => setShowAuthModal(true)}
                      variant="outline"
                      size="sm"
                      className="border-orange-300 text-orange-700 hover:bg-orange-100"
                    >
                      <Github className="mr-2 h-4 w-4" />
                      Get Full Access
                    </Button>
                  </div>
                )}
                {isAuthenticated && searchResults.error === 'No data found for these usernames' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 text-blue-800 mb-2">
                      <Info className="h-4 w-4" />
                      <span className="text-sm font-medium">Approval Required</span>
                    </div>
                    <p className="text-sm text-blue-700 mb-3">
                      You are authenticated, but your GitHub account is <b>not approved</b> for full access to Memory.lol.<br />
                      You must request approval from the Memory.lol admin to access the full historical index.
                    </p>
                    <a
                      href="https://api.memory.lol/v1/login/github"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-800 underline hover:no-underline"
                    >
                      Check your approval status
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    if (!searchResults.data) return null;

    const searchedUsernames = searchQuery.split(',').map((username) => username.trim());
    const foundUsernames = searchResults.data.flatMap((user) =>
      user.accounts.flatMap((account) =>
        account.screen_names.map((screenName) => screenName.name)
      )
    );

    const notFoundUsernames = searchedUsernames.filter(
      (username) => !foundUsernames.includes(username)
    );

    return (
      <div className="mt-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Search Results</h2>
          {searchResults.authenticated && (
            <Badge variant="default" className="bg-green-600">
              <Shield className="mr-1 h-3 w-3" />
              Full Access
            </Badge>
          )}
        </div>

        {/* Account Results */}
        {searchResults.data.map((user) => {
          if (user.accounts.length === 0) {
            return null;
          }
          return (
            <Card key={user.username} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <User className="h-5 w-5" />
                      <span>@{user.username}</span>
                    </CardTitle>
                    <CardDescription>
                      {user.accounts.length} account(s) found
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">
                    {user.accounts.reduce((acc, account) => acc + account.screen_names.length, 0)} usernames
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {user.accounts.map((account, accountIndex) => (
                  <div key={account.id} className="mb-6 last:mb-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <Hash className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <h3 className="font-semibold">Account ID: {account.id}</h3>
                          <p className="text-sm text-muted-foreground">ID String: {account.id_str}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(account.id.toString())}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                        Screen Name History ({account.screen_names.length})
                      </h4>
                      <div className="grid gap-3">
                        {account.screen_names.map((screenName, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center space-x-3">
                              <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
                                @{screenName.name}
                              </span>
                              {screenName.start_date ? (
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <span>
                                    {screenName.end_date 
                                      ? `${screenName.start_date} - ${screenName.end_date}`
                                      : `Seen on ${screenName.start_date}`
                                    }
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                  <Info className="h-4 w-4" />
                                  <span>Date unknown</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {index === 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  Current
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}

        {/* Not Found Section */}
        {notFoundUsernames.length > 0 && (
          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center space-x-2">
                <XCircle className="h-5 w-5" />
                <span>Not Found ({notFoundUsernames.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {notFoundUsernames.map((username) => (
                  <Badge key={username} variant="outline" className="text-destructive">
                    @{username}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        isAuthenticated={isAuthenticated}
        onLogin={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />
      <main className="flex-1 w-full mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center space-y-6 mb-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            MEMORYLOLER
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Search Twitter username history
          </p>
          {!isAuthenticated && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center space-x-2 text-orange-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Limited Access</span>
              </div>
              <p className="text-sm text-orange-700 mt-1">
                Public access is limited to data from the past 60 days. 
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="text-orange-800 underline hover:no-underline ml-1"
                >
                  Authenticate for full access
                </button>
              </p>
              <p className="text-xs text-orange-600 mt-2">
                Note: Full access requires manual approval by the Memory.lol team
              </p>
            </div>
          )}
        </div>
        {/* Search Section */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Twitter Username(s)</Label>
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Input
                      className="border border-primary/50"
                      id="search"
                      placeholder="Enter username(s) separated by commas (e.g., libsoftiktok, elonmusk)"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Button 
                    onClick={handleSearch} 
                    disabled={isSearching || !searchQuery.trim()}
                    className="px-8"
                  >
                    {isSearching ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Searching...</span>
                      </div>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Try: {exampleQueries.join(", ")}</p>
              </div>
            </div>
          </Card>
          {renderSearchResults()}
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onAuthSuccess={handleAuthSuccess}
        />
      </main>
      <Footer />
    </div>
  );
}
