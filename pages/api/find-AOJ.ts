// pages/api/findAOJ.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { findAOJ } from '@/lib/find-AOJ';

type Data = any;

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>,
){
    const body = req.body;

  if (!body.lat || !body.lon) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  const result = findAOJ(body.lat, body.lon);
  if (result) {
    res.status(200).json(result);
  } else {
    res.status(404).json({ error: 'Area not found' });
  }
}
