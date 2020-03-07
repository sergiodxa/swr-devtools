import * as React from 'react';
import { cache, mutate } from 'swr';
import { useSubscription } from 'use-subscription';
import styled from 'styled-components';

import { version } from '../package.json';

function useCacheKeys(): string[] {
  return useSubscription(
    React.useMemo(
      () => ({
        getCurrentValue() {
          return cache.keys();
        },
        subscribe(listener: () => void) {
          return cache.subscribe(listener);
        },
      }),
      []
    )
  );
}

function useCacheValue(key: string | null): any {
  return useSubscription(
    React.useMemo(
      () => ({
        getCurrentValue() {
          return cache.get(key);
        },
        subscribe(listener: () => void) {
          return cache.subscribe(listener);
        },
      }),
      [key]
    )
  );
}

function parseKey(key: string): string[] {
  return key.split('@');
}

const Main = styled.div`
  background: #ffffff;
  bottom: 0;
  color: #000000;
  display: flex;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  height: calc(100vh / 3);
  left: 0;
  line-height: 1;
  position: fixed;
  right: 0;
  width: 100%;
`;

const KeyExplorer = styled.div`
  width: calc(100% / 3);
`;

const KeyButton = styled.button<{ isActive: boolean }>`
  background: ${props => (props.isActive ? '#79ffe1' : 'none')};
  border: none;
  border-bottom: 1px solid;
  border-bottom-color: ${props => (props.isActive ? '#79ffe1' : '#eaeaea')};
  color: #000000;
  cursor: pointer;
  display: block;
  font-size: 1em;
  padding: 12px 12px;
  text-align: left;
  transition: all 100ms ease-in-out;
  width: 100%;
  &:hover {
    background: #79ffe1;
    border-bottom-color: #79ffe1;
  }
  &:focus {
    outline: none;
  }
`;

const DataExplorer = styled.div`
  flex: 1;
`;

const DataExplorerTitle = styled.div`
  align-items: center;
  background: #eaeaea;
  display: flex;
`;

const SectionTitle = styled.div`
  background: #eaeaea;
  height: 44px;
  box-sizing: border-box;
  padding: 12px;
  display: flex;
  justify-content: space-around;
  align-items: center;
`;

const Title = styled.p`
  font-weight: bold;
  font-size: 16px;
  margin: 0;
`;

const Action = styled.div`
  background: #0070f3;
  border: 1px solid #0070f3;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  padding: 4px 20px;
  transition: all 200ms ease-in-out;
  &:hover {
    background: #ffffff;
    color: #0070f3;
  }
`;

const DangerAction = styled(Action)`
  background: #e00;
  border: 1px solid #e00;
  &:hover {
    background: #ffffff;
    color: #e00;
  }
`;

const ActionsSection = styled.div`
  display: flex;
  padding: 8px;
  margin-left: auto;
  ${Action}, ${DangerAction} {
    margin-right: 8px;
  }
`;

const InlineCode = styled.code`
  color: #f81ce5;
  font-size: 1.25em;
  &::before,
  &::after {
    content: '\`';
  }
`;

const CodeBlock = styled.div`
  height: calc(100% - 44px);
  box-sizing: border-box;
  overflow-y: auto;
  padding: 12px;
`;

const KeyList = styled.div`
  height: calc(100% - 44px);
  overflow-y: auto;
`;

const Badge = styled.span`
  background: black;
  border-radius: 8px;
  color: white;
  vertical-align: middle;
  font-size: 14px;
  line-height: 1;
  padding: 4px 7px;
`;

const ErrorBadge = styled(Badge)`
  background: #ff0080;
`;

// const MainTitle = styled(SectionTitle)`
//   color: #888;
// `;

function serializeKey(parsedKey: string[]): string {
  if (isErrorKey(parsedKey)) return parsedKey.slice(1).join(', ');
  if (isArrayKey(parsedKey)) return parsedKey.slice(1).join(', ');
  return parsedKey.join(', ');
}

function isErrorKey(key: string | string[]): boolean {
  if (Array.isArray(key)) return key[0] === 'err';
  return parseKey(key)[0] === 'err';
}

function isArrayKey(key: string | string[]): boolean {
  if (Array.isArray(key)) return key[0] === 'arg';
  return parseKey(key)[0] === 'arg';
}

function SWRDevtools() {
  const keys = useCacheKeys();
  const [activeKey, setActiveKey] = React.useState<string | null>(keys[0]);
  const activeValue = useCacheValue(activeKey);

  return (
    <Main>
      <KeyExplorer>
        {/* <MainTitle>SWR Devtools {version}</MainTitle> */}
        <SectionTitle>
          <Title>Cached Keys</Title>
          <DangerAction
            onClick={() => {
              cache.clear();
              setActiveKey(null);
            }}
          >
            Delete Cache
          </DangerAction>
        </SectionTitle>
        <KeyList>
          {keys.map(key => (
            <KeyButton
              key={key}
              onClick={() => setActiveKey(key)}
              isActive={key === activeKey}
            >
              {serializeKey(parseKey(key))}
            </KeyButton>
          ))}
        </KeyList>
      </KeyExplorer>
      {activeKey && (
        <DataExplorer>
          <DataExplorerTitle>
            <SectionTitle>
              Data Explorer{' '}
              <InlineCode>{serializeKey(parseKey(activeKey))}</InlineCode>{' '}
              {isErrorKey(activeKey) && <ErrorBadge>error</ErrorBadge>}{' '}
              {isArrayKey(activeKey) && <Badge>array</Badge>}
            </SectionTitle>
            <ActionsSection>
              <Action onClick={() => mutate(activeKey)}>Revalidate</Action>
              <DangerAction
                onClick={() => {
                  cache.delete(activeKey);
                  setActiveKey(keys[0]);
                }}
              >
                Delete
              </DangerAction>
            </ActionsSection>
          </DataExplorerTitle>
          <CodeBlock>
            <pre>
              <code>{JSON.stringify(activeValue, null, 2)}</code>
            </pre>
          </CodeBlock>
        </DataExplorer>
      )}
    </Main>
  );
}

export default SWRDevtools;
