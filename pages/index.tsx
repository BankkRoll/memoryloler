import { useState, ChangeEvent } from 'react';

interface ScreenName {
  name: string;
  start_date: string;
  end_date?: string;
}

interface Account {
  id: number;
  screen_names: ScreenName[];
}

interface User {
  username: string;
  accounts: Account[];
}

const IndexPage = () => {
  const [usernames, setUsernames] = useState<string>('');
  const [result, setResult] = useState<User[] | null>(null);

  const searchUsernames = async () => {
    try {
      const formattedUsernames = usernames.includes(',') ? usernames : usernames + ',';
      const response = await fetch(`/api/twit?usernames=${encodeURIComponent(formattedUsernames)}`);
      const data = await response.json() as User[];
      setResult(data);
    } catch (error) {
      console.error(error);
    }
  };

  const formatAccount = (account: Account) => (
    <div key={account.id} className="mb-4">
      {account.screen_names.map((screenName) => (
        <p key={screenName.name}>
        <h2 className="text-2xl font-bold mb-2">Username: @{screenName.name}</h2>
        <h3 className="text-lg font-semibold">ID: {account.id}</h3>

          {screenName.name} (from {screenName.start_date} to {screenName.end_date || 'present'})
        </p>
      ))}
    </div>
  );

  const formatResult = () => {
    if (!result) {
      return null;
    }
  
    const searchedUsernames = usernames.split(',').map((username) => username.trim());
    const foundUsernames = result.flatMap((user) =>
      user.accounts.flatMap((account) =>
        account.screen_names.map((screenName) => screenName.name)
      )
    );
  
    const notFoundUsernames = searchedUsernames.filter(
      (username) => !foundUsernames.includes(username)
    );
  
    return (
      <div>
        {result.map((user) => {
          if (user.accounts.length === 0) {
            return null;
          }
          return (
            <div key={user.username} className="mb-8">
              {user.accounts.map(formatAccount)}
            </div>
          );
        })}
        {notFoundUsernames.length > 0 && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Not Found:</h2>
            <ul>
              {notFoundUsernames.map((username) => (
                <li key={username}>{username}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-blue-500 p-4 text-black flex flex-col">
      <div className="max-w-4xl mx-auto my-auto">
      <h1 className="text-4xl font-bold mb-4">Search Twitter Usernames</h1>
      <h1 className="text-xl font-bold mb-4">Input username(s) sepeated by a comma. ex,(username1,username2,usrename3 )</h1>
        <div className="flex space-x-4">
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Enter comma-separated usernames"
            value={usernames}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setUsernames(e.target.value)}
          />
          <button
            className="bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200 ease-in-out transform hover:bg-blue-800 hover:scale-105"
            onClick={searchUsernames}
          >
            Search
          </button>
        </div>
        {!result && (
          <div className="mt-4 bg-white p-4 rounded shadow">
          <p className="text-md mb-4">
            Please search usernames above seperated by a comma
          </p>

        </div>
        )}
        {result && (
          <div className="mt-4 bg-white p-4 rounded shadow">
            <p className="text-md mb-4">
              *Some usernames may show close if no exact match
            </p>
            {formatResult()}
          </div>
        )}
      </div>
      <div className="max-w-3xl mx-auto mt-4 px-4 py-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Overview</h2>
        <p className="text-gray-600 text-lg mb-4">Memory.lol is a web service that provides historical information about social media accounts. It currently has data for over 440 million Twitter accounts, with coverage going back to 2011 in most cases. The service is not open source, but its source code is available for use and modification by individuals, non-profit organizations, and worker-owned businesses.</p>
        <p className="text-gray-600 text-lg mb-4">Our application leverages Memory.lol as an API to search for historical screen names of Twitter accounts based on user input. The user simply enters a comma-separated list of usernames, and our app sends a request to Memory.lol to retrieve the corresponding historical screen names. We then display the results to the user.</p>
        <p className="text-gray-600 text-lg mb-4">It`s worth noting that Memory.lol has certain access restrictions in place to protect user privacy and safety. Public access is limited to historical facts that have been observed in the past 60 days, with some accounts excluded at the request of the owner. Full histories are provided only to a trusted group of researchers, journalists, and activists, who need to authenticate via GitHub or Google.</p>
        <p className="text-gray-600 text-lg">Memory.lol can be a valuable tool for identifying online abusers and trolls who attempt to hide their identities through changing screen names. Our app provides a convenient way for researchers, journalists, and concerned citizens to leverage this resource without needing to have technical expertise in web scraping or data analysis.</p>
      </div>
      <footer className="mt-auto text-center text-white p-4">
        <p>Powered by <a href="https://memory.lol/" className="underline" target="_blank" rel="noopener noreferrer">Memory.lol</a></p>
        <p>Memory.lol source code is available on <a href="https://github.com/travisbrown/memory.lol" className="underline" target="_blank" rel="noopener noreferrer">GitHub</a>.</p>
        <p>Created by <a href="https://twitter.com/bankkroll_eth" className="underline" target="_blank" rel="noopener noreferrer">bankkroll.eth</a></p>
      </footer>

    </div>
  );
};

export default IndexPage;