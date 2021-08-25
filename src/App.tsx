import React from 'react';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql
} from "@apollo/client";

const SIMPLE_EXPERT_FRAGMENT = gql`
fragment SimpleExpert on ExpertiseSource {
  id
  account {
    id
  }
  name
  online
  available
  pricing {
    costPerMinute
  }
  noShowFee
  bio
  image {
    url
  }
  rating {
    average
    count
  }
}
`

const GET_GROUP_SESSIONS = gql`
${SIMPLE_EXPERT_FRAGMENT}

fragment FullGroupSession on OpenGroupScheduledConversation {
  id
  expert {
    ...SimpleExpert
  }
  tags {
    id
    label
  }
  title
  description
  recordingEnabled
  date
  startTime
  intendedDuration
  imageUrl
  videoUrl
  maxCustomers
  openSpots
  account {
    id
    features {
      skillSpringFedDisableStripe
    }
  }
  conversation {
    id
  }
  seriesParts {
    id
    date
    intendedDuration
  }
}

query GetGroupSessions(
  $first: Int
  $after: String
  $startDate: Date
  $endDate: Date
  $tags: [String!]
) {
  groupSessions(
    first: $first
    after: $after
    startDate: $startDate
    endDate: $endDate
    tags: $tags
    includeSeries: true
  ) {
    pageInfo {
      endCursor
      hasNextPage
    }

    edges {
      node {
        ...FullGroupSession
        pricing {
          totalCost
          noShowFee
        }
      }
    }
  }
}`

const GET_EXPERTS = gql`
${SIMPLE_EXPERT_FRAGMENT}

query GetExpertiseSources(
  $first: Int
  $after: String
  $tag: String
) {
  expertiseSources(
    first: $first
    after: $after
    tag: $tag
  ) {
    edges {
      node {
        ...SimpleExpert
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}`

const LIFE_TAGS = [
  'skill:lx:activity',
  'skill:lx:fasting',
  'skill:lx:meditation',
  'skill:lx:nutrition',
  'skill:lx:sleep',
] as const;

type LifeTag = typeof LIFE_TAGS[number];

const TAG_DISPLAY_NAME: Record<LifeTag, string> = {
  'skill:lx:activity': 'Activity',
  "skill:lx:fasting": 'Fasting',
  "skill:lx:meditation": 'Mediation',
  "skill:lx:nutrition": 'Nutrition',
  "skill:lx:sleep": 'Sleep'
}

// The implementation of these come from skillspringDialogUtils.js
declare global {
  const openSkillSpringExpertDialog: (account: string, expert: string) => void
  const openSkillSpringGroupSessionDialog: (groupSessionId: string) => void
}

const Expert: React.FC<{ node: any }> = ({ node }) => {
  const onClick = () => {
    openSkillSpringExpertDialog(node.account.id, node.id)
  }
  return <div role="button" onClick={onClick} style={{ marginBottom: '.25em',  cursor: 'pointer' }}>{node.name}</div>
}

const Experts: React.FC<{tag: LifeTag}> = ({ tag }) => {
  const { loading, error, data } = useQuery(GET_EXPERTS, {
    variables: { tag }
  });

  if (loading) return <span>Loading Experts...</span>;
  if (error) return <span>Error Loading Experts! {error.message}</span>;

  return (
    <div>
      <h4>Experts</h4>
      {data.expertiseSources.edges.map(({ node }: {node: any}) => <Expert node={node}/>)}
    </div>
  );
}

const GroupSession: React.FC<{ node: any }> = ({ node }) => {
  const onClick = () => {
    openSkillSpringGroupSessionDialog(node.id)
  }
  return <div role="button" onClick={onClick} style={{ marginBottom: '.25em', cursor: 'pointer' }}>{node.title} at {node.startTime}</div>
}

const GroupSessions: React.FC<{tag: LifeTag}> = ({ tag }) => {
  const { loading, error, data } = useQuery(GET_GROUP_SESSIONS, {
    variables: { tags: [tag] }
  });

  if (loading) return <span>Loading Group Sessions...</span>;
  if (error) return <span>Error Loading Group Sessions! {error.message}</span>;

  return (
  <div style={{display: 'flex', flexDirection: 'column'}}>
      <h4>Group Sessions</h4>
      {data.groupSessions.edges.length ? data.groupSessions.edges.map(({ node }: { node: any }) => (<GroupSession node={node}/>)) : <div>No Sessions Found</div>}
    </div>
  );
}

const Pillar: React.FC<{ tag: LifeTag }> = ({ tag }) => 
  <div style={{display: 'flex', flexDirection: 'column'}}>
    <h3>{TAG_DISPLAY_NAME[tag]}</h3>
    <div style={{display: 'flex', flexDirection: 'row'}}>
    <Experts tag={tag}/>
    <div style={{width: 16}}/>
    <GroupSessions tag={tag}/></div>
  </div>


function App() {
  const client = new ApolloClient({
    uri: 'https://api.us.skillspring.com/v1/connect/open/graphql',
    headers: {
      'LifeOmic-Account': 'lifeapps'
    },
    cache: new InMemoryCache()
  });

  return (
    <ApolloProvider client={client}>
      <div className="App">
        {LIFE_TAGS.map(tag => <>
          <Pillar tag={tag} />
          <div style={{ height: 32 }}/>
        </>)}
      </div>
    </ApolloProvider>
  );
}

export default App;
