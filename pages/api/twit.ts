import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const formatData = (data: any) => {
  return data.map((username: any) => {
    const accounts = username.accounts.map((account: any) => {
      const screen_names = Object.entries(account.screen_names).map(([name, dates]: [string, any]) => {
        return {
          name,
          start_date: dates[0],
          end_date: dates[1] || null,
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

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { usernames } = req.query;

  if (!usernames) {
    res.status(400).json({ error: 'Usernames are required' });
    return;
  }

  // Split usernames by comma and trim whitespace
  const formattedUsernames = (usernames as string)
    .split(',')
    .map((username) => username.trim())
    .join(',');

  try {
    const response = await axios.get(
      `https://api.memory.lol/v1/tw/${encodeURIComponent(formattedUsernames)}`
    );
    const formattedData = formatData(Object.values(response.data));
    res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ error: error });
  }
};


export default handler;
