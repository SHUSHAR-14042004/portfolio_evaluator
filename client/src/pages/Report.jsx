import { useParams } from 'react-router-dom';

export default function Report() {
  const { username } = useParams();
  return <h2>Scorecard for: {username}</h2>;
}